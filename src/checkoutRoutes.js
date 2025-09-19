const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
// Importa o controller real
const checkoutController = require('./controllers/checkoutController');

// Adaptador para a API REST
const processRest = (req, res) => {
  try {
    // req.user é adicionado pelo authMiddleware
    const result = checkoutController.processCheckoutLogic(req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

router.post('/', authMiddleware, processRest);

module.exports = router;