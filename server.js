/**
 * Local Test Web Server
 * চালানো: npm install && node server.js
 * তারপর Browser-এ খুলুন: http://localhost:3000
 */
const express = require("express");
const path = require("path");
const { extractPrice } = require("./scripts/extractor");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/extract-price", async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ success: false, error: "সঠিক একটা Product URL দিন।" });
  }
  console.log("Scraping:", url);
  try {
    const result = await extractPrice(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server চালু হয়েছে: http://localhost:${PORT}`);
});
