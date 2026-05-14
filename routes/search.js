// routes/search.js

const express = require("express")
const axios = require("axios")

const router = express.Router()

async function getClientID() {
  const html = await axios.get("https://soundcloud.com")

  const assetUrls = html.data.match(
    /https:\/\/a-v2\.sndcdn\.com\/assets\/.*?\.js/g
  )

  for (const asset of assetUrls) {
    try {
      const js = await axios.get(asset)

      const match = js.data.match(/client_id:"(.*?)"/)

      if (match) {
        return match[1]
      }
    } catch {}
  }

  throw new Error("Client ID tidak ditemukan")
}

router.get("/", async (req, res) => {
  const q = req.query.q

  if (!q) {
    return res.json({
      status: false,
      message: "Masukkan query"
    })
  }

  try {
    const client_id = await getClientID()

    const response = await axios.get(
      "https://api-v2.soundcloud.com/search/tracks",
      {
        params: {
          q,
          client_id,
          limit: 10
        },
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    )

    const tracks = response.data.collection || []

    const results = tracks.map(track => ({
      title: track.title,
      artist: track.user?.username || "Unknown",
      duration: Math.floor(track.duration / 1000),
      thumbnail: track.artwork_url || track.user?.avatar_url,
      url: track.permalink_url
    }))

    res.json({
      status: true,
      creator: "Kuroz4ph",
      result: results
    })

  } catch (err) {
    res.json({
      status: false,
      message: err.message
    })
  }
})

module.exports = router