import express from "express";
import cors from "cors";
import {db} from './lib/db.js';
import bcrypt from 'bcrypt';

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

app.post('/users/register', (req, res) => {
    const { email, password, user_id} = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    const passwordHash = bcrypt.hashSync(password, 10);
    db.query(
        'INSERT INTO users (user_id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        [user_id, email, passwordHash, new Date()],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User saved', id: results.insertId });
        }
    );
});

app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
            const user = results[0];
            if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
            res.json({ message: 'User logged in', id: user.user_id });
        }
    );
});

app.get('/users/:id', (req, res) => {
    db.query('SELECT * FROM users WHERE user_id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    });
})

app.post('/ai_requests', (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
    db.query(
    'SELECT answer_value FROM user_answers WHERE session_id = ?',
    [sessionId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'No answers found' });
      
      db.query(
        'INSERT INTO ai_requests (session_id, sent_at) VALUES (?, ?)',
        [sessionId, new Date()],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Request saved', id: results.insertId });
        }
      );  
    }
  ); 
}); 

app.get('/ai_requests', (req, res) => {
    db.query('SELECT * FROM ai_requests', (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    });
})

app.get('/ai_requests/:id', (req, res) => {
    db.query('SELECT * FROM ai_requests WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    });
})

app.get('/workout-plans/:user_id', (req, res) => {
    db.query('SELECT * FROM workout_plans WHERE user_id = ? ', [req.params.user_id], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    });
})

app.post('/workout-plans', (req, res) => {
    const { user_id, ai_request_id, plan_name, } = req.body;
    if (!user_id || !plan_name || !ai_request_id) return res.status(400).json({ error: 'Missing user_id or plan_name or ai_request_id' });
    db.query(
        'INSERT INTO workout_plans (user_id,ai_request_id, plan_name, created_at) VALUES (?, ?, ?, ?)',
        [user_id,ai_request_id, plan_name, new Date()],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan saved', id: results.insertId });
        }
    );
});

app.patch('/workout-plans/:plan_id', (req, res) => {
    const { plan_id } = req.params;
    const { plan_name } = req.body;
    if (!plan_name) return res.status(400).json({ error: 'Missing plan_name' });
    db.query(
        'UPDATE workout_plans SET plan_name = ? WHERE plan_id = ?',
        [plan_name, plan_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan updated', plan_id });
        }
    );
});

app.delete('/workout-plans/:plan_id', (req, res) => {
    const { plan_id } = req.params;
    db.query(
        'DELETE FROM workout_plans WHERE plan_id = ?',
        [plan_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan deleted', plan_id });
        }
    );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
