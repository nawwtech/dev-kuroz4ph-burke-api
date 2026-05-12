# KUROZ4PH • BURKE API

> Minimal. Fast. Reliable.

Modern REST API built for automation, Telegram bots, downloader systems and utility tools.

---

## Features

- YouTube Search
- YTMP3 Downloader
- Audio Proxy Streaming
- QR Code Generator
- GitHub Profile Stalker
- Prayer Time API
- Fast JSON Response
- Lightweight Architecture
- Optimized for Telegram Bots

---

## Base URL

```txt
https://dev-kuroz4ph-burke-api.vercel.app
```

---

## Endpoints

| Endpoint | Description |
|---|---|
| `/api` | API information |
| `/api/search?q=` | Search YouTube videos |
| `/api/ytmp3?url=` | Get audio information |
| `/api/proxy-audio?url=` | Audio streaming proxy |
| `/api/qr?text=` | Generate QR code |
| `/api/githubstalk?user=` | GitHub profile lookup |
| `/api/waktusholat?zone=` | Prayer time information |

---

# Example Usage

## Search Music

```http
GET /api/search?q=oasis
```

### Response

```json
{
  "status": true,
  "creator": "Kuroz4ph",
  "total": 1,
  "result": [
    {
      "title": "Oasis - Don't Look Back In Anger",
      "duration": "4:48",
      "author": "Oasis",
      "url": "https://youtube.com/watch?v=...",
      "thumbnail": "https://i.ytimg.com/..."
    }
  ]
}
```

---

## YTMP3

```http
GET /api/ytmp3?url=https://youtube.com/watch?v=xxxx
```

### Response

```json
{
  "status": true,
  "creator": "Kuroz4ph",
  "result": {
    "title": "Oasis - Don't Look Back In Anger",
    "thumbnail": "https://i.ytimg.com/...",
    "duration": 288,
    "audio": {
      "quality": "opus (147kb/s)",
      "url": "https://redirector.googlevideo.com/..."
    }
  }
}
```

---

## Proxy Audio

```http
GET /api/proxy-audio?url=AUDIO_URL
```

Used for streaming audio safely to Telegram or external clients without direct GoogleVideo access.

---

## QR Generator

```http
GET /api/qr?text=hello
```

---

## GitHub Stalker

```http
GET /api/githubstalk?user=torvalds
```

---

## Prayer Time

```http
GET /api/waktusholat?zone=wib
```

Available zones:

```txt
wib
wita
wit
```

---

# Architecture

```txt
Telegram Bot
      ↓
Kuroz4ph Burke API
      ↓
Audio Proxy Stream
      ↓
YouTube Source
```

---

# Tech Stack

- Node.js
- Express.js
- Axios
- FFmpeg
- Vercel

---

# Notes

- Built for automation usage
- Optimized for Telegram bots
- Lightweight JSON architecture
- Fast response system

---

# Deploy

```bash
git clone https://github.com/nawwtech/dev-kuroz4ph-burke-api
cd dev-kuroz4ph-burke-api
npm install
npm start
```

---

# Developer

Developed by **Kuroz4ph**

> Built with precision and simplicity.
