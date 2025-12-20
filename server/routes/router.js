import express from 'express'

const router = express.Router()

router.get("/read", async (req, res) => {
    res.json("hello this is read")
})

export {router as router}