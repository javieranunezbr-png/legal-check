const svc       = require('./presupuestos.service');
const emailSvc  = require('../../services/email');
const pool      = require('../../config/db');

const ctx = (req) => ({ rol: req.usuario.rol, usuarioId: req.usuario.id });

async function listar(req, res) {
  try {
    res.json(await svc.listar(ctx(req)));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener presupuestos' });
  }
}

async function obtener(req, res) {
  try {
    const p = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener presupuesto' });
  }
}

async function obtenerPublico(req, res) {
  try {
    const p = await svc.obtenerPorToken(req.params.token);
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    // No exponer datos internos sensibles
    const { id, abogado_id, ...publico } = p;
    res.json(publico);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener presupuesto' });
  }
}

async function crear(req, res) {
  try {
    const { nombre_prospecto } = req.body;
    if (!nombre_prospecto) {
      return res.status(400).json({ mensaje: 'El nombre del prospecto es requerido' });
    }
    const p = await svc.crear(req.body, req.usuario.id);
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear presupuesto' });
  }
}

async function actualizar(req, res) {
  try {
    const p = await svc.actualizar(req.params.id, req.body, ctx(req));
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar presupuesto' });
  }
}

async function responder(req, res) {
  try {
    const { accion } = req.body;
    const p = await svc.responder(req.params.token, accion);
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json({ estado: p.estado, respondido_en: p.respondido_en });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al responder presupuesto' });
  }
}

async function eliminar(req, res) {
  try {
    const ok = await svc.eliminar(req.params.id, ctx(req));
    if (!ok) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json({ mensaje: 'Presupuesto eliminado' });
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar presupuesto' });
  }
}

async function enviarCorreo(req, res) {
  try {
    const p = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });

    const { asunto, mensaje, destinatario } = req.body;
    const correoDestino = (destinatario || p.correo || '').trim();
    if (!correoDestino) {
      return res.status(400).json({ mensaje: 'El prospecto no tiene correo registrado' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/presupuesto/${p.token_unico}`;

    await emailSvc.enviarPresupuesto({
      destinatario: correoDestino,
      asunto: asunto || 'Presupuesto de servicios legales - Law Kit',
      mensaje: mensaje || `Hola ${p.nombre_prospecto}, te enviamos el presupuesto por nuestros servicios legales. Puedes revisarlo y aceptarlo en este link: [link]. Quedamos atentos a cualquier consulta.`,
      link,
      nombreAbogado: p.abogado_nombre,
      emailAbogado:  p.abogado_email,
    });

    // Marca como enviado si estaba en borrador
    if (p.estado === 'borrador') {
      await pool.query(
        `UPDATE presupuestos SET estado = 'enviado' WHERE id = $1`,
        [p.id]
      );
    }

    res.json({ mensaje: 'Correo enviado', destinatario: correoDestino });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al enviar correo' });
  }
}

async function marcarEnviado(req, res) {
  try {
    const p = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    if (p.estado === 'borrador') {
      await pool.query(
        `UPDATE presupuestos SET estado = 'enviado' WHERE id = $1`,
        [p.id]
      );
    }
    res.json({ mensaje: 'Marcado como enviado' });
  } catch {
    res.status(500).json({ mensaje: 'Error al marcar como enviado' });
  }
}

module.exports = {
  listar, obtener, obtenerPublico, crear, actualizar, responder, eliminar,
  enviarCorreo, marcarEnviado,
};
