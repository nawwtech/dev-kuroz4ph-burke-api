const express = require("express")
const router = express.Router()

// ===== PROVINCE DATABASE =====
const provinceDatabase = {
    "11": { code: "11", name: "DKI Jakarta", region: "Java" },
    "12": { code: "12", name: "Jawa Barat", region: "Java" },
    "13": { code: "13", name: "Jawa Tengah", region: "Java" },
    "14": { code: "14", name: "DI Yogyakarta", region: "Java" },
    "15": { code: "15", name: "Jawa Timur", region: "Java" },
    "16": { code: "16", name: "Banten", region: "Java" },
    "17": { code: "17", name: "Lampung", region: "Sumatra" },
    "18": { code: "18", name: "Riau", region: "Sumatra" },
    "19": { code: "19", name: "Sumatera Utara", region: "Sumatra" },
    "21": { code: "21", name: "Jambi", region: "Sumatra" },
    "22": { code: "22", name: "Sumatera Barat", region: "Sumatra" },
    "23": { code: "23", name: "Bengkulu", region: "Sumatra" },
    "24": { code: "24", name: "Sumatera Selatan", region: "Sumatra" },
    "25": { code: "25", name: "Aceh", region: "Sumatra" },
    "31": { code: "31", name: "Kalimantan Utara", region: "Kalimantan" },
    "32": { code: "32", name: "Kalimantan Barat", region: "Kalimantan" },
    "33": { code: "33", name: "Kalimantan Tengah", region: "Kalimantan" },
    "34": { code: "34", name: "Kalimantan Selatan", region: "Kalimantan" },
    "35": { code: "35", name: "Kalimantan Timur", region: "Kalimantan" },
    "36": { code: "36", name: "Sulawesi Utara", region: "Sulawesi" },
    "37": { code: "37", name: "Sulawesi Tengah", region: "Sulawesi" },
    "38": { code: "38", name: "Sulawesi Tenggara", region: "Sulawesi" },
    "39": { code: "39", name: "Sulawesi Barat", region: "Sulawesi" },
    "40": { code: "40", name: "Sulawesi Selatan", region: "Sulawesi" },
    "51": { code: "51", name: "Bali", region: "Bali" },
    "52": { code: "52", name: "Nusa Tenggara Barat", region: "Nusa Tenggara" },
    "53": { code: "53", name: "Nusa Tenggara Timur", region: "Nusa Tenggara" },
    "61": { code: "61", name: "Papua Barat", region: "Papua" },
    "62": { code: "62", name: "Papua", region: "Papua" },
    "71": { code: "71", name: "Maluku", region: "Maluku" },
    "72": { code: "72", name: "Maluku Utara", region: "Maluku" },
    "73": { code: "73", name: "Kepulauan Riau", region: "Riau Islands" }
}

// ===== MAIN ENDPOINT =====
router.get("/", async (req, res) => {
    try {
        const nik = req.query.nik || req.query.n || ""
        const cleanNIK = nik.replace(/\D/g, "")

        if (cleanNIK.length !== 16) {
            return res.json({
                status: false,
                message: "NIK harus 16 digit. Format: PPKKDDTTGGBBBGGGC"
            })
        }

        const provinceCode = cleanNIK.substring(0, 2)
        const districtCode = cleanNIK.substring(2, 4)
        const subdistrictCode = cleanNIK.substring(4, 6)
        const yearCode = cleanNIK.substring(6, 8)
        const monthCode = cleanNIK.substring(8, 10)
        const dateCode = cleanNIK.substring(10, 12)
        const birthOrder = cleanNIK.substring(12, 15)
        const checkDigit = cleanNIK.substring(15, 16)

        const yearNum = parseInt(yearCode)
        const currentYear = new Date().getFullYear()
        const birthYear = yearNum + (yearNum > currentYear % 100 ? 1900 : 2000)

        const monthNum = parseInt(monthCode)
        const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                           "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        const monthName = monthNames[monthNum] || "Invalid"

        const provinceInfo = provinceDatabase[provinceCode] || { name: "Unknown", region: "Unknown" }

        const birthDate = new Date(birthYear, monthNum - 1, parseInt(dateCode))
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        if (today.getMonth() < monthNum - 1 || (today.getMonth() === monthNum - 1 && today.getDate() < parseInt(dateCode))) {
            age--
        }

        const birthOrderNum = parseInt(birthOrder)
        const gender = birthOrderNum > 500 ? "Female" : "Male"

        const isValidDate = monthNum >= 1 && monthNum <= 12 && parseInt(dateCode) >= 1 && parseInt(dateCode) <= 31

        res.json({
            status: true,
            creator: "Kuroz4ph",
            request_id: `NIK-${Date.now()}`,
            timestamp: new Date().toISOString(),
            nik: {
                original: nik,
                clean: cleanNIK,
                valid_format: cleanNIK.length === 16,
                valid_data: isValidDate && age >= 0 && age <= 130
            },
            personal: {
                gender: gender,
                date_of_birth: `${parseInt(dateCode)}-${monthName}-${birthYear}`,
                birth_date_parsed: birthDate.toLocaleDateString('id-ID'),
                age: age,
                age_group: age < 18 ? "Minor" : age < 60 ? "Adult" : "Senior"
            },
            location: {
                province_code: provinceCode,
                province: provinceInfo.name,
                region: provinceInfo.region,
                district_code: districtCode,
                subdistrict_code: subdistrictCode
            },
            metadata: {
                birth_order: birthOrderNum,
                check_digit: checkDigit,
                birth_year_raw: yearCode,
                birth_month_raw: monthCode,
                birth_date_raw: dateCode
            },
            validation: {
                format_valid: cleanNIK.length === 16,
                date_valid: isValidDate,
                age_valid: age >= 0 && age <= 130,
                overall_valid: cleanNIK.length === 16 && isValidDate && age >= 0 && age <= 130
            }
        })

    } catch (err) {
        res.json({ status: false, message: err.message })
    }
})

module.exports = router
