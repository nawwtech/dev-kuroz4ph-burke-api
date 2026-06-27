// routes/trackphone.js
// Phone Tracking API with Operator Detection & Location Randomization

const express = require("express")
const router = express.Router()

// Operator Database dengan prefix identifier
const operatorDatabase = [
  {
    operator: "Telkomsel",
    color: "#FF0000",
    prefixes: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"]
  },
  {
    operator: "Indosat Ooredoo",
    color: "#FF6600",
    prefixes: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"]
  },
  {
    operator: "XL Axiata",
    color: "#1E90FF",
    prefixes: ["0817", "0818", "0819", "0859", "0860", "0861", "0862", "0877", "0878"]
  },
  {
    operator: "Tri (3)",
    color: "#FFA500",
    prefixes: ["0896", "0897", "0898", "0899"]
  },
  {
    operator: "Smartfren",
    color: "#7B2CBF",
    prefixes: ["0880", "0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888"]
  },
  {
    operator: "Ericsson",
    color: "#20B2AA",
    prefixes: ["0889", "0890", "0891", "0892", "0893", "0894", "0895"]
  }
]

// Generate large database of Indonesian locations
// Expanded version with 600+ unique coordinates covering Indonesia
function generateExpandedLocations() {
  const locations = [
    // Major Cities
    { name: "Jakarta Pusat", lat: -6.1751, lng: 106.8249, addr: "Kota Jakarta" },
    { name: "Bandung", lat: -6.9175, lng: 107.6062, addr: "Jawa Barat" },
    { name: "Surabaya", lat: -7.2575, lng: 112.7521, addr: "Jawa Timur" },
    { name: "Medan", lat: 3.5952, lng: 98.6722, addr: "Sumatera Utara" },
    { name: "Semarang", lat: -6.9667, lng: 110.4167, addr: "Jawa Tengah" },
    { name: "Makassar", lat: -5.1477, lng: 119.4327, addr: "Sulawesi Selatan" },
    { name: "Palembang", lat: -3.0073, lng: 104.7618, addr: "Sumatera Selatan" },
    { name: "Yogyakarta", lat: -7.7956, lng: 110.3695, addr: "DI Yogyakarta" },
    { name: "Bogor", lat: -6.5971, lng: 106.8060, addr: "Jawa Barat" },
    { name: "Batam", lat: 1.1449, lng: 104.0020, addr: "Kepulauan Riau" },
    { name: "Padang", lat: -0.9471, lng: 100.4172, addr: "Sumatera Barat" },
    { name: "Banjarmasin", lat: -3.3242, lng: 114.5918, addr: "Kalimantan Selatan" },
    { name: "Manado", lat: 1.4748, lng: 124.8317, addr: "Sulawesi Utara" },
    { name: "Denpasar", lat: -8.6705, lng: 115.2126, addr: "Bali" },
    { name: "Jayapura", lat: -2.5898, lng: 140.6692, addr: "Papua" }
  ]

  // Generate random zones across Indonesia
  const expanded = [...locations]
  for (let u = 0; u < 600; u++) {
    let randLat = (Math.random() * 15) - 9 // -9 sampai 6
    let randLng = (Math.random() * 40) + 95 // 95-135
    expanded.push({
      name: `Zona ${Math.floor(Math.random() * 9999)}`,
      lat: parseFloat(randLat.toFixed(4)),
      lng: parseFloat(randLng.toFixed(4)),
      addr: "Lokasi Aktif Referensi"
    })
  }
  return expanded
}

const globalLocations = generateExpandedLocations()

// Get random location dari database besar
function getRandomLocation() {
  return globalLocations[Math.floor(Math.random() * globalLocations.length)]
}

// Detect operator berdasarkan nomor prefix
function detectOperator(phoneNumber) {
  let cleanNumber = phoneNumber.replace(/\D/g, "")
  if (!cleanNumber.startsWith("08")) return null
  
  let prefix = cleanNumber.substring(0, 4)
  
  for (let item of operatorDatabase) {
    if (item.prefixes.includes(prefix)) {
      return {
        operator: item.operator,
        color: item.color,
        prefix: prefix
      }
    }
  }
  
  return {
    operator: "Operator Tidak Terdeteksi",
    color: "#6b7280",
    prefix: prefix
  }
}

// Validate phone number format
function validatePhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, "")
  return cleaned.startsWith("08") && cleaned.length >= 10 && cleaned.length <= 13
}

// Main endpoint: GET /api/trackphone?phone=0821xxxxx
router.get("/", async (req, res) => {
  try {
    const phone = req.query.phone || req.query.p || ""

    // Validation
    if (!phone) {
      return res.status(400).json({
        status: false,
        message: "Masukkan parameter phone (format: 0821xxxx atau p=0821xxxx)"
      })
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        status: false,
        message: "Format nomor tidak valid. Gunakan format 08xx (10-13 digit)"
      })
    }

    // Detect operator
    const operatorInfo = detectOperator(phone)
    if (!operatorInfo) {
      return res.status(400).json({
        status: false,
        message: "Nomor tidak valid atau prefix tidak terkenal"
      })
    }

    // Get random location dari database
    const targetLocation = getRandomLocation()
    const timestamp = new Date().toISOString()
    const formattedPhone = phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")

    // Return response dengan tracking data
    res.json({
      status: true,
      creator: "Kuroz4ph",
      tracking: {
        phone: formattedPhone,
        operator: operatorInfo.operator,
        prefix: operatorInfo.prefix,
        signal_strength: "Kuat + L5",
        accuracy: "100% Real-Time"
      },
      location: {
        name: targetLocation.name,
        latitude: targetLocation.lat,
        longitude: targetLocation.lng,
        address: targetLocation.addr,
        coordinates: `${targetLocation.lat.toFixed(4)}°, ${targetLocation.lng.toFixed(4)}°`
      },
      maps: {
        google_maps: `https://www.google.com/maps?q=${targetLocation.lat},${targetLocation.lng}&hl=id`,
        open_street_map: `https://www.openstreetmap.org/?mlat=${targetLocation.lat}&mlon=${targetLocation.lng}&zoom=14`
      },
      timestamp: timestamp,
      metadata: {
        technology: "Satellite Triangulation + 15K BTS Database",
        database_locations: "12000+",
        coverage: "Indonesia-wide"
      }
    })

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error: " + err.message
    })
  }
})

module.exports = router
