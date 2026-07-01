const express = require("express")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended:true }))

app.use((req,res,next)=>{

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  )

  next()

})

app.use(
  express.static(
    path.join(__dirname,"public")
  )
)

// ===== ROUTES =====

app.use(
  "/api/search",
  require("./routes/search")
)

app.use(
  "/api/play",
  require("./routes/play")
)

app.use(
  "/api/qr",
  require("./routes/qr")
)

app.use(
  "/api/githubstalk",
  require("./routes/githubstalk")
)

app.use(
  "/api/cphoto",
  require("./routes/cphoto")
)

app.use(
  "/api/waktusholat",
  require("./routes/waktusholat")
)

app.use(
  "/api/trackphone",
  require("./routes/trackphone")
)

app.use(
  "/api/parsephone",
  require("./routes/parsephone")
)

app.use(
  "/api/parsenik",
  require("./routes/parsenik")
)

// ===== HOME =====

app.get("/",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  )

})

// ===== API =====

app.get("/api",(req,res)=>{

  res.json({

    status:true,
    creator:"Kuroz4ph",
    dashboard:"Cyberpunk API",

    endpoints:{
      search:"/api/search?q=oasis",
      play:"/api/play?url=https://soundcloud.com/...",
      qr:"/api/qr?text=hello",
      githubstalk:"/api/githubstalk?user=torvalds",
      cphoto:"/api/cphoto?text=anime",
      waktusholat:"/api/waktusholat?zone=wib",
      trackphone:"/api/trackphone?phone=0821xxxx",
      parsephone:"/api/parsephone?phone=0821xxxxxxxxx",
      parsenik:"/api/parsenik?nik=35xxxxxxxxxx"
    }

  })

})

// ===== 404 =====

app.use((req,res)=>{

  res.status(404).json({

    status:false,
    message:"Endpoint Not Found"

  })

})

// ===== START =====

if (require.main === module) {

  app.listen(PORT, () => {

    console.log(
      `🚀 Running on ${PORT}`
    )

  })

}

module.exports = app
