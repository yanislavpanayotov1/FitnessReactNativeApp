import express from "express";
import cors from "cors";
import {db} from './lib/db.js';

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/test-db', (req, res) => {
    db.query('SELECT 1', (err) => {
      if (err) return res.status(500).send(err.message);
      res.send('DB connected');
    });
  });



app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
