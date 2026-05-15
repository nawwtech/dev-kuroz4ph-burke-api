// routes/cphoto.js

const express = require("express")
const axios = require("axios")

const router = express.Router()

router.get("/", async (req, res) => {

  try {
    const text = req.query.text

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Masukkan parameter text"
      })
    }

    const response = await axios.get(
      "https://api.ikyyxd.my.id/ai/text2img",
      {
        params: {
          apikey: "kyzz",
          text
        },
        timeout: 120000
      }
    )

    const data = response.data

    if (!data.status) {
      return res.status(500).json({
        status: false,
        message: "Gagal generate image"
      })
    }

    const image = await axios({
      method: "GET",
      url: data.result.url,
      responseType: "arraybuffer",
      timeout: 120000
    })

    res.setHeader(
      "Content-Type",
      image.headers["content-type"] || "image/jpeg"
    )

    res.send(Buffer.from(image.data))

  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
})

module.exports = router