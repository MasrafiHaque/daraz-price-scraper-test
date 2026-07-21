# Daraz Price Extractor — Local Test Tool

এটা শুধু Testing-এর জন্য একটা ছোট Web Tool। একটা Daraz Product Link Paste করলে Playwright দিয়ে Price বের করে দেখাবে।

## চালানোর নিয়ম (VS Code Terminal থেকে)

```bash
npm install
npx playwright install chromium
node server.js
```

এরপর Browser-এ খুলুন: **http://localhost:3000**

Link Paste করে "Price বের করুন" চাপুন — কয়েক সেকেন্ডের মধ্যে Price, Product Name, এবং কোন Method দিয়ে Price পাওয়া গেছে সেটা দেখাবে। Price না পেলে Debug Screenshot দেখাবে।

## ফাইল স্ট্রাকচার

```
price-scraper-test/
├── server.js                    # Express Server + API
├── public/index.html             # Web UI
├── scripts/
│   ├── extractor.js              # মূল Price Extraction Logic (Shared)
│   └── test-price-scraper.js     # Command Line Test (GitHub Actions ও ব্যবহার করে)
└── .github/workflows/test-scrape.yml   # GitHub Actions Test Workflow
```

## গুরুত্বপূর্ণ

- এটা **শুধু Local/Testing Tool** — Playwright Real Browser চালায় বলে এটা Netlify-এর মতো Static Hosting-এ চলবে না
- এটাকে Public Website হিসেবে সবার জন্য খোলা রাখতে চাইলে Render.com বা Railway.app-এর মতো একটা Node.js Server Hosting দরকার হবে (চাইলে সেটাও পরে সেট করে দেওয়া যাবে)
- এই Tool দিয়ে Extraction Logic Test করে Confirm হলে, এই একই `extractor.js` লজিক ব্যবহার করেই আমরা Full Automation System (GitHub Actions Cron + Firestore Auto-Update) বানাবো
