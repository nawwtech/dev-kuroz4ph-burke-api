// app.js

const express = require("express")
const path = require("path")

const app = express()
const port = process.env.PORT || 3000

// ===== MIDDLEWARE =====
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

// ===== STATIC =====
app.use(express.static(path.join(__dirname, "public")))

// ===== ROUTES =====
app.use("/api/search", require("./routes/search"))
app.use("/api/play", require("./routes/play"))
app.use("/api/waktusholat", require("./routes/waktusholat"))
app.use("/api/qr", require("./routes/qr"))
app.use("/api/githubstalk", require("./routes/githubstalk"))
app.use("/api/cphoto", require("./routes/cphoto"))

// ===== HOME =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ===== API INFO =====
app.get("/api", (req, res) => {
  res.json({
    status: true,
    creator: "Kuroz4ph",
    endpoints: {
      search: "/api/search?q=oasis",
      play: "/api/play?url=https://soundcloud.com/xxxx",
      waktusholat: "/api/waktusholat?zone=wib",
      qr: "/api/qr?text=hello",
      githubstalk: "/api/githubstalk?user=torvalds",
      cphoto: "/api/cphoto?text=anime"
    }
  })
})

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint tidak ditemukan"
  })
})

// ===== START =====
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 API running on port ${port}`)
  })
}

module.exports = app