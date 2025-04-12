require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// تنظیمات اوآندا
const API_KEY = process.env.API_KEY;
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const BASE_URL = 'https://api-fxpractice.oanda.com';

// سرو فایل‌های استاتیک
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

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});