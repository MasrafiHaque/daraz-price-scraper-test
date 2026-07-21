/**
 * Simple Test Script — Daraz Product Page থেকে Price বের করা
 * ব্যবহার: node scripts/test-price-scraper.js "https://www.daraz.com.bd/products/xxxxx.html"
 */

const { chromium } = require("playwright");

async function scrapeProductPrice(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
  });

  console.log("➡️  Opening:", url);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });

    // Daraz কখনো কখনো একটা Location/Popup Modal দেখায় — থাকলে Close করার চেষ্টা
    try {
      const closeBtn = page.locator('[class*="close"], [aria-label="close"]').first();
      if (await closeBtn.isVisible({ timeout: 3000 })) await closeBtn.click();
    } catch (_) {}

    // একটু Wait করি যাতে Price Element Render হওয়ার সময় পায়
    await page.waitForTimeout(3000);

    const result = await page.evaluate(() => {
      // Method 1: সাধারণ Daraz Price Class গুলো চেষ্টা করা
      const selectors = [
        ".pdp-price",
        ".pdp-price_type_normal",
        ".pdp-product-price .pdp-price",
        '[class*="pdp-price"]',
        '[data-spm="price"]'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) {
          return { method: "selector:" + sel, raw: el.textContent.trim() };
        }
      }

      // Method 2: Meta Tag (og:price বা product:price) চেষ্টা করা
      const metaPrice = document.querySelector(
        'meta[property="product:price:amount"], meta[property="og:price:amount"]'
      );
      if (metaPrice) {
        return { method: "meta-tag", raw: metaPrice.content };
      }

      // Method 3: পুরো Page Text-এ ৳ চিহ্ন খুঁজে Price Pattern বের করা (Fallback)
      const bodyText = document.body.innerText;
      const match = bodyText.match(/৳\s?[\d,]+/);
      if (match) {
        return { method: "text-fallback", raw: match[0] };
      }

      return null;
    });

    if (!result) {
      console.log("❌ Price খুঁজে পাওয়া যায়নি। Page Structure বদলে গেছে বা Product Page ঠিকভাবে Load হয়নি।");
      // Debug-এর জন্য Screenshot নিয়ে রাখা ভালো
      await page.screenshot({ path: "debug-screenshot.png", fullPage: true });
      console.log("🖼️  Debug screenshot saved: debug-screenshot.png (Actions Artifact দেখুন)");
    } else {
      const cleanNumber = result.raw.replace(/[^\d]/g, "");
      console.log("✅ Price পাওয়া গেছে!");
      console.log("   Method:", result.method);
      console.log("   Raw Text:", result.raw);
      console.log("   Clean Number:", cleanNumber);
    }
  } catch (err) {
    console.error("🔥 Error হয়েছে:", err.message);
    try {
      await page.screenshot({ path: "debug-screenshot.png", fullPage: true });
      console.log("🖼️  Debug screenshot saved: debug-screenshot.png");
    } catch (_) {}
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];
if (!url) {
  console.error("⚠️  একটা Daraz Product URL দিন। Example:");
  console.error('   node scripts/test-price-scraper.js "https://www.daraz.com.bd/products/xxx.html"');
  process.exit(1);
}

scrapeProductPrice(url);
