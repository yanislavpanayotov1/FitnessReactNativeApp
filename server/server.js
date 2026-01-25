import express from "express";
import { db } from './lib/db.js';
import bcrypt from 'bcrypt';
import { generateWorkoutPlan } from "./ai.js";
import { workoutTemplates } from "./workoutTemplates.js";
import { generateProgressiveExercise, getExercise1RM, estimateExerciseWeight } from "./progressiveOverload.js";
import Stripe from 'stripe';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const app = express()
const port = process.env.PORT || 3000

// Initialize Stripe and Google Auth
// NOTE: Using placeholder if env var missing to prevent crash during setup, but keys ARE required for real usage
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(express.json())

// --- AUTH MIDDLEWARE HELPER (Optional for now) ---
// const authenticateToken = (req, res, next) => { ... }

// --- ENDPOINTS ---

app.get('/test-db', (req, res) => {
    db.query('SELECT 1', (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send('DB connected');
    });
});

app.post('/onboarding/session', (req, res) => {
    // Modified to optionally taking userId if session is started by auth user
    const { userId } = req.body;
    db.query('INSERT INTO onboarding_sessions (started_at, user_id) VALUES (NOW(), $1) RETURNING session_id',
        [userId || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Session saved', sessionId: result.rows[0].session_id });
        })
})

app.get('/onboarding/session/:session_id', (req, res) => {
    db.query('SELECT * FROM onboarding_sessions WHERE session_id = $1', [req.params.session_id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result.rows);
    });
})

app.post('/questions', (req, res) => {
    const answers = req.body?.answers;
    const session_id = req.body?.session_id || req.body?.sessionId;
    if (!answers || !session_id) return res.status(400).json({ error: 'Missing answers or sessionId' });

    const answersString = JSON.stringify(answers);

    db.query(
        'INSERT INTO user_answers (answer_value, session_id) VALUES ($1, $2) RETURNING id',
        [answersString, session_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Answers saved', id: result.rows[0].id });
        }
    );
});

app.get('/questions', (req, res) => {
    db.query('SELECT * FROM user_answers', (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result.rows);
    });
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// --- AUTH ENDPOINTS ---

app.post('/auth/google', async (req, res) => {
    const { idToken } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const googleId = payload.sub; // Google User ID

        // Check if user exists
        db.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const results = result.rows;

            if (results.length > 0) {
                // Login existing
                const user = results[0];
                const finalUserId = user.user_id || user.id;
                console.log('Google User fetched:', user);

                // Check if user has completed onboarding
                db.query(
                    'SELECT 1 FROM user_answers ua JOIN onboarding_sessions os ON ua.session_id = os.session_id WHERE os.user_id = $1 LIMIT 1',
                    [finalUserId],
                    (err, answerResult) => {
                        const answerResults = answerResult ? answerResult.rows : [];
                        const has_completed_onboarding = answerResults && answerResults.length > 0;
                        res.json({
                            user_id: finalUserId,
                            id: finalUserId,
                            email: user.email,
                            has_paid: !!user.has_paid,
                            has_completed_onboarding
                        });
                    }
                );
            } else {
                // Create new user via Google
                db.query(
                    'INSERT INTO users (email, google_id, created_at) VALUES ($1, $2, $3) RETURNING user_id',
                    [email, googleId, new Date()],
                    (err, result) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({
                            user_id: result.rows[0].user_id,
                            email: email,
                            isNew: true,
                            has_paid: false,
                            has_completed_onboarding: false
                        });
                    }
                );
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: 'Invalid Google Token' });
    }
});

app.post('/auth/apple', async (req, res) => {
    const { identityToken, email, fullName } = req.body;
    // NOTE: Proper Apple verification requires validating identityToken with Apple's public keys.
    // For this prototype/MVP, we will trust the client provided email/token or do a mock check.
    // In production: USE proper jwt verification with 'apple-signin-auth' or similar lib.

    if (!email) {
        // Apple often hides email after first signin. Return error or handle if stored on client.
        // For now, assume we need email.
        return res.status(400).json({ error: 'Email required' });
    }

    db.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const results = result.rows;
        if (results.length > 0) {
            res.json({ user_id: results[0].user_id, email });
        } else {
            db.query(
                'INSERT INTO users (email, created_at) VALUES ($1, $2) RETURNING user_id',
                [email, new Date()],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ user_id: result.rows[0].user_id, email, isNew: true });
                }
            );
        }
    });
});


// Register (Email/Password)
app.post('/users/register', async (req, res) => {
    const { email, password, fullName, session_id } = req.body; // Added fullName
    // session_id optional now as it might be created later

    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    // Check if exists
    db.query('SELECT user_id FROM users WHERE email = $1', [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

        const passwordHash = bcrypt.hashSync(password, 10);

        db.query(
            'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, $3) RETURNING user_id',
            [email, passwordHash, new Date()],
            async (err, result) => {
                if (err) return res.status(500).json({ error: err.message });

                const new_user_id = result.rows[0].user_id;

                // If session_id provided, link it, otherwise it's fine
                if (session_id) {
                    db.query('UPDATE onboarding_sessions SET user_id = $1 WHERE session_id = $2', [new_user_id, session_id]);
                }

                res.json({
                    message: 'User registered',
                    user_id: new_user_id
                    // No automatic workout gen yet, happens after payment/questionnaire now
                });
            }
        );
    });
});

// --- PAYMENT ENDPOINTS ---

app.post('/payments/intent', async (req, res) => {
    const { amount, currency = 'usd' } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            // You can add customer info here if previously created
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});




app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    db.query(
        'SELECT * FROM users WHERE email = $1',
        [email],
        async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const results = result.rows;
            if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
            const user = results[0];
            if (!user.password_hash || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });

            console.log('User fetched from DB:', user); // Debugging
            const user_id = user.user_id || user.id; // handle both common conventions
            const has_paid = !!user.has_paid;

            // Check onboarding status
            db.query(
                'SELECT 1 FROM user_answers ua JOIN onboarding_sessions os ON ua.session_id = os.session_id WHERE os.user_id = $1 LIMIT 1',
                [user_id],
                (err, answerResult) => {
                    const answerResults = answerResult ? answerResult.rows : [];
                    const has_completed_onboarding = answerResults && answerResults.length > 0;

                    // Check for existing AI request
                    db.query(
                        'SELECT ar.id FROM ai_requests ar JOIN onboarding_sessions os ON ar.session_id = os.session_id WHERE os.user_id = $1 LIMIT 1',
                        [user_id],
                        (err, existingRequestResult) => {
                            const existingRequest = existingRequestResult ? existingRequestResult.rows : [];
                            const response = {
                                message: 'User logged in',
                                id: user_id,
                                user_id: user_id,
                                has_paid,
                                has_completed_onboarding,
                                workout_plan: null,
                                already_generated: false
                            };

                            if (existingRequest && existingRequest.length > 0) {
                                response.ai_request_id = existingRequest[0].id;
                                response.already_generated = true;
                            }

                            return res.json(response);
                        }
                    );
                }
            );

            // Removed local generation logic from login to simplify flow and rely on dashboard/paywall checks
        }
    );
});

app.post('/users/mark-paid', (req, res) => {
    const { userId } = req.body;
    console.log(`[mark-paid] Request received for userId: ${userId}`);
    if (!userId) {
        console.error('[mark-paid] Missing userId in body');
        return res.status(400).json({ error: 'Missing userId' });
    }

    db.query('UPDATE users SET has_paid = true WHERE user_id = $1', [userId], (err, result) => {
        if (err) {
            console.error('[mark-paid] DB Error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[mark-paid] Update result:`, result);
        if (result.rowCount === 0) {
            console.warn(`[mark-paid] No rows updated for user ${userId}. Check if ID exists.`);
        } else {
            console.log(`[mark-paid] Successfully marked user ${userId} as paid.`);
        }
        res.json({ success: true, result });
    });
});



app.get('/users/:id', (req, res) => {
    db.query('SELECT * FROM users WHERE user_id = $1', [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result.rows);
    });
})

app.post('/ai_requests', async (req, res) => {
    const user_id = req.body?.user_id;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    // First verify the user is registered
    db.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [user_id],
        async (err, userResult) => {
            if (err) return res.status(500).json({ error: err.message });
            const userResults = userResult.rows;
            if (userResults.length === 0) return res.status(401).json({ error: 'User not registered. Please register first.' });

            // Now get the answers for this registered user
            db.query(
                'SELECT ua.answer_value, ua.session_id FROM user_answers ua JOIN onboarding_sessions os ON ua.session_id = os.session_id WHERE os.user_id = $1',
                [user_id],
                async (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    const results = result.rows;
                    if (results.length === 0) return res.status(404).json({ error: 'No answers found for this user' });

                    const answers = results[0].answer_value;
                    const session_id = results[0].session_id;

                    let answerObject;
                    try {
                        answerObject = JSON.parse(answers);
                    } catch (e) {
                        return res.status(400).json({ error: 'Invalid answers' });
                    }

                    if (!answerObject || typeof answerObject !== 'object') {
                        return res.status(500).json({ error: 'Parsed answers is not an object' });
                    }
                    let plan;
                    try {
                        plan = await generateWorkoutPlan(answerObject);
                    } catch (aiErr) {
                        console.error(aiErr);
                        res.status(500).json({ error: aiErr.message });
                    }

                    db.query(
                        'INSERT INTO ai_requests (session_id, sent_at) VALUES ($1, $2) RETURNING id',
                        [session_id, new Date()],
                        (err, result) => {
                            if (err) return res.status(500).json({ error: err.message });
                            res.json({
                                message: 'Request saved',
                                id: result.rows[0].id,
                                workout_plan: plan
                            });
                        }
                    );
                }
            );
        }
    );
});

app.get('/ai_requests', (req, res) => {
    db.query('SELECT * FROM ai_requests', (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result.rows);
    });
})

app.get('/ai_requests/:id', (req, res) => {
    db.query('SELECT * FROM ai_requests WHERE id = $1', [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result.rows);
    });
})

app.get('/workout-plans/:user_id', (req, res) => {
    db.query('SELECT * FROM workout_plans WHERE user_id = $1 ', [req.params.user_id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result.rows);
    });
})

app.post('/workout-plans', (req, res) => {
    const { user_id, ai_request_id, plan_name, } = req.body;
    if (!user_id || !plan_name || !ai_request_id) return res.status(400).json({ error: 'Missing user_id or plan_name or ai_request_id' });
    db.query(
        'INSERT INTO workout_plans (user_id,ai_request_id, plan_name, created_at) VALUES ($1, $2, $3, $4) RETURNING plan_id',
        [user_id, ai_request_id, plan_name, new Date()],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan saved', id: result.rows[0].plan_id });
        }
    );
});

app.patch('/workout-plans/:plan_id', (req, res) => {
    const { plan_id } = req.params;
    const { plan_name } = req.body;
    if (!plan_name) return res.status(400).json({ error: 'Missing plan_name' });
    db.query(
        'UPDATE workout_plans SET plan_name = $1 WHERE plan_id = $2',
        [plan_name, plan_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan updated', plan_id });
        }
    );
});

app.delete('/workout-plans/:plan_id', (req, res) => {
    const { plan_id } = req.params;
    db.query(
        'DELETE FROM workout_plans WHERE plan_id = $1',
        [plan_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Plan deleted', plan_id });
        }
    );
});

// Dashboard endpoint - get user's workout based on their split selection
app.get('/dashboard/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // Get user's questionnaire answers
        const answers = await new Promise((resolve, reject) => {
            db.query(
                'SELECT ua.answer_value FROM user_answers ua JOIN onboarding_sessions os ON ua.session_id = os.session_id WHERE os.user_id = $1',
                [user_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows);
                }
            );
        });

        if (answers.length === 0) {
            return res.status(404).json({ error: 'No questionnaire answers found for this user' });
        }

        const answerObject = JSON.parse(answers[0].answer_value);
        const workoutSplit = answerObject["6"]; // Question 6 is the workout split

        // Check if user selected AI-optimized
        if (workoutSplit && workoutSplit.includes("AI – optimized")) {
            console.log(`User ${user_id} selected AI-optimized. Fetching workout...`);

            // Get AI-generated workout from workout_plans
            const aiWorkout = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT wp.plan_name FROM workout_plans wp WHERE wp.user_id = $1 AND wp.ai_request_id IS NOT NULL LIMIT 1',
                    [user_id],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result.rows);
                    }
                );
            });

            console.log(`AI workout query result:`, aiWorkout);

            if (aiWorkout.length === 0) {
                console.log(`No AI workout found for user ${user_id}. Generating now...`);

                // If no workout found, try to generate one now
                try {
                    const workout_plan = await generateWorkoutPlan(answerObject);
                    console.log(`Generated workout plan:`, workout_plan);

                    // Save it to database
                    await new Promise((resolve, reject) => {
                        db.query(
                            'INSERT INTO ai_requests (session_id, sent_at) VALUES ((SELECT session_id FROM onboarding_sessions WHERE user_id = $1 LIMIT 1), $2) RETURNING id',
                            [user_id, new Date()],
                            (err, aiResult) => {
                                if (err) {
                                    console.error('Error saving AI request:', err);
                                    reject(err);
                                } else {
                                    const ai_request_id = aiResult.rows[0].id;

                                    db.query(
                                        'INSERT INTO workout_plans (user_id, ai_request_id, plan_name, created_at) VALUES ($1, $2, $3, $4)',
                                        [user_id, ai_request_id, JSON.stringify(workout_plan), new Date()],
                                        (err) => {
                                            if (err) console.error('Error saving workout plan:', err);
                                            resolve();
                                        }
                                    );
                                }
                            }
                        );
                    });

                    return res.json({
                        type: 'ai-generated',
                        split: workoutSplit,
                        workout: workout_plan
                    });
                } catch (genError) {
                    console.error('❌ Error generating AI workout:', genError);
                    console.error('Error details:', {
                        message: genError.message,
                        stack: genError.stack,
                        name: genError.name
                    });

                    return res.status(500).json({
                        error: 'Failed to generate AI workout',
                        details: genError.message,
                        suggestion: 'Please check server logs for details'
                    });
                }
            }

            // Parse the stored JSON workout
            let workoutPlan;
            try {
                workoutPlan = JSON.parse(aiWorkout[0].plan_name);
            } catch (parseError) {
                console.error('Error parsing stored workout:', parseError);
                // Fallback to text format
                workoutPlan = {
                    name: "AI-Optimized Workout",
                    description: "Personalized workout generated by AI",
                    note: aiWorkout[0].plan_name
                };
            }

            // Return the AI-generated workout in same format as templates
            return res.json({
                type: 'ai-generated',
                split: workoutSplit,
                workout: workoutPlan
            });
        } else {
            // Return predefined template based on split selection
            const template = workoutTemplates[workoutSplit];

            if (!template) {
                return res.status(404).json({
                    error: `No template found for split: ${workoutSplit}`
                });
            }

            // Get user's 1RM data
            const oneRepMax = answerObject["3"] || {};

            // Get week number from query parameter (default to 1)
            const weekNumber = parseInt(req.query.week) || 1;

            // Get the percentage for this week
            const weekInCycle = ((weekNumber - 1) % 4) + 1;
            const percentages = { 1: 70, 2: 75, 3: 80, 4: 65 };
            const currentPercentage = percentages[weekInCycle];

            const enhancedSchedule = template.schedule.map(day => ({
                ...day,
                exercises: day.exercises.map(exercise => {
                    const exerciseOneRM = getExercise1RM(exercise.name, oneRepMax);

                    // If we have direct 1RM data for this exercise (Bench/Squat/Deadlift)
                    if (exerciseOneRM && exerciseOneRM > 0) {
                        const progressiveExercise = generateProgressiveExercise(
                            exercise.name,
                            parseFloat(exerciseOneRM),
                            exercise.sets,
                            weekNumber
                        );
                        return {
                            ...exercise,
                            weight: progressiveExercise.weight,
                            reps: progressiveExercise.reps,
                            rest: progressiveExercise.rest,
                            notes: progressiveExercise.notes
                        };
                    }

                    // For all other exercises, estimate weight based on 1RM ratios
                    const estimation = estimateExerciseWeight(exercise.name, oneRepMax, weekNumber);
                    if (estimation) {
                        return {
                            ...exercise,
                            weight: typeof estimation.weight === 'number' ? `${estimation.weight}kg` : estimation.weight,
                            notes: estimation.notes
                        };
                    }

                    // If no estimation possible, return exercise as-is
                    return exercise;
                })
            }));

            return res.json({
                type: 'predefined',
                split: workoutSplit,
                currentWeek: weekNumber,
                weekPercentage: currentPercentage,
                isDeload: weekInCycle === 4,
                workout: {
                    ...template,
                    schedule: enhancedSchedule
                }
            });
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Get user's workout progress (which weeks are completed)
app.get('/progress/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const progress = await new Promise((resolve, reject) => {
            db.query(
                `SELECT cycle_number, completed_weeks, completed_exercises, current_week, updated_at 
                 FROM workout_progress 
                 WHERE user_id = $1 
                 ORDER BY cycle_number DESC LIMIT 1`,
                [user_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows);
                }
            );
        });

        if (progress.length === 0) {
            // Create initial progress record
            await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO workout_progress (user_id, cycle_number, completed_weeks, completed_exercises, current_week, updated_at) 
                     VALUES ($1, 1, '[]', '{}', 1, NOW())`,
                    [user_id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            return res.json({
                cycle_number: 1,
                completed_weeks: [],
                completed_exercises: {},
                current_week: 1,
                is_cycle_complete: false
            });
        }

        const completedWeeks = JSON.parse(progress[0].completed_weeks || '[]');
        const completedExercises = progress[0].completed_exercises ? JSON.parse(progress[0].completed_exercises) : {};

        res.json({
            cycle_number: progress[0].cycle_number,
            completed_weeks: completedWeeks,
            completed_exercises: completedExercises,
            current_week: progress[0].current_week,
            is_cycle_complete: completedWeeks.length >= 4
        });
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle exercise completion
app.post('/progress/:user_id/exercise', async (req, res) => {
    const { user_id } = req.params;
    const { exerciseId, isCompleted } = req.body; // exerciseId format: "w{week}_d{day}_e{index}"

    try {
        const progress = await new Promise((resolve, reject) => {
            db.query(
                `SELECT id, completed_exercises FROM workout_progress 
                 WHERE user_id = $1 ORDER BY cycle_number DESC LIMIT 1`,
                [user_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows);
                }
            );
        });

        if (progress.length === 0) return res.status(404).json({ error: 'Progress not found' });

        const currentExercises = progress[0].completed_exercises ? JSON.parse(progress[0].completed_exercises) : {};

        if (isCompleted) {
            currentExercises[exerciseId] = true;
        } else {
            delete currentExercises[exerciseId];
        }

        await new Promise((resolve, reject) => {
            db.query(
                `UPDATE workout_progress SET completed_exercises = $1 WHERE id = $2`,
                [JSON.stringify(currentExercises), progress[0].id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({ success: true, completed_exercises: currentExercises });
    } catch (error) {
        console.error('Exercise toggle error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark a week as complete
app.post('/progress/:user_id/complete-week', async (req, res) => {
    const { user_id } = req.params;
    const { week } = req.body;

    if (!week || week < 1 || week > 4) {
        return res.status(400).json({ error: 'Invalid week number (1-4)' });
    }

    try {
        // Get current progress
        const progress = await new Promise((resolve, reject) => {
            db.query(
                `SELECT id, cycle_number, completed_weeks, current_week 
                 FROM workout_progress 
                 WHERE user_id = $1 
                 ORDER BY cycle_number DESC LIMIT 1`,
                [user_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows);
                }
            );
        });

        let completedWeeks = [];
        let cycleNumber = 1;
        let progressId = null;

        if (progress.length > 0) {
            completedWeeks = JSON.parse(progress[0].completed_weeks || '[]');
            cycleNumber = progress[0].cycle_number;
            progressId = progress[0].id;
        }

        // Add week if not already completed
        if (!completedWeeks.includes(week)) {
            completedWeeks.push(week);
            completedWeeks.sort((a, b) => a - b);
        }

        // Calculate next week
        const nextWeek = Math.min(week + 1, 4);

        if (progressId) {
            // Update existing record
            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE workout_progress 
                     SET completed_weeks = $1, current_week = $2, updated_at = NOW() 
                     WHERE id = $3`,
                    [JSON.stringify(completedWeeks), nextWeek, progressId],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } else {
            // Create new record
            await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO workout_progress (user_id, cycle_number, completed_weeks, current_week, updated_at) 
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [user_id, cycleNumber, JSON.stringify(completedWeeks), nextWeek],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        const isCycleComplete = completedWeeks.length >= 4;

        res.json({
            success: true,
            completed_weeks: completedWeeks,
            current_week: nextWeek,
            is_cycle_complete: isCycleComplete,
            message: isCycleComplete
                ? 'Congratulations! You completed the 4-week cycle!'
                : `Week ${week} completed!`
        });
    } catch (error) {
        console.error('Complete week error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update 1RM values and start new cycle
app.post('/progress/:user_id/new-cycle', async (req, res) => {
    const { user_id } = req.params;
    const { oneRepMax } = req.body;

    if (!oneRepMax) {
        return res.status(400).json({ error: 'Missing 1RM values' });
    }

    try {
        // Get current cycle number
        const progress = await new Promise((resolve, reject) => {
            db.query(
                `SELECT cycle_number FROM workout_progress 
                 WHERE user_id = $1 
                 ORDER BY cycle_number DESC LIMIT 1`,
                [user_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows);
                }
            );
        });

        const newCycleNumber = (progress[0]?.cycle_number || 0) + 1;

        // Create new progress record for new cycle
        await new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO workout_progress (user_id, cycle_number, completed_weeks, current_week, updated_at) 
                 VALUES ($1, $2, '[]', 1, NOW())`,
                [user_id, newCycleNumber],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Update user's 1RM in their answers
        const answers = await new Promise((resolve, reject) => {
            db.query(
                `SELECT ua.id, ua.answer_value 
                 FROM user_answers ua 
                 JOIN onboarding_sessions os ON ua.session_id = os.session_id 
                 WHERE os.user_id = $1 
                 ORDER BY ua.id DESC LIMIT 1`,
                [user_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows);
                }
            );
        });

        if (answers.length > 0) {
            const answerObj = JSON.parse(answers[0].answer_value);
            answerObj["3"] = oneRepMax; // Question 3 is 1RM data

            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE user_answers SET answer_value = $1 WHERE id = $2`,
                    [JSON.stringify(answerObj), answers[0].id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        res.json({
            success: true,
            cycle_number: newCycleNumber,
            message: `Started Cycle ${newCycleNumber} with updated weights!`
        });
    } catch (error) {
        console.error('New cycle error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
