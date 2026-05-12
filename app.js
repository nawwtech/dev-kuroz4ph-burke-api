const express = require("express")
const path = require("path")
const yts = require("yt-search")
const QRCode = require("qrcode")
const fs = require("fs")
const axios = require("axios")

const app = express()
const port = process.env.PORT || 3000

process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

app.use((req, res, next) => {

res.setHeader(
"Access-Control-Allow-Origin",
"*"
)

next()

})

app.use(
express.static(
path.join(
__dirname,
"public"
)
)
)

app.get("/", (req, res) => {

res.sendFile(
path.join(
__dirname,
"public",
"index.html"
)
)

})

app.get("/api", (req, res) => {

res.json({

status: true,

creator: "Kuroz4ph",

endpoints: {

search:
"/api/search?q=oasis",

play:
"/api/play?url=https://youtube.com/watch?v=xxxx",

waktusholat:
"/api/waktusholat?zone=wib",

qr:
"/api/qr?text=halo",

githubstalk:
"/api/githubstalk?user=torvalds"

}

})

})

const scdl =
require("soundcloud-downloader").default

// ====================== SEARCH ======================

async function getClientID() {

    const html =
        await axios.get(
            "https://soundcloud.com"
        )

    const assetUrls =
        html.data.match(
/https:\/\/a-v2\.sndcdn\.com\/assets\/.*?\.js/g
        )

    for (const asset of assetUrls) {

        try {

            const js =
                await axios.get(asset)

            const match =
                js.data.match(
/client_id:"(.*?)"/
                )

            if (match) {

                return match[1]
            }

        } catch {}
    }

    throw new Error(
        "Client ID tidak ditemukan"
    )
}

app.get("/api/search", async (req, res) => {

    const q =
        req.query.q

    if (!q) {

        return res.json({

            status: false,

            message:
                "Masukkan query"
        })
    }

    try {

        const client_id =
            await getClientID()

        const response =
            await axios.get(
`https://api-v2.soundcloud.com/search/tracks`,
            {

                params: {

                    q,

                    client_id,

                    limit: 10
                },

                headers: {

                    "User-Agent":
                        "Mozilla/5.0"
                }
            })

        const tracks =
            response.data.collection || []

        const results =
            tracks.map(track => ({

                title:
                    track.title,

                artist:
                    track.user?.username ||

                    "Unknown",

                duration:
                    Math.floor(
                        track.duration / 1000
                    ),

                thumbnail:
                    track.artwork_url ||

                    track.user?.avatar_url,

                url:
                    track.permalink_url
            }))

        res.json({

            status: true,

            creator:
                "Kuroz4ph",

            result:
                results
        })

    } catch (err) {

        console.log(err.message)

        res.json({

            status: false,

            message:
                err.message
        })
    }
})
// ====================== PLAY ======================
app.get("/api/play", async (req, res) => {

    const url =
        req.query.url

    if (!url) {

        return res.json({

            status: false,

            message:
                "Masukkan url"
        })
    }

    try {

        const info =
            await scdl.getInfo(url)

        const transcoding =
            info.media.transcodings.find(x =>

                x.format.protocol ===
                "progressive"

                &&

                x.quality ===
                "sq"
            )

        if (!transcoding) {

            return res.json({

                status: false,

                message:
                    "Full audio tidak tersedia"
            })
        }

        const streamUrl =
            await scdl.getDownloadURL(
                url
            )

        const audio =
            await axios.get(
                streamUrl,
                {
                    responseType:
                        "stream"
                }
            )

        res.setHeader(
            "Content-Type",
            "audio/mpeg"
        )

        audio.data.pipe(res)

    } catch (err) {

        console.log(err.message)

        res.json({

            status: false,

            message:
                err.message
        })
    }
})

app.get("/api/waktusholat", async (req, res) => {

const zone =
(
req.query.zone ||
"wib"
).toLowerCase()

const data = {

wib: {

city:
"Jakarta",

subuh:
"04:42",

dzuhur:
"11:58",

ashar:
"15:14",

maghrib:
"17:52",

isya:
"19:03",

timezone:
"WIB"

},

wita: {

city:
"Makassar",

subuh:
"04:21",

dzuhur:
"11:41",

ashar:
"14:57",

maghrib:
"17:39",

isya:
"18:49",

timezone:
"WITA"

},

wit: {

city:
"Jayapura",

subuh:
"04:09",

dzuhur:
"11:28",

ashar:
"14:45",

maghrib:
"17:26",

isya:
"18:36",

timezone:
"WIT"

}

}

if (!data[zone]) {

return res.status(400).json({

status: false,

message:
"Zone tersedia: wib / wita / wit"

})

}

res.status(200).json({

status: true,

creator: "Kuroz4ph",

result:
data[zone]

})

})


app.get("/api/qr", async (req, res) => {

try {

const text =
req.query.text

if (!text) {

return res.status(400).json({

status: false,

message:
"Masukkan text"

})

}

const qr =
await QRCode.toDataURL(
text
)

res.status(200).json({

status: true,

creator: "Kuroz4ph",

result: qr

})

} catch (e) {

res.status(500).json({

status: false,

error:
e.message

})

}

})


app.get("/api/githubstalk", async (req, res) => {

const user =
req.query.user

if (!user) {

return res.status(400).json({

status: false,

creator:
"Kuroz4ph",

message:
"Masukkan username"

})

}

try {

const response =
await axios.get(
`https://api.github.com/users/${user}`,
{
headers: {
"User-Agent":
"Kuroz4ph-API"
}
}
)

const d =
response.data

res.status(200).json({

status: true,

creator:
"Kuroz4ph",

result: {

username:
d.login,

nickname:
d.name,

bio:
d.bio,

id:
d.id,

followers:
d.followers,

following:
d.following,

public_repo:
d.public_repos,

avatar:
d.avatar_url,

profile:
d.html_url,

created_at:
d.created_at

}

})

} catch (e) {

res.status(404).json({

status: false,

message:
"User tidak ditemukan"

})

}

})


app.use((req, res) => {

res.status(404).json({

status: false,

message:
"Endpoint tidak ditemukan"

})

})

if (
require.main === module
) {

app.listen(port, () => {

console.log(
`🚀 KUROZ4PH API RUNNING ON PORT ${port}`
)

})

}

module.exports = app