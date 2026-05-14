// routes/play.js

const express = require("express")
const scdl = require("soundcloud-downloader").default

const router = express.Router()

router.get("/", async (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.json({
      status: false,
      message: "Masukkan url"
    })
  }

  try {
    const stream = await scdl.download(url)

    res.setHeader("Content-Type", "audio/mpeg")
    res.setHeader("Content-Disposition", "inline")

    stream.pipe(res)

  } catch (err) {
    res.json({
      status: false,
      message: err.message
    })
  }
})

module.exports = router