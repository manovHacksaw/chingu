import arcject, { tokenBucket } from "@arcjet/next"

export const aj = arcject({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"], 
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 3,
            interval: 3600,
            capacity: 3
        })
    ]
})