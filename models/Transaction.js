const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  sender_wallet_id: { type: Schema.Types.ObjectId, ref: 'Wallet' },
  receiver_wallet_id: { type: Schema.Types.ObjectId, ref: 'Wallet' },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  transaction_type: { type: String, enum: ['trade', 'transfer', 'deposit', 'withdrawal'], required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  blockchain_tx_id: { type: String }
});

// Method เพื่อดึงข้อมูล Wallet ต้นทาง
transactionSchema.methods.getSenderWallet = async function() {
  if (this.sender_wallet_id) {
    return await mongoose.model('Wallet').findById(this.sender_wallet_id);
  }
  return null;
};

// Method เพื่อดึงข้อมูล Wallet ปลายทาง
transactionSchema.methods.getReceiverWallet = async function() {
  if (this.receiver_wallet_id) {
    return await mongoose.model('Wallet').findById(this.receiver_wallet_id);
  }
  return null;
};

// Method เพื่อดึงข้อมูล Order ที่เกี่ยวข้อง
transactionSchema.methods.getOrder = async function() {
  if (this.order_id) {
    return await mongoose.model('Order').findById(this.order_id);
  }
  return null;
};

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;