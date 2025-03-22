const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  method_type: { type: String, enum: ['bank_account', 'credit_card', 'prompt_pay', 'alipay', 'wechat_pay'], required: true },
  account_number: { type: String },
  bank_name: { type: String },
  account_name: { type: String },
  is_active: { type: Boolean, default: true }
});

// Method เพื่อดึงข้อมูล User เจ้าของวิธีการชำระเงิน
paymentMethodSchema.methods.getUser = async function() {
  return await mongoose.model('User').findById(this.user_id);
};

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
module.exports = PaymentMethod;