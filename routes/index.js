const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const WalletController = require('../controllers/WalletController');
const OrderController = require('../controllers/OrderController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/api/debug-token', (req, res) => {
    res.json({ received_token: req.header('Authorization') });
});

// Wallet routes
router.get('/wallets', auth, WalletController.getUserWallets);
router.get('/wallets/:walletId/transactions', auth, WalletController.getWalletTransactions);
router.post('/wallets/transfer', auth, WalletController.transferFunds);

// Order routes
router.post('/orders', auth, OrderController.placeOrder);
router.get('/orders', auth, OrderController.getUserOrders);
router.patch('/orders/:orderId/cancel', auth, OrderController.cancelOrder);

module.exports = router;