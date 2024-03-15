require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const url = require("url");
var cache = require("memory-cache");
const validator = require("validator");

// Basic Configuration
const port = process.env.PORT || 3000;
var newCache = new cache.Cache();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${__dirname}/public`));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});
app.post("/api/shorturl", async function (req, res) {
  const { url = "" } = req.body;
  const isUrlMatch = validator.isURL(url);
  if (!isUrlMatch) return res.json({ error: "invalid url" });
  dns.lookup(new URL(url).hostname, (error, ip, family) => {
    if (error || !ip) return res.status(400).json({ error: "invalid url" });
    const keys = newCache.keys();
    let key;
    if (!keys.length) key = 1;
    else key = parseInt(keys.slice(-1)[0]) + 1;
    newCache.put(key, url);
    return res.status(200).json({ original_url: url, short_url: key });
  });
});
app.get("/api/shorturl/:key", async function (req, res) {
  const key = req.params.key;
  const url = newCache.get(key);
  if (!url)
    return res.status(400).json({ error: "The short_url passed is unknown" });
  return res.redirect(url);
});

app.listen(port, "0.0.0.0", function () {
  console.log(`Listening on port ${port}`);
});
