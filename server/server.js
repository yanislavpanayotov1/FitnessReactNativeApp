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

app.post('/onboarding/session', (req, res) => {
    db.query('INSERT INTO onboarding_sessions (started_at) VALUES (NOW())',
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Session saved', sessionId: results.insertId });
    })
})

app.get('/onboarding/session', (req, res) => {
    db.query('SELECT * FROM onboarding_sessions', (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    });
})

app.post('/questions', (req, res) => {
    const { answers, sessionId } = req.body;
    if (!answers || !sessionId) return res.status(400).json({ error: 'Missing answers or sessionId' });

    const answersString = JSON.stringify(answers);

    db.query(
        'INSERT INTO user_answers (answer_value, session_id) VALUES (?, ?)',
        [answersString, sessionId],
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
