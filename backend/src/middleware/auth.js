const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken };
