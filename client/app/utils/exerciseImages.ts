export const exerciseImages: { [key: string]: any } = {
    "BarbellRow": require('../../assets/exercises/BarbellRow.png'),
    "BenchPress": require('../../assets/exercises/BenchPress.png'),
    "Deadlift": require('../../assets/exercises/Deadlift.png'),
    "DumbbellCurl": require('../../assets/exercises/DumbbellCurl.png'),
    "DumbbellShoulderPress": require('../../assets/exercises/DumbbellShoulderPress.png'),
    "InclineDumbbellPress": require('../../assets/exercises/InclineDumbbellPress.png'),
    "LatPulldown": require('../../assets/exercises/LatPulldown.png'),
    "OverheadPress": require('../../assets/exercises/OverheadPress.png'),
    "OverheadTricepExtension": require('../../assets/exercises/OverheadTricepExtension.png'),
    "RomanianDeadlift": require('../../assets/exercises/RomanianDeadlift.png'),
    "Squat": require('../../assets/exercises/Squat.png'),
};

export const getExerciseImage = (exerciseName: string) => {
    // Remove spaces and special characters to match the filename convention
    // e.g. "Bench Press" -> "BenchPress"
    const key = exerciseName.replace(/[^a-zA-Z0-9]/g, '');
    return exerciseImages[key];
};
