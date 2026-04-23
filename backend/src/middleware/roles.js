function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
  }
  next();
}

function soloAbogado(req, res, next) {
  if (!['admin', 'abogado'].includes(req.usuario?.rol)) {
    return res.status(403).json({ mensaje: 'Acceso no autorizado' });
  }
  next();
}

module.exports = { soloAdmin, soloAbogado };
