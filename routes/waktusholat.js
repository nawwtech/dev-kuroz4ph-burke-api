// routes/waktusholat.js

const express = require("express")

const router = express.Router()

router.get("/", async (req, res) => {

  const zone = (req.query.zone || "wib").toLowerCase()

  const data = {
    wib: {
      city: "Jakarta",
      subuh: "04:42",
      dzuhur: "11:58",
      ashar: "15:14",
      maghrib: "17:52",
      isya: "19:03",
      timezone: "WIB"
    },

    wita: {
      city: "Makassar",
      subuh: "04:21",
      dzuhur: "11:41",
      ashar: "14:57",
      maghrib: "17:39",
      isya: "18:49",
      timezone: "WITA"
    },

    wit: {
      city: "Jayapura",
      subuh: "04:09",
      dzuhur: "11:28",
      ashar: "14:45",
      maghrib: "17:26",
      isya: "18:36",
      timezone: "WIT"
    }
  }

  if (!data[zone]) {
    return res.status(400).json({
      status: false,
      message: "Zone tersedia: wib / wita / wit"
    })
  }

  res.json({
    status: true,
    creator: "Kuroz4ph",
    result: data[zone]
  })
})

module.exports = router