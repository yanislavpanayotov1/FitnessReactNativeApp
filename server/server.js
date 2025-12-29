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

app.post('/questions', (req, res) => {
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: 'No answers provided' });

    const answersString = JSON.stringify(answers);

    db.query(
        'INSERT INTO user_answers (answer_value) VALUES (?)',
        [answersString],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Answers saved', id: results.insertId });
        }
    );
});


app.get('/questions', (req, res) => {
    db.query('SELECT * FROM user_answers', (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    });
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
