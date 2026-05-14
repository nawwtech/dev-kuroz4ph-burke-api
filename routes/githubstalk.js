// routes/githubstalk.js

const express = require("express")
const axios = require("axios")

const router = express.Router()

router.get("/", async (req, res) => {

  const user = req.query.user

  if (!user) {
    return res.status(400).json({
      status: false,
      message: "Masukkan username"
    })
  }

  try {
    const response = await axios.get(
      `https://api.github.com/users/${user}`,
      {
        headers: {
          "User-Agent": "Kuroz4ph-API"
        }
      }
    )

    const d = response.data

    res.json({
      status: true,
      creator: "Kuroz4ph",
      result: {
        username: d.login,
        nickname: d.name,
        bio: d.bio,
        followers: d.followers,
        following: d.following,
        public_repo: d.public_repos,
        avatar: d.avatar_url,
        profile: d.html_url
      }
    })

  } catch {
    res.status(404).json({
      status: false,
      message: "User tidak ditemukan"
    })
  }
})

module.exports = router