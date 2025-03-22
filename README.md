# ระบบซื้อขายเงินดิจิทัล (Cryptocurrency Exchange API)

ระบบ API สำหรับซื้อขายเงินดิจิทัลพร้อมระบบจัดการกระเป๋าเงิน ระบบสมาชิก และการทำธุรกรรม

## คุณสมบัติ

- ระบบสมาชิก (ลงทะเบียน, เข้าสู่ระบบ, JWT Authentication)
- การจัดการกระเป๋าเงิน (สร้าง, ตรวจสอบยอดคงเหลือ, ดูประวัติธุรกรรม)
- การโอนเงินระหว่างกระเป๋า
- ระบบซื้อขายเงินดิจิทัล (สร้างคำสั่งซื้อ, ยกเลิกคำสั่งซื้อ, ดูประวัติคำสั่งซื้อ)
- ประวัติธุรกรรมทั้งหมด

## ขั้นตอนการติดตั้ง

### ความต้องการของระบบ

- Node.js (v12 หรือใหม่กว่า)
- MongoDB (v4 หรือใหม่กว่า)
- npm หรือ yarn

### วิธีติดตั้ง

1. Clone โปรเจคจาก GitHub

```bash
git clone https://github.com/username/crypto-exchange-api.git
cd crypto-exchange-api
```

2. ติดตั้ง dependencies

```bash
npm install
# หรือ
yarn install
```

3. สร้างไฟล์ .env ในโฟลเดอร์หลักของโปรเจค

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/crypto-exchange
JWT_SECRET=your_jwt_secret_key
```

4. เริ่มต้นใช้งาน MongoDB (หากยังไม่ได้เริ่มใช้งาน)

```bash
# สำหรับ Windows
net start MongoDB

# สำหรับ Linux/MacOS
sudo systemctl start mongod
```

5. สร้างข้อมูลเริ่มต้น (optional)

```bash
# ใช้คำสั่งนี้หากต้องการสร้างข้อมูลเริ่มต้น
node scripts/seed.js
```

6. เริ่มใช้งานเซิร์ฟเวอร์

```bash
npm start
# หรือ หากต้องการโหมดพัฒนา
npm run dev
```

## โครงสร้างโปรเจค

```
crypto-exchange-api/
├── app.js             # ไฟล์หลักของแอปพลิเคชัน
├── controllers/       # ตรรกะการจัดการคำขอ
│   ├── AuthController.js
│   ├── WalletController.js
│   └── OrderController.js
├── middleware/        # ฟังก์ชัน middleware
│   └── auth.js
├── models/            # โมเดล MongoDB
│   ├── User.js
│   ├── Wallet.js
│   ├── Currency.js
│   ├── Order.js
│   ├── Transaction.js
│   └── PaymentMethod.js
├── routes/            # เส้นทาง API
│   └── index.js
└── .env               # ไฟล์การกำหนดค่าสภาพแวดล้อม
```

## API Endpoints

### การยืนยันตัวตน (Authentication)

- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ใหม่
- `POST /api/auth/login` - เข้าสู่ระบบและรับ JWT token

### กระเป๋าเงิน (Wallet)

- `GET /api/wallets` - ดูกระเป๋าเงินทั้งหมดของผู้ใช้
- `GET /api/wallets/:walletId/transactions` - ดูประวัติธุรกรรมของกระเป๋าเงิน
- `POST /api/wallets/transfer` - โอนเงินระหว่างกระเป๋า

### คำสั่งซื้อขาย (Orders)

- `POST /api/orders` - สร้างคำสั่งซื้อขาย
- `GET /api/orders` - ดูคำสั่งซื้อขายของผู้ใช้
- `PATCH /api/orders/:orderId/cancel` - ยกเลิกคำสั่งซื้อขาย

## ตัวอย่างการใช้งาน API

### การลงทะเบียนผู้ใช้ใหม่

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@example.com",
    "password": "password123",
    "phone_number": "0812345678"
  }'
```

### การเข้าสู่ระบบ

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

### การดูกระเป๋าเงินทั้งหมด

```bash
curl -X GET http://localhost:3000/api/wallets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### การโอนเงินระหว่างกระเป๋า

```bash
curl -X POST http://localhost:3000/api/wallets/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sender_wallet_id": "wallet_id_1",
    "receiver_address": "wallet_address_2",
    "amount": 10.5
  }'
```

### การสร้างคำสั่งซื้อขาย

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_type": "buy",
    "currency_code": "BTC",
    "payment_currency": "THB",
    "quantity": 0.01,
    "price": 500000
  }'
```

## การพัฒนาเพิ่มเติม

1. สร้างไฟล์ทดสอบ (Tests)
2. เพิ่มฟีเจอร์การจับคู่คำสั่งซื้อขายอัตโนมัติ
3. เพิ่มระบบการยืนยันตัวตน KYC
4. พัฒนาหน้า frontend สำหรับผู้ใช้งาน

## ข้อมูลสำหรับนักพัฒนา

### การเพิ่มสกุลเงินใหม่

เพิ่มข้อมูลสกุลเงินในฐานข้อมูล MongoDB ด้วยการใช้ MongoDB Compass หรือเขียนสคริปต์เพิ่มเติม:

```javascript
// scripts/add-currency.js
const mongoose = require('mongoose');
const Currency = require('../models/Currency');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  // เพิ่มสกุลเงิน
  await Currency.create({
    currency_code: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    transaction_fee: 0.1,
    is_active: true
  });
  
  console.log('Currency added successfully');
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
```

## การแก้ไขปัญหาเบื้องต้น

### ปัญหาการเชื่อมต่อกับ MongoDB

1. ตรวจสอบว่า MongoDB กำลังทำงานอยู่
2. ตรวจสอบว่า MONGODB_URI ในไฟล์ .env ถูกต้อง
3. ตรวจสอบว่ามีการเปิด firewall สำหรับพอร์ต MongoDB (27017)

### ปัญหาการยืนยันตัวตน (Authentication)

1. ตรวจสอบค่า JWT_SECRET ในไฟล์ .env
2. ตรวจสอบว่าส่ง token ในรูปแบบ `Bearer YOUR_JWT_TOKEN` ในส่วนหัวของคำขอ
