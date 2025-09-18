const express = require('express');
const router = express.Router();

// Mock de um controller, substitua pela sua lógica real
const userController = {
  register: (req, res) => {
    // Lógica de registro aqui...
    res.status(201).json({ message: 'User registered' });
  },
  login: (req, res) => {
    // Lógica de login aqui...
    res.status(200).json({ token: 'fake-jwt-token' });
  },
};

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;