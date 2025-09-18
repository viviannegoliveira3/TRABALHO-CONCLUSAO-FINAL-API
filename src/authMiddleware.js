const jwt = require('jsonwebtoken');

// ATENÇÃO: Em um projeto real, esta chave secreta NUNCA deve ser exposta no código.
// Use variáveis de ambiente (process.env.JWT_SECRET).
const JWT_SECRET = 'your-super-secret-and-long-key';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adiciona os dados do usuário (ex: id, email) à requisição
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;