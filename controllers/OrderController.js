const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Currency = require('../models/Currency');

exports.placeOrder = async (req, res) => {
  try {
    const { order_type, currency_code, payment_currency, quantity, price } = req.body;
    
    // Check if currencies exist and are active
    const tradeCurrency = await Currency.findOne({ 
      currency_code,
      is_active: true
    });
    
    const paymentCurrencyObj = await Currency.findOne({ 
      currency_code: payment_currency,
      is_active: true
    });
    
    if (!tradeCurrency || !paymentCurrencyObj) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid currency selection'
      });
    }
    
    // Check if user has the necessary wallet
    let requiredWallet;
    
    if (order_type === 'buy') {
      // For buy orders, check payment currency wallet
      requiredWallet = await Wallet.findOne({
        user_id: req.user.id,
        currency_code: payment_currency
      });
      
      // Check sufficient funds (price * quantity)
      if (!requiredWallet || requiredWallet.balance < price * quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient funds in your payment currency wallet'
        });
      }
    } else {
      // For sell orders, check trade currency wallet
      requiredWallet = await Wallet.findOne({
        user_id: req.user.id,
        currency_code
      });
      
      // Check sufficient crypto
      if (!requiredWallet || requiredWallet.balance < quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient crypto balance in your wallet'
        });
      }
    }
    
    // Create order
    const order = new Order({
      user_id: req.user.id,
      order_type,
      currency_code,
      payment_currency,
      quantity,
      price,
      status: 'pending',
      created_at: new Date()
    });
    
    await order.save();
    
    // Lock funds for the order
    if (order_type === 'buy') {
      requiredWallet.balance -= (price * quantity);
    } else {
      requiredWallet.balance -= quantity;
    }
    
    requiredWallet.last_updated = new Date();
    await requiredWallet.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        order_id: order._id,
        type: order.order_type,
        currency: order.currency_code,
        payment_currency: order.payment_currency,
        quantity: order.quantity,
        price: order.price,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { user_id: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query).sort({ created_at: -1 });
    
    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user.id,
      status: 'pending'
    });
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found or cannot be cancelled'
      });
    }
    
    // Return locked funds to wallet
    let wallet;
    
    if (order.order_type === 'buy') {
      wallet = await Wallet.findOne({
        user_id: req.user.id,
        currency_code: order.payment_currency
      });
      
      wallet.balance += (order.price * order.quantity);
    } else {
      wallet = await Wallet.findOne({
        user_id: req.user.id,
        currency_code: order.currency_code
      });
      
      wallet.balance += order.quantity;
    }
    
    wallet.last_updated = new Date();
    await wallet.save();
    
    // Update order status
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};