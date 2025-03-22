const Wallet = require('../models/Wallet');
const Currency = require('../models/Currency');
const Transaction = require('../models/Transaction');

exports.getUserWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user_id: req.user.id });
    
    const walletData = await Promise.all(wallets.map(async (wallet) => {
      const currency = await wallet.getCurrency();
      return {
        id: wallet._id,
        currency_code: wallet.currency_code,
        currency_name: currency.name,
        balance: wallet.balance,
        wallet_address: wallet.wallet_address,
        created_at: wallet.created_at
      };
    }));
    
    res.status(200).json({
      status: 'success',
      data: walletData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getWalletTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      user_id: req.user.id
    });
    
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }
    
    const transactions = await wallet.getTransactions();
    
    const transactionData = await Promise.all(transactions.map(async (tx) => {
      const senderWallet = await tx.getSenderWallet();
      const receiverWallet = await tx.getReceiverWallet();
      
      return {
        id: tx._id,
        type: tx.transaction_type,
        amount: tx.amount,
        fee: tx.fee,
        status: tx.status,
        timestamp: tx.timestamp,
        sender: senderWallet ? {
          wallet_id: senderWallet._id,
          currency: senderWallet.currency_code,
        } : null,
        receiver: receiverWallet ? {
          wallet_id: receiverWallet._id,
          currency: receiverWallet.currency_code,
        } : null,
        blockchain_tx_id: tx.blockchain_tx_id
      };
    }));
    
    res.status(200).json({
      status: 'success',
      data: transactionData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.transferFunds = async (req, res) => {
  try {
    const { sender_wallet_id, receiver_address, amount } = req.body;
    
    // Find sender wallet and ensure it belongs to the authenticated user
    const senderWallet = await Wallet.findOne({
      _id: sender_wallet_id,
      user_id: req.user.id
    });
    
    if (!senderWallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Sender wallet not found'
      });
    }
    
    // Check sufficient balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }
    
    // Find currency to calculate fee
    const currency = await senderWallet.getCurrency();
    const fee = amount * (currency.transaction_fee / 100);
    
    // Find receiver wallet by address (internal transfer)
    const receiverWallet = await Wallet.findOne({ 
      wallet_address: receiver_address,
      currency_code: senderWallet.currency_code
    });
    
    // Create transaction
    const transaction = new Transaction({
      sender_wallet_id: senderWallet._id,
      receiver_wallet_id: receiverWallet ? receiverWallet._id : null,
      transaction_type: receiverWallet ? 'transfer' : 'withdrawal',
      amount,
      fee,
      status: 'pending',
      blockchain_tx_id: receiverWallet ? null : `tx_${Date.now()}` // Mock blockchain tx ID
    });
    
    // Update sender wallet balance
    senderWallet.balance -= (amount + fee);
    senderWallet.last_updated = new Date();
    await senderWallet.save();
    
    // If internal transfer, update receiver wallet
    if (receiverWallet) {
      receiverWallet.balance += amount;
      receiverWallet.last_updated = new Date();
      await receiverWallet.save();
      
      // Complete transaction immediately for internal transfers
      transaction.status = 'completed';
    }
    
    await transaction.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        transaction_id: transaction._id,
        amount,
        fee,
        status: transaction.status,
        type: transaction.transaction_type
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};