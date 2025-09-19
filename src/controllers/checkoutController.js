const products = require('../productModel');

/**
 * Processa a lógica de checkout.
 * @param {object} checkoutData - Dados do checkout (items, freight, paymentMethod).
 * @param {object} user - Dados do usuário decodificados do token JWT.
 * @returns {object} O resultado do checkout.
 */
const processCheckoutLogic = (checkoutData, user) => {
  const { items, freight, paymentMethod } = checkoutData;

  if (!items || items.length === 0) {
    throw new Error('Checkout must have at least one item.');
  }

  let totalItemsValue = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`Product with id ${item.productId} not found.`);
    }
    totalItemsValue += product.price * item.quantity;
  }

  let valorFinal = totalItemsValue + freight;

  // Aplica 5% de desconto para pagamentos com cartão de crédito
  if (paymentMethod === 'credit_card') {
    valorFinal *= 0.95;
  }

  return {
    userId: user.id,
    items,
    freight,
    paymentMethod,
    valorFinal: parseFloat(valorFinal.toFixed(2)),
  };
};

// Adaptador para a API GraphQL
const processGraphQL = (parent, args, context) => {
  if (!context.user) {
    throw new Error('Authorization token is required.');
  }
  return processCheckoutLogic(args, context.user);
};

module.exports = { processCheckoutLogic, processGraphQL };