// Exemplo de controller para transferência
const jwt = require('jsonwebtoken');
const SECRET = 'supersecret';
const users = [{ username: 'user', password: 'pass', balance: 100 }];

exports.transfer = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const { amount } = req.body;
  const user = users.find(u => u.username === decoded.username);
  if (!user || user.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });
  user.balance -= amount;
  res.json({ balance: user.balance });
};
