const pool = require('../../config/db');

const TIPOS = { mandato: 'Mandato Judicial', contrato: 'Contrato de Prestación de Servicios' };

const clp = (n) =>
  '$' + new Intl.NumberFormat('es-CL').format(Math.round(Number(n) || 0));

const hoyLargo = () => {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
    'agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
};

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Placeholder visible cuando falta un dato (el abogado lo completa a mano). */
const ph = (v, n = 24) => (v && String(v).trim()) ? esc(v) : '_'.repeat(n);

async function cargarContexto(clienteId, { rol, usuarioId }) {
  const params = rol === 'admin' ? [clienteId] : [usuarioId, clienteId];
  const filtro = rol === 'admin' ? '' : 'AND c.abogado_id = $1';
  const pId    = rol === 'admin' ? '$1' : '$2';

  const { rows } = await pool.query(
    `SELECT c.*, u.nombre AS abogado_nombre, u.email AS abogado_email
     FROM clientes c
     LEFT JOIN usuarios u ON u.id = c.abogado_id
     WHERE c.id = ${pId} ${filtro}`,
    params
  );
  const cliente = rows[0];
  if (!cliente) return null;

  // Causa + acuerdo más recientes (para el objeto y honorarios del contrato)
  const { rows: cau } = await pool.query(
    `SELECT ca.id, ca.titulo, ca.materia,
            a.monto_total, a.id AS acuerdo_id
     FROM causas ca
     LEFT JOIN acuerdos_cobro a ON a.causa_id = ca.id
     WHERE ca.cliente_id = $1
     ORDER BY ca.creado_en DESC LIMIT 1`,
    [cliente.id]
  );
  let acuerdo = cau[0] || null;
  if (acuerdo?.acuerdo_id) {
    const { rows: q } = await pool.query(
      `SELECT COUNT(*)::int AS n, COALESCE(MAX(monto),0) AS monto_cuota
       FROM cuotas WHERE acuerdo_id = $1`,
      [acuerdo.acuerdo_id]
    );
    acuerdo.num_cuotas = q[0].n;
    acuerdo.monto_cuota = q[0].monto_cuota;
  }
  return { cliente, causa: acuerdo };
}

function nombreCompleto(c) {
  return [c.nombre, c.apellidos].filter(Boolean).join(' ');
}
function domicilio(c) {
  return [c.direccion, c.comuna && `comuna de ${c.comuna}`, c.region && `Región ${c.region}`]
    .filter(Boolean).join(', ');
}

function plantillaMandato({ cliente, abogado }) {
  const nom = nombreCompleto(cliente);
  return `
<h1>MANDATO JUDICIAL</h1>
<p>En <strong>${ph(null, 18)}</strong>, a ${hoyLargo()}, comparece
don(ña) <strong>${esc(nom)}</strong>, ${ph(cliente.nacionalidad, 12)},
${ph(cliente.estado_civil, 12)}, ${ph(cliente.ocupacion, 16)}, cédula nacional de
identidad N° <strong>${ph(cliente.rut, 12)}</strong>, domiciliado(a) en
${ph(domicilio(cliente), 30)}, en adelante "el Mandante", y expone:</p>

<p>Que por el presente instrumento viene en conferir <strong>poder y mandato
judicial</strong> tan amplio como en derecho sea necesario a el(la) abogado(a)
don(ña) <strong>${ph(abogado, 24)}</strong>, cédula de identidad N° ${ph(null, 12)},
para que en su nombre y representación comparezca ante los Tribunales de
Justicia, tribunales arbitrales, administrativos y cualquier otra autoridad,
representándolo en todas las gestiones, trámites y actuaciones judiciales y
extrajudiciales que digan relación con sus asuntos.</p>

<p>El mandatario queda investido de todas las facultades ordinarias y
extraordinarias del <strong>artículo 7° del Código de Procedimiento Civil</strong>,
en sus <strong>dos incisos</strong>, las que se dan aquí por expresamente
reproducidas, especialmente las facultades de desistirse en primera instancia de
la acción deducida, aceptar la demanda contraria, absolver posiciones, renunciar
a los recursos y a los términos legales, transigir, comprometer, otorgar a los
árbitros facultades de arbitradores, aprobar convenios y percibir.</p>

<p>El mandante podrá revocar el presente mandato en cualquier tiempo conforme a
la ley.</p>

<div class="firmas">
  <div><div class="linea"></div>${esc(nom)}<br><span>Mandante · RUT ${ph(cliente.rut, 10)}</span></div>
  <div><div class="linea"></div>${ph(abogado, 18)}<br><span>Abogado(a) patrocinante</span></div>
</div>`;
}

function plantillaContrato({ cliente, abogado, causa }) {
  const nom = nombreCompleto(cliente);
  const objeto = causa?.titulo
    ? `la asesoría y representación legal en la causa "${esc(causa.titulo)}"${causa.materia ? ` (materia: ${esc(causa.materia)})` : ''}`
    : 'la prestación de servicios de asesoría y representación legal';
  let honorarios;
  if (causa?.monto_total > 0) {
    const n = causa.num_cuotas || 1;
    honorarios = `Las partes acuerdan honorarios profesionales por la suma total de
      <strong>${clp(causa.monto_total)}</strong>, que el Cliente pagará
      ${n > 1
        ? `en <strong>${n} cuotas</strong> de ${clp(causa.monto_cuota)} cada una,
           según el calendario acordado entre las partes`
        : 'en la forma y oportunidad acordadas entre las partes'}.`;
  } else {
    honorarios = `Las partes acuerdan que los honorarios profesionales serán de
      <strong>$${'_'.repeat(12)}</strong>, pagaderos en la forma que se indique
      en anexo o se acuerde entre las partes.`;
  }
  return `
<h1>CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES</h1>
<p>En <strong>${ph(null, 18)}</strong>, a ${hoyLargo()}, entre don(ña)
<strong>${esc(nom)}</strong>, cédula nacional de identidad N°
<strong>${ph(cliente.rut, 12)}</strong>, domiciliado(a) en ${ph(domicilio(cliente), 28)},
en adelante "<strong>el Cliente</strong>"; y don(ña)
<strong>${ph(abogado, 22)}</strong>, abogado(a), en adelante
"<strong>el Profesional</strong>", se ha convenido el siguiente contrato:</p>

<p><strong>PRIMERO. Objeto.</strong> El Profesional prestará al Cliente sus
servicios profesionales consistentes en ${objeto}, obligándose a desempeñarlos
con la debida diligencia y conforme a la ética profesional.</p>

<p><strong>SEGUNDO. Honorarios.</strong> ${honorarios}</p>

<p><strong>TERCERO. Gastos.</strong> Los gastos, costas, derechos y demás
desembolsos que demande la gestión serán de cargo del Cliente, salvo pacto
distinto por escrito.</p>

<p><strong>CUARTO. Obligaciones del Cliente.</strong> El Cliente se obliga a
proporcionar oportunamente los antecedentes y documentos necesarios y a pagar
los honorarios en la forma pactada.</p>

<p><strong>QUINTO. Término.</strong> El presente contrato podrá terminar por
cumplimiento del encargo, mutuo acuerdo o conforme a la ley, sin perjuicio de
los honorarios devengados.</p>

<p>Para constancia, firman en dos ejemplares de igual tenor y fecha.</p>

<div class="firmas">
  <div><div class="linea"></div>${esc(nom)}<br><span>El Cliente · RUT ${ph(cliente.rut, 10)}</span></div>
  <div><div class="linea"></div>${ph(abogado, 18)}<br><span>El Profesional</span></div>
</div>`;
}

async function generar(clienteId, tipo, ctx) {
  if (!TIPOS[tipo]) throw { status: 400, mensaje: 'Tipo de documento inválido' };
  const data = await cargarContexto(clienteId, ctx);
  if (!data) return null;

  const abogado = data.cliente.abogado_nombre;
  const cuerpo = tipo === 'mandato'
    ? plantillaMandato({ cliente: data.cliente, abogado })
    : plantillaContrato({ cliente: data.cliente, abogado, causa: data.causa });

  return {
    tipo,
    titulo: TIPOS[tipo],
    cliente: nombreCompleto(data.cliente),
    fecha: hoyLargo(),
    html: cuerpo,
  };
}

module.exports = { generar, TIPOS };
