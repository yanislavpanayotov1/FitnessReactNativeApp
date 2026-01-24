const MINIMUM_WEIGHT = 2.5;

export function calculateTrainingWeight(oneRepMax, percentage) {
    if (!oneRepMax || oneRepMax <= 0) return null;
    const weight = oneRepMax * percentage;
    const roundedWeight = Math.round(weight / 2.5) * 2.5;
    return Math.max(roundedWeight, MINIMUM_WEIGHT);
}

export function getProgressiveOverloadWeights(oneRepMax, weekNumber = 1) {
    const weekInCycle = ((weekNumber - 1) % 4) + 1;

    const percentages = {
        1: 0.70,
        2: 0.75,
        3: 0.80,
        4: 0.65
    };

    const cycleNumber = Math.floor((weekNumber - 1) / 4);
    const adjustedMax = oneRepMax + (cycleNumber * 2.5);

    return {
        week: weekNumber,
        weekInCycle,
        percentage: percentages[weekInCycle],
        weight: calculateTrainingWeight(adjustedMax, percentages[weekInCycle]),
        isDeload: weekInCycle === 4
    };
}

export function getRepRange(percentage) {
    if (percentage >= 0.85) return "3-5";
    if (percentage >= 0.75) return "6-8";
    if (percentage >= 0.65) return "8-12";
    return "12-15";
}

export function generateProgressiveExercise(exercise, oneRepMax, sets = 4, weekNumber = 1) {
    const progression = getProgressiveOverloadWeights(oneRepMax, weekNumber);

    return {
        name: exercise,
        sets,
        weight: progression.weight ? `${progression.weight}kg` : "bodyweight",
        reps: getRepRange(progression.percentage),
        rest: progression.percentage >= 0.75 ? "2-3min" : "90s",
        notes: progression.isDeload ? "Deload week - focus on form" : `Week ${progression.weekInCycle} - ${Math.round(progression.percentage * 100)}% 1RM`
    };
}

export function getExercise1RM(exerciseName, oneRepMaxData) {
    const exerciseLower = exerciseName.toLowerCase();

    if (exerciseLower.includes('bench') && !exerciseLower.includes('leg')) {
        return oneRepMaxData['Bench press'] || null;
    }
    if (exerciseLower.includes('squat')) {
        return oneRepMaxData['Back squat'] || null;
    }
    if (exerciseLower.includes('deadlift')) {
        return oneRepMaxData['Deadlift'] || null;
    }

    return null;
}

export function estimateExerciseWeight(exerciseName, oneRepMaxData, weekNumber = 1) {
    const exerciseLower = exerciseName.toLowerCase();

    const benchPress = parseFloat(oneRepMaxData['Bench press']) || 0;
    const squat = parseFloat(oneRepMaxData['Back squat']) || 0;
    const deadlift = parseFloat(oneRepMaxData['Deadlift']) || 0;

    if (!benchPress && !squat && !deadlift) {
        return null;
    }

    const upperStrength = benchPress || (deadlift * 0.6) || (squat * 0.75);
    const lowerStrength = squat || (deadlift * 0.8) || (benchPress * 1.3);

    const exerciseRatios = {
        'bench press': { base: benchPress, ratio: 0.75, baseName: 'Bench' },
        'incline bench': { base: benchPress, ratio: 0.65, baseName: 'Bench' },
        'incline dumbbell press': { base: benchPress, ratio: 0.30, baseName: 'Bench' },
        'dumbbell bench press': { base: benchPress, ratio: 0.35, baseName: 'Bench' },
        'overhead press': { base: benchPress, ratio: 0.50, baseName: 'Bench' },
        'dumbbell shoulder press': { base: benchPress, ratio: 0.25, baseName: 'Bench' },
        'dips': { base: upperStrength, ratio: 0, baseName: null },
        'push-ups': { base: upperStrength, ratio: 0, baseName: null },

        'barbell row': { base: benchPress, ratio: 0.65, baseName: 'Bench' },
        'pull-ups': { base: upperStrength, ratio: 0, baseName: null },
        'lat pulldown': { base: upperStrength, ratio: 0.60, baseName: 'Upper' },
        'cable row': { base: upperStrength, ratio: 0.55, baseName: 'Upper' },

        'squat': { base: squat, ratio: 0.75, baseName: 'Squat' },
        'front squat': { base: squat, ratio: 0.60, baseName: 'Squat' },
        'deadlift': { base: deadlift, ratio: 0.75, baseName: 'Deadlift' },
        'romanian deadlift': { base: deadlift, ratio: 0.55, baseName: 'Deadlift' },
        'leg press': { base: squat, ratio: 1.2, baseName: 'Squat' },
        'bulgarian split squat': { base: squat, ratio: 0.25, baseName: 'Squat' },
        'leg extension': { base: squat, ratio: 0.40, baseName: 'Squat' },
        'leg curl': { base: squat, ratio: 0.35, baseName: 'Squat' },
        'hamstring curl': { base: squat, ratio: 0.30, baseName: 'Squat' },
        'calf raise': { base: lowerStrength, ratio: 0.60, baseName: 'Lower' },
        'seated calf raise': { base: lowerStrength, ratio: 0.40, baseName: 'Lower' },
        'hip thrust': { base: squat, ratio: 0.80, baseName: 'Squat' },
        'walking lunges': { base: squat, ratio: 0.20, baseName: 'Squat' },

        'dumbbell curl': { base: upperStrength, ratio: 0.15, baseName: 'Upper' },
        'barbell curl': { base: upperStrength, ratio: 0.35, baseName: 'Upper' },
        'hammer curl': { base: upperStrength, ratio: 0.18, baseName: 'Upper' },
        'cable curl': { base: upperStrength, ratio: 0.30, baseName: 'Upper' },
        'tricep pushdown': { base: upperStrength, ratio: 0.35, baseName: 'Upper' },
        'overhead tricep extension': { base: upperStrength, ratio: 0.25, baseName: 'Upper' },
        'tricep dips': { base: upperStrength, ratio: 0, baseName: null },
        'lateral raise': { base: upperStrength, ratio: 0.12, baseName: 'Upper' },
        'front raise': { base: upperStrength, ratio: 0.12, baseName: 'Upper' },
        'rear delt fly': { base: upperStrength, ratio: 0.10, baseName: 'Upper' },
        'face pulls': { base: upperStrength, ratio: 0.25, baseName: 'Upper' },
        'cable fly': { base: benchPress, ratio: 0.20, baseName: 'Bench' },
    };

    let matchedRatio = null;
    for (const [key, value] of Object.entries(exerciseRatios)) {
        if (exerciseLower.includes(key)) {
            matchedRatio = value;
            break;
        }
    }

    if (!matchedRatio) {
        if (exerciseLower.includes('curl') || exerciseLower.includes('raise')) {
            matchedRatio = { base: upperStrength, ratio: 0.15, baseName: 'Upper' };
        } else if (exerciseLower.includes('press')) {
            matchedRatio = { base: upperStrength, ratio: 0.40, baseName: 'Upper' };
        } else if (exerciseLower.includes('row') || exerciseLower.includes('pull')) {
            matchedRatio = { base: upperStrength, ratio: 0.50, baseName: 'Upper' };
        } else {
            return null;
        }
    }

    if (matchedRatio.ratio === 0) {
        return {
            weight: 'bodyweight',
            notes: null
        };
    }

    const baseWeight = matchedRatio.base * matchedRatio.ratio;

    const progression = getProgressiveOverloadWeights(100, weekNumber);
    const finalWeight = baseWeight * (progression.percentage / 0.75);

    const weight = Math.max(Math.round(finalWeight / 2.5) * 2.5, MINIMUM_WEIGHT);

    const percentage = Math.round(matchedRatio.ratio * 100);
    const notes = `${percentage}% of ${matchedRatio.baseName} 1RM`;

    return {
        weight,
        notes
    };
}
