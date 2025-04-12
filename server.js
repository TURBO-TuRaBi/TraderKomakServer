require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors'); // اضافه کردن cors

const app = express();

// تنظیمات اوآندا
const API_KEY = process.env.OANDA_API_KEY || 'd8c6164227543798ccee5eedea0a47bc-dd130b835631be76c4979cea43236e27';
const ACCOUNT_ID = process.env.OANDA_ACCOUNT_ID || '101-001-12588109-002';
const BASE_URL = 'https://api-fxpractice.oanda.com';

// تنظیم CORS
app.use(cors({
    origin: 'https://traderkomak.netlify.app' // فقط به Netlify اجازه بده
}));

// سرو فایل‌های استاتیک (اگه لازم نیست، می‌تونی حذف کنی)
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());

// API برای داده‌های تاریخی
app.get('/historical', async (req, res) => {
    const symbol = req.query.symbol || 'EUR_USD';
    const granularity = req.query.granularity || 'M1';
    const count = req.query.count || 5000;
    try {
        const response = await axios.get(
            `${BASE_URL}/v3/instruments/${symbol}/candles?count=${count}&granularity=${granularity}&price=M`,
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        console.log(`داده‌های تاریخی برای ${symbol} (${granularity}) ارسال شد:`, response.data.candles.length, 'کندل');
        res.json(response.data);
    } catch (error) {
        console.error('خطا در دریافت داده‌های تاریخی:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// API برای قیمت‌های لایو
app.get('/live-price', async (req, res) => {
    const symbol = req.query.symbol || 'EUR_USD';
    try {
        const response = await axios.get(
            `${BASE_URL}/v3/accounts/${ACCOUNT_ID}/pricing?instruments=${symbol}`,
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        console.log(`قیمت لایو برای ${symbol} ارسال شد:`, response.data.prices[0]);
        res.json(response.data.prices[0]);
    } catch (error) {
        console.error('خطا در دریافت قیمت لایو:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// API برای گرفتن لیست نمادها (برای اتوکمپلیت)
app.get('/symbols', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/v3/accounts/${ACCOUNT_ID}/instruments`,
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        const symbols = response.data.instruments.map(inst => inst.name);
        console.log('لیست نمادها ارسال شد:', symbols.length);
        res.json(symbols);
    } catch (error) {
        console.error('خطا در دریافت لیست نمادها:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// مسیر تست
app.get('/test', (req, res) => {
    console.log('درخواست تست دریافت شد');
    res.send('سرور روی پورت 3000 فعال است');
});

// پورت دینامیک برای Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});