const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const checkoutController = {
  process: (req, res) => {
    res.status(200).json({ message: 'Checkout successful' });
  },
};

router.post('/', authMiddleware, checkoutController.process);

module.exports = router;