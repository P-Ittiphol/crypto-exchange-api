const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order_type: { type: String, enum: ['buy', 'sell'], required: true },
  currency_code: { type: String, ref: 'Currency', required: true },
  payment_currency: { type: String, ref: 'Currency', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'matched', 'completed', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  completed_at: { type: Date }
});

// Method เพื่อดึงข้อมูล User ที่สร้าง Order
orderSchema.methods.getUser = async function() {
  return await mongoose.model('User').findById(this.user_id);
};

// Method เพื่อดึงข้อมูล Currency ที่ซื้อขาย
orderSchema.methods.getCurrency = async function() {
  return await mongoose.model('Currency').findOne({ currency_code: this.currency_code });
};

// Method เพื่อดึงข้อมูล Currency ที่ใช้ชำระ
orderSchema.methods.getPaymentCurrency = async function() {
  return await mongoose.model('Currency').findOne({ currency_code: this.payment_currency });
};

// Method เพื่อดึง Transactions ที่เกี่ยวข้องกับ Order นี้
orderSchema.methods.getTransactions = async function() {
  return await mongoose.model('Transaction').find({ order_id: this._id });
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;