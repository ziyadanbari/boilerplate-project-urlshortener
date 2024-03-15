require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const url = require("url");
var cache = require("memory-cache");
const crypto = require("crypto");

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
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  const { url = "" } = req.body;
  const isUrlMatch = urlRegex.test(url);
  if (!isUrlMatch) return res.status(400).json({ error: "invalid url" });
  dns.lookup(new URL(url).hostname, (error, ip, family) => {
    if (error || !ip) return res.status(400).json({ error: "invalid url" });
    let randomInt = Math.floor(Math.random() * (100000 - 1) + 1);
    newCache.put(randomInt, url);
    return res.status(200).json({ origin_url: url, short_url: randomInt });
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
