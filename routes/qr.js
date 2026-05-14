// routes/qr.js

const express = require("express")
const QRCode = require("qrcode")

const router = express.Router()

router.get("/", async (req, res) => {

  try {
    const text = req.query.text

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Masukkan text"
      })
    }

    const qr = await QRCode.toDataURL(text)

    res.json({
      status: true,
      creator: "Kuroz4ph",
      result: qr
    })

  } catch (e) {
    res.status(500).json({
      status: false,
      error: e.message
    })
  }
})

module.exports = router