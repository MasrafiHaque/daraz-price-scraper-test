/**
 * CLI / GitHub Actions Test Script — Daraz Product Page থেকে Price বের করা
 * ব্যবহার: node scripts/test-price-scraper.js "https://www.daraz.com.bd/products/xxxxx.html"
 */
const fs = require("fs");
const { extractPrice } = require("./extractor");

function writeSummary(md) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(summaryPath, md + "\n");
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("⚠️  একটা Daraz Product URL দিন। Example:");
    console.error('   node scripts/test-price-scraper.js "https://www.daraz.com.bd/products/xxx.html"');
    process.exit(1);
  }

  console.log("➡️  Opening:", url);
  const result = await extractPrice(url);

  if (!result.success) {
    console.log("❌", result.error);
    writeSummary(
      `## ❌ Price পাওয়া যায়নি\n\n**Original URL:** ${url}\n\n**শেষ পর্যন্ত যে URL-এ পৌঁছেছে:** ${result.finalUrl || "—"}\n\n**কারণ:** ${result.error}\n\n${
        result.screenshotBase64 ? "একটা Debug Screenshot নিচে Artifact হিসেবে Upload হয়েছে — Job Summary-র নিচে স্ক্রল করে দেখুন।" : ""
      }`
    );
    if (result.screenshotBase64) {
      fs.writeFileSync("debug-screenshot.png", Buffer.from(result.screenshotBase64, "base64"));
      console.log("🖼️  Debug screenshot saved: debug-screenshot.png");
    }
    process.exit(1);
  }

  console.log("✅ Price পাওয়া গেছে!");
  console.log("   Product Name:", result.productName || "(পাওয়া যায়নি)");
  console.log("   Method:", result.method);
  console.log("   Raw Text:", result.rawPrice);
  console.log("   Clean Number:", result.price);

  writeSummary(
    `## ✅ Price পাওয়া গেছে!\n\n` +
      `| তথ্য | মান |\n|---|---|\n` +
      `| 🔗 Original URL | ${url} |\n` +
      `| 🔗 Final URL | ${result.finalUrl || "—"} |\n` +
      `| 🛍️ Product Name | ${result.productName || "—"} |\n` +
      `| 💰 Price | **৳${result.price.toLocaleString("en-BD")}** |\n` +
      `| 🔍 Method | \`${result.method}\` |\n` +
      `| 📝 Raw Text | ${result.rawPrice} |\n`
  );
}

main();
