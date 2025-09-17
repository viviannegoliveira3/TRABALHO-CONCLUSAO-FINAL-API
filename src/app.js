const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET = 'supersecret';
const users = [{ username: 'user', password: 'pass', balance: 100 }];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

app.post('/api/transfer', authenticate, (req, res) => {
  const { amount } = req.body;
  const user = users.find(u => u.username === req.user.username);
  if (!user || user.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });
  user.balance -= amount;
  res.json({ balance: user.balance });
});

module.exports = app;
