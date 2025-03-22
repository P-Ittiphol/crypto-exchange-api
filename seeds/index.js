const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Currency = require('../models/Currency');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const PaymentMethod = require('../models/PaymentMethod');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// Seed Currencies
const seedCurrencies = async () => {
  try {
    await Currency.deleteMany({});
    
    const currencies = [
      {
        currency_code: 'THB',
        name: 'Thai Baht',
        type: 'fiat',
        transaction_fee: 0.5,
        is_active: true
      },
      {
        currency_code: 'USD',
        name: 'US Dollar',
        type: 'fiat',
        transaction_fee: 0.5,
        is_active: true
      },
      {
        currency_code: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        transaction_fee: 0.1,
        is_active: true
      },
      {
        currency_code: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        transaction_fee: 0.2,
        is_active: true
      },
      {
        currency_code: 'XRP',
        name: 'Ripple',
        type: 'crypto',
        transaction_fee: 0.3,
        is_active: true
      },
      {
        currency_code: 'DOGE',
        name: 'Dogecoin',
        type: 'crypto',
        transaction_fee: 0.5,
        is_active: true
      }
    ];
    
    await Currency.insertMany(currencies);
    console.log('Currencies seeded successfully');
    return currencies;
  } catch (error) {
    console.error('Error seeding currencies:', error);
    return [];
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    await User.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    const users = [
      {
        username: 'thaitrader1',
        email: 'thaitrader1@example.com',
        password_hash,
        phone_number: '+6611111111',
        registration_date: new Date('2023-01-01'),
        kyc_status: 'verified',
        last_login: new Date()
      },
      {
        username: 'cryptowhale',
        email: 'cryptowhale@example.com',
        password_hash,
        phone_number: '+6622222222',
        registration_date: new Date('2023-01-15'),
        kyc_status: 'verified',
        last_login: new Date()
      },
      {
        username: 'newbie_investor',
        email: 'newbie@example.com',
        password_hash,
        phone_number: '+6633333333',
        registration_date: new Date('2023-02-01'),
        kyc_status: 'pending',
        last_login: new Date()
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

// Seed Wallets
const seedWallets = async (users, currencies) => {
  try {
    await Wallet.deleteMany({});
    
    const wallets = [];
    
    for (const user of users) {
      for (const currency of currencies) {
        let balance = 0;
        
        // Set initial balances
        if (currency.type === 'fiat') {
          balance = currency.currency_code === 'THB' ? 100000 : 3000;
        } else {
          // Crypto balances
          switch (currency.currency_code) {
            case 'BTC':
              balance = 0.1;
              break;
            case 'ETH':
              balance = 2;
              break;
            case 'XRP':
              balance = 1000;
              break;
            case 'DOGE':
              balance = 5000;
              break;
            default:
              balance = 0;
          }
        }
        
        // Generate random wallet address for crypto
        const walletAddress = currency.type === 'crypto' 
          ? `${currency.currency_code}_${Math.random().toString(36).substring(2, 15)}`
          : null;
        
        wallets.push({
          user_id: user._id,
          currency_code: currency.currency_code,
          balance,
          wallet_address: walletAddress,
          created_at: new Date(),
          last_updated: new Date()
        });
      }
    }
    
    const createdWallets = await Wallet.insertMany(wallets);
    console.log('Wallets seeded successfully');
    return createdWallets;
  } catch (error) {
    console.error('Error seeding wallets:', error);
    return [];
  }
};

// Seed Payment Methods
const seedPaymentMethods = async (users) => {
  try {
    await PaymentMethod.deleteMany({});
    
    const paymentMethods = [];
    
    // User 1 payment methods
    paymentMethods.push({
      user_id: users[0]._id,
      method_type: 'bank_account',
      account_number: '1234567890',
      bank_name: 'Kasikorn Bank',
      account_name: 'Thai Trader One',
      is_active: true
    });
    
    paymentMethods.push({
      user_id: users[0]._id,
      method_type: 'prompt_pay',
      account_number: '+6611111111',
      is_active: true
    });
    
    // User 2 payment methods
    paymentMethods.push({
      user_id: users[1]._id,
      method_type: 'bank_account',
      account_number: '0987654321',
      bank_name: 'Bangkok Bank',
      account_name: 'Crypto Whale',
      is_active: true
    });
    
    paymentMethods.push({
      user_id: users[1]._id,
      method_type: 'credit_card',
      account_number: '4111111111111111',
      account_name: 'CRYPTO WHALE',
      is_active: true
    });
    
    // User 3 payment methods
    paymentMethods.push({
      user_id: users[2]._id,
      method_type: 'bank_account',
      account_number: '1122334455',
      bank_name: 'Siam Commercial Bank',
      account_name: 'Newbie Investor',
      is_active: true
    });
    
    const createdPaymentMethods = await PaymentMethod.insertMany(paymentMethods);
    console.log('Payment methods seeded successfully');
    return createdPaymentMethods;
  } catch (error) {
    console.error('Error seeding payment methods:', error);
    return [];
  }
};

// Seed Orders
const seedOrders = async (users, wallets) => {
  try {
    await Order.deleteMany({});
    
    const orders = [
      {
        user_id: users[0]._id,
        order_type: 'buy',
        currency_code: 'BTC',
        payment_currency: 'THB',
        quantity: 0.01,
        price: 1200000, // Price per BTC in THB
        status: 'pending',
        created_at: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        user_id: users[0]._id,
        order_type: 'sell',
        currency_code: 'ETH',
        payment_currency: 'THB',
        quantity: 0.5,
        price: 60000, // Price per ETH in THB
        status: 'completed',
        created_at: new Date(Date.now() - 172800000), // 2 days ago
        completed_at: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        user_id: users[1]._id,
        order_type: 'buy',
        currency_code: 'ETH',
        payment_currency: 'THB',
        quantity: 1,
        price: 58000, // Price per ETH in THB
        status: 'matched',
        created_at: new Date(Date.now() - 43200000) // 12 hours ago
      },
      {
        user_id: users[1]._id,
        order_type: 'sell',
        currency_code: 'BTC',
        payment_currency: 'USD',
        quantity: 0.02,
        price: 35000, // Price per BTC in USD
        status: 'pending',
        created_at: new Date()
      },
      {
        user_id: users[2]._id,
        order_type: 'buy',
        currency_code: 'DOGE',
        payment_currency: 'THB',
        quantity: 1000,
        price: 10, // Price per DOGE in THB
        status: 'pending',
        created_at: new Date(Date.now() - 21600000) // 6 hours ago
      }
    ];
    
    const createdOrders = await Order.insertMany(orders);
    console.log('Orders seeded successfully');
    return createdOrders;
  } catch (error) {
    console.error('Error seeding orders:', error);
    return [];
  }
};

// Seed Transactions
const seedTransactions = async (users, wallets, orders) => {
  try {
    await Transaction.deleteMany({});
    
    // Helper function to find wallet by user ID and currency code
    const findWallet = (userId, currencyCode) => {
      return wallets.find(w => 
        w.user_id.toString() === userId.toString() && 
        w.currency_code === currencyCode
      );
    };
    
    const transactions = [];
    
    // Transaction for completed order (User 0 selling ETH)
    const sellerWallet = findWallet(users[0]._id, 'ETH');
    const buyerWallet = findWallet(users[1]._id, 'ETH');
    const thbSellerWallet = findWallet(users[0]._id, 'THB');
    const thbBuyerWallet = findWallet(users[1]._id, 'THB');
    
    transactions.push({
      sender_wallet_id: sellerWallet._id,
      receiver_wallet_id: buyerWallet._id,
      order_id: orders[1]._id, // The completed sell order
      transaction_type: 'trade',
      amount: 0.5, // ETH amount
      fee: 0.001, // ETH fee
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000), // Yesterday
    });
    
    transactions.push({
      sender_wallet_id: thbBuyerWallet._id,
      receiver_wallet_id: thbSellerWallet._id,
      order_id: orders[1]._id, // The completed sell order
      transaction_type: 'trade',
      amount: 30000, // THB amount (0.5 ETH * 60000 THB)
      fee: 150, // THB fee
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000), // Yesterday
    });
    
    // Internal transfer transaction (User 0 sending BTC to User 2)
    const btcSenderWallet = findWallet(users[0]._id, 'BTC');
    const btcReceiverWallet = findWallet(users[2]._id, 'BTC');
    
    transactions.push({
      sender_wallet_id: btcSenderWallet._id,
      receiver_wallet_id: btcReceiverWallet._id,
      transaction_type: 'transfer',
      amount: 0.005, // BTC amount
      fee: 0.0001, // BTC fee
      status: 'completed',
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    });
    
    // External withdrawal transaction (User 1 withdrawing ETH)
    const ethWallet = findWallet(users[1]._id, 'ETH');
    
    transactions.push({
      sender_wallet_id: ethWallet._id,
      transaction_type: 'withdrawal',
      amount: 0.2, // ETH amount
      fee: 0.001, // ETH fee
      status: 'completed',
      timestamp: new Date(Date.now() - 21600000), // 6 hours ago
      blockchain_tx_id: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    });
    
    // External deposit transaction (User 2 depositing DOGE)
    const dogeWallet = findWallet(users[2]._id, 'DOGE');
    
    transactions.push({
      receiver_wallet_id: dogeWallet._id,
      transaction_type: 'deposit',
      amount: 500, // DOGE amount
      fee: 0, // No fee for deposits
      status: 'completed',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      blockchain_tx_id: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    });
    
    const createdTransactions = await Transaction.insertMany(transactions);
    console.log('Transactions seeded successfully');
    return createdTransactions;
  } catch (error) {
    console.error('Error seeding transactions:', error);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    const currencies = await seedCurrencies();
    const users = await seedUsers();
    const wallets = await seedWallets(users, currencies);
    const paymentMethods = await seedPaymentMethods(users);
    const orders = await seedOrders(users, wallets);
    const transactions = await seedTransactions(users, wallets, orders);
    
    console.log('All data seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding
seedDatabase();