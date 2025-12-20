import { router } from "./routes/router.js";

import express from "express";
import cors from "cors";
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/', router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
