const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  phone_number: { type: String },
  registration_date: { type: Date, default: Date.now },
  kyc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  last_login: { type: Date }
});

// Method เพื่อดึงข้อมูล Wallets ของ User
userSchema.methods.getWallets = async function() {
  return await mongoose.model('Wallet').find({ user_id: this._id });
};

// Method เพื่อดึงข้อมูล Orders ของ User
userSchema.methods.getOrders = async function() {
  return await mongoose.model('Order').find({ user_id: this._id });
};

// Method เพื่อดึงข้อมูล Transactions ของ User
userSchema.methods.getTransactions = async function() {
  const wallets = await this.getWallets();
  const walletIds = wallets.map(wallet => wallet._id);
  
  return await mongoose.model('Transaction').find({
    $or: [
      { sender_wallet_id: { $in: walletIds } },
      { receiver_wallet_id: { $in: walletIds } }
    ]
  });
};

// Method เพื่อดึงข้อมูล PaymentMethods ของ User
userSchema.methods.getPaymentMethods = async function() {
  return await mongoose.model('PaymentMethod').find({ user_id: this._id });
};

const User = mongoose.model('User', userSchema);
module.exports = User;