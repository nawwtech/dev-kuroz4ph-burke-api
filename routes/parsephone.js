const express = require("express")
const router = express.Router()

// ===== OPERATOR DATABASE =====
const operatorDatabase = {
    "0811": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0812": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0813": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0821": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0822": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0823": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0851": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0852": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0853": { operator: "Telkomsel", mcc: "510", mnc: "10", type: "GSM", color: "#FF0000" },
    "0814": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0815": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0816": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0855": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0856": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0857": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0858": { operator: "Indosat Ooredoo", mcc: "510", mnc: "20", type: "GSM", color: "#FF6600" },
    "0817": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0818": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0819": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0859": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0860": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0861": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0862": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0877": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0878": { operator: "XL Axiata", mcc: "510", mnc: "11", type: "GSM", color: "#1E90FF" },
    "0896": { operator: "Tri (3)", mcc: "510", mnc: "30", type: "GSM", color: "#FFA500" },
    "0897": { operator: "Tri (3)", mcc: "510", mnc: "30", type: "GSM", color: "#FFA500" },
    "0898": { operator: "Tri (3)", mcc: "510", mnc: "30", type: "GSM", color: "#FFA500" },
    "0899": { operator: "Tri (3)", mcc: "510", mnc: "30", type: "GSM", color: "#FFA500" },
    "0880": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0881": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0882": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0883": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0884": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0885": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0886": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0887": { operator: "Smartfren", mcc: "510", mnc: "17", type: "CDMA", color: "#7B2CBF" },
    "0889": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" },
    "0890": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" },
    "0891": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" },
    "0892": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" },
    "0893": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" },
    "0894": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" },
    "0895": { operator: "Ericsson", mcc: "510", mnc: "16", type: "CDMA", color: "#20B2AA" }
}

// ===== MAIN ENDPOINT =====
router.get("/", async (req, res) => {
    try {
        const phone = req.query.phone || req.query.p || ""
        const cleanPhone = phone.replace(/\D/g, "")

        if (!cleanPhone.startsWith("08") || cleanPhone.length < 10 || cleanPhone.length > 13) {
            return res.json({
                status: false,
                message: "Format nomor tidak valid. Gunakan format 08xx (10-13 digit)"
            })
        }

        const prefix = cleanPhone.substring(0, 4)
        const operatorInfo = operatorDatabase[prefix]

        if (!operatorInfo) {
            return res.json({
                status: false,
                message: "Prefix operator tidak dikenali"
            })
        }

        const digitSum = cleanPhone.split('').reduce((sum, digit) => sum + parseInt(digit), 0)
        const isValid = cleanPhone.length >= 10 && digitSum > 0

        res.json({
            status: true,
            creator: "Kuroz4ph",
            request_id: `PRS-${Date.now()}`,
            timestamp: new Date().toISOString(),
            phone: {
                original: phone,
                formatted: cleanPhone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3"),
                clean: cleanPhone,
                length: cleanPhone.length,
                prefix: prefix,
                valid: isValid
            },
            operator: {
                name: operatorInfo.operator,
                mcc: operatorInfo.mcc,
                mnc: operatorInfo.mnc,
                type: operatorInfo.type,
                color: operatorInfo.color,
                country: "Indonesia",
                country_code: "+62"
            },
            analysis: {
                digit_sum: digitSum,
                is_indonesian: cleanPhone.startsWith("08"),
                possibly_active: isValid,
                registration_possible: true,
                sms_capable: true
            }
        })

    } catch (err) {
        res.json({ status: false, message: err.message })
    }
})

module.exports = router
