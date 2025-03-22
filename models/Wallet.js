const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currency_code: { type: String, ref: 'Currency', required: true },
  balance: { type: Number, required: true, default: 0 },
  wallet_address: { type: String },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now }
});

// Method เพื่อดึงข้อมูล User เจ้าของกระเป๋า
walletSchema.methods.getUser = async function() {
  return await mongoose.model('User').findById(this.user_id);
};

// Method เพื่อดึงข้อมูล Currency ของกระเป๋า
walletSchema.methods.getCurrency = async function() {
  return await mongoose.model('Currency').findOne({ currency_code: this.currency_code });
};

// Method เพื่อดึงข้อมูล Transactions ของกระเป๋า
walletSchema.methods.getTransactions = async function() {
  return await mongoose.model('Transaction').find({
    $or: [
      { sender_wallet_id: this._id },
      { receiver_wallet_id: this._id }
    ]
  });
};

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;