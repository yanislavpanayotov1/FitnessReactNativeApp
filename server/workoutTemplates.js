// Predefined workout templates for each split type
// These are used when users don't select "AI – optimized"

export const workoutTemplates = {
    "Upper, lower": {
        name: "Upper/Lower Split",
        description: "Balanced training with double frequency for upper and lower body",
        schedule: [
            {
                day: "Day 1",
                focus: "Upper Body",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s", weight: "60kg" },
                    { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s", weight: "50kg" },
                    { name: "Overhead Press", sets: 3, reps: "10-12", rest: "60s", weight: "40kg" },
                    { name: "Pull-ups", sets: 3, reps: "8-12", rest: "60s", weight: "bodyweight" },
                    { name: "Dumbbell Curl", sets: 3, reps: "12-15", rest: "45s", weight: "12kg" },
                    { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "45s", weight: "bodyweight" }
                ]
            },
            {
                day: "Day 2",
                focus: "Lower Body",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min", weight: "80kg" },
                    { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s", weight: "60kg" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s", weight: "120kg" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s", weight: "40kg" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s", weight: "60kg" }
                ]
            },
            {
                day: "Day 3",
                focus: "Upper Body",
                exercises: [
                    { name: "Incline Dumbbell Press", sets: 4, reps: "8-10", rest: "90s", weight: "25kg" },
                    { name: "Lat Pulldown", sets: 4, reps: "10-12", rest: "60s", weight: "50kg" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s", weight: "20kg" },
                    { name: "Cable Row", sets: 3, reps: "12-15", rest: "60s", weight: "45kg" },
                    { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "45s", weight: "15kg" },
                    { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "45s", weight: "20kg" }
                ]
            },
            {
                day: "Day 4",
                focus: "Lower Body",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min", weight: "100kg" },
                    { name: "Bulgarian Split Squat", sets: 3, reps: "10-12", rest: "90s", weight: "20kg" },
                    { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s", weight: "50kg" },
                    { name: "Hamstring Curl", sets: 3, reps: "12-15", rest: "60s", weight: "35kg" },
                    { name: "Seated Calf Raise", sets: 4, reps: "15-20", rest: "45s", weight: "40kg" }
                ]
            }
        ]
    },

    "Push, pull, legs": {
        name: "Push/Pull/Legs",
        description: "Focus on one movement pattern per day, ideal for hypertrophy",
        schedule: [
            {
                day: "Day 1",
                focus: "Push",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Overhead Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Lateral Raise", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Pull",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Pull-ups", sets: 4, reps: "8-12", rest: "90s" },
                    { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
                    { name: "Barbell Curl", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Legs",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s" }
                ]
            }
        ]
    },

    "Full body": {
        name: "Full Body",
        description: "Ideal for beginners or limited time, trains entire body each session",
        schedule: [
            {
                day: "Day 1",
                focus: "Full Body",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Barbell Row", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Overhead Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Plank", sets: 3, reps: "60s", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Full Body",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Pull-ups", sets: 3, reps: "8-12", rest: "90s" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Full Body",
                exercises: [
                    { name: "Front Squat", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Bulgarian Split Squat", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Cable Fly", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" }
                ]
            }
        ]
    },

    "Bro split": {
        name: "Bro Split",
        description: "Classic approach, dedicate each session to a single muscle group",
        schedule: [
            {
                day: "Day 1",
                focus: "Chest",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Incline Dumbbell Press", sets: 4, reps: "10-12", rest: "90s" },
                    { name: "Cable Fly", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Dips", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Push-ups", sets: 3, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Back",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Pull-ups", sets: 4, reps: "8-12", rest: "90s" },
                    { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Shoulders",
                exercises: [
                    { name: "Overhead Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Dumbbell Shoulder Press", sets: 4, reps: "10-12", rest: "90s" },
                    { name: "Lateral Raise", sets: 4, reps: "12-15", rest: "45s" },
                    { name: "Front Raise", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Rear Delt Fly", sets: 3, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 4",
                focus: "Arms",
                exercises: [
                    { name: "Barbell Curl", sets: 4, reps: "10-12", rest: "60s" },
                    { name: "Tricep Dips", sets: 4, reps: "10-12", rest: "60s" },
                    { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Cable Curl", sets: 3, reps: "15-20", rest: "45s" },
                    { name: "Tricep Pushdown", sets: 3, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 5",
                focus: "Legs",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Leg Press", sets: 4, reps: "12-15", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s" }
                ]
            }
        ]
    },

    "Push, pull, legs, full body": {
        name: "PPL + Full Body",
        description: "Blend push, pull, and leg routines with full body sessions",
        schedule: [
            {
                day: "Day 1",
                focus: "Push",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Overhead Press", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Lateral Raise", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Pull",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Pull-ups", sets: 3, reps: "8-12", rest: "90s" },
                    { name: "Barbell Row", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
                    { name: "Barbell Curl", sets: 3, reps: "12-15", rest: "60s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Legs",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Calf Raise", sets: 3, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 4",
                focus: "Full Body",
                exercises: [
                    { name: "Front Squat", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" }
                ]
            }
        ]
    },

    "Push, pull, legs, upper, lower": {
        name: "PPL + Upper/Lower",
        description: "Increased frequency and volume with additional upper/lower days",
        schedule: [
            {
                day: "Day 1",
                focus: "Push",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Overhead Press", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Lateral Raise", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Tricep Dips", sets: 3, reps: "10-12", rest: "60s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Pull",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Pull-ups", sets: 4, reps: "8-12", rest: "90s" },
                    { name: "Barbell Row", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
                    { name: "Barbell Curl", sets: 3, reps: "12-15", rest: "60s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Legs",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 4",
                focus: "Upper Body",
                exercises: [
                    { name: "Incline Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Cable Row", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 5",
                focus: "Lower Body",
                exercises: [
                    { name: "Front Squat", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Bulgarian Split Squat", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Hamstring Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Seated Calf Raise", sets: 3, reps: "15-20", rest: "45s" }
                ]
            }
        ]
    },

    "Upper, lower, full body": {
        name: "Upper/Lower + Full Body",
        description: "Balance training with rest day between full body sessions",
        schedule: [
            {
                day: "Day 1",
                focus: "Upper Body",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Overhead Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Pull-ups", sets: 3, reps: "8-12", rest: "60s" },
                    { name: "Dumbbell Curl", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Lower Body",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Full Body",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Bulgarian Split Squat", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" }
                ]
            }
        ]
    },

    "Lower focused + upper": {
        name: "Lower Focused + Upper",
        description: "Focus on legs/glutes twice per week with upper body work",
        schedule: [
            {
                day: "Day 1",
                focus: "Lower Body (Quad Focus)",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Leg Press", sets: 4, reps: "12-15", rest: "90s" },
                    { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Bulgarian Split Squat", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Upper Body",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Overhead Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Pull-ups", sets: 3, reps: "8-12", rest: "60s" },
                    { name: "Dumbbell Curl", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Lower Body (Glute/Hamstring Focus)",
                exercises: [
                    { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Hip Thrust", sets: 4, reps: "10-12", rest: "90s" },
                    { name: "Leg Curl", sets: 4, reps: "12-15", rest: "60s" },
                    { name: "Walking Lunges", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Glute Kickback", sets: 3, reps: "15-20", rest: "45s" }
                ]
            }
        ]
    },

    "Push, pull, legs, upper body": {
        name: "PPL + Upper Body",
        description: "Emphasizes upper body development with extra upper day",
        schedule: [
            {
                day: "Day 1",
                focus: "Push",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Overhead Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Lateral Raise", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "45s" }
                ]
            },
            {
                day: "Day 2",
                focus: "Pull",
                exercises: [
                    { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min" },
                    { name: "Pull-ups", sets: 4, reps: "8-12", rest: "90s" },
                    { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
                    { name: "Barbell Curl", sets: 3, reps: "10-12", rest: "60s" }
                ]
            },
            {
                day: "Day 3",
                focus: "Legs",
                exercises: [
                    { name: "Squat", sets: 4, reps: "8-10", rest: "2min" },
                    { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "90s" },
                    { name: "Leg Press", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Calf Raise", sets: 4, reps: "15-20", rest: "45s" }
                ]
            },
            {
                day: "Day 4",
                focus: "Upper Body",
                exercises: [
                    { name: "Incline Bench Press", sets: 4, reps: "8-10", rest: "90s" },
                    { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" },
                    { name: "Cable Row", sets: 3, reps: "12-15", rest: "60s" },
                    { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "45s" },
                    { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "45s" }
                ]
            }
        ]
    }
};
