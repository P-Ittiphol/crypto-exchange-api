const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const currencySchema = new Schema({
  currency_code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['fiat', 'crypto'], required: true },
  transaction_fee: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
});

// Method เพื่อดึงข้อมูล Wallets ของสกุลเงินนี้
currencySchema.methods.getWallets = async function() {
  return await mongoose.model('Wallet').find({ currency_code: this.currency_code });
};

// Method เพื่อดึงข้อมูล Orders ที่เกี่ยวข้องกับสกุลเงินนี้
currencySchema.methods.getOrders = async function() {
  return await mongoose.model('Order').find({
    $or: [
      { currency_code: this.currency_code },
      { payment_currency: this.currency_code }
    ]
  });
};

const Currency = mongoose.model('Currency', currencySchema);
module.exports = Currency;