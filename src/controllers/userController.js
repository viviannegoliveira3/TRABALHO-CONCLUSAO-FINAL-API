const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const users = require('../models/userModel'); // Nosso "banco de dados" em memória

// ATENÇÃO: Em um projeto real, esta chave secreta NUNCA deve ser exposta no código.
// Use variáveis de ambiente (process.env.JWT_SECRET).
const JWT_SECRET = 'your-super-secret-and-long-key';

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Verifica se o usuário já existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o "salt rounds"

    const newUser = { id: users.length + 1, name, email, password: hashedPassword };
    users.push(newUser);

    // Retorna o usuário criado (sem a senha)
    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Encontra o usuário pelo email
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Usuário não encontrado
    }

    // Compara a senha enviada com a senha criptografada no "banco"
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Senha incorreta
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = { register, login };