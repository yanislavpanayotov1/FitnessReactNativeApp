import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native'
import React, { useEffect, useState, useContext, useRef } from 'react'
import { UserContext } from './context/UserContext'
import { ThemeContext } from './context/ThemeContext'
import { useRouter } from 'expo-router'
import { clearAllStorage } from './utils/clearStorage'
import { getExerciseImage } from './utils/exerciseImages'
import { API_URL } from './utils/apiConfig'

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  weight?: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutData {
  type: string;
  split: string;
  currentWeek?: number;
  weekPercentage?: number;
  isDeload?: boolean;
  workout: {
    name: string;
    description: string;
    schedule?: WorkoutDay[];
    note?: string;
  };
}

interface ProgressData {
  cycle_number: number;
  completed_weeks: number[];
  completed_exercises: { [key: string]: boolean };
  current_week: number;
  is_cycle_complete: boolean;
}

const WEEKS = [
  { week: 1, label: 'Week 1', percentage: '70%', description: 'Foundation' },
  { week: 2, label: 'Week 2', percentage: '75%', description: 'Build' },
  { week: 3, label: 'Week 3', percentage: '80%', description: 'Peak' },
  { week: 4, label: 'Week 4', percentage: '65%', description: 'Deload' },
];

const dashboard = () => {
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [showDayCompleteModal, setShowDayCompleteModal] = useState(false);
  const [newOneRepMax, setNewOneRepMax] = useState<{ [key: string]: string }>({
    'Bench press': '',
    'Back squat': '',
    'Deadlift': ''
  });
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');

  const { userId, setUserId } = useContext(UserContext);
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetchProgress();
    } else {
      setError('Please complete onboarding first');
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (progress && userId) {
      // Only fetch if we haven't loaded data for this week yet or if the server says we're on a new week
      // This checking prevents re-fetching when we just toggle an exercise
      if (!workoutData || (progress.current_week !== selectedWeek && progress.current_week !== workoutData.currentWeek)) {
        setSelectedWeek(progress.current_week);
        fetchWorkout(progress.current_week);
      }
    }
  }, [progress?.current_week, userId]); // Only depend on current_week, not the whole progress object

  // Reset scroll position when day changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: true });
    }
  }, [selectedDay]);

  const fetchProgress = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/progress/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setProgress(data);
        if (data.is_cycle_complete) {
          setShowNewCycleModal(true);
        }
      }
    } catch (err) {
      console.error('Progress fetch error:', err);
    }
  };

  const handleLogout = async () => {
    await clearAllStorage();
    await setUserId(null);
    router.replace({ pathname: "/" });
  };

  const fetchWorkout = async (week: number) => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dashboard/${userId}?week=${week}`);
      const data = await response.json();

      if (response.ok) {
        setWorkoutData(data);
      } else {
        setError(data.error || 'Failed to load workout');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExerciseCompletion = async (exerciseIndex: number) => {
    if (!userId || !progress) return;

    const exerciseId = `w${selectedWeek}_d${selectedDay}_e${exerciseIndex}`;
    const isCompleted = !progress.completed_exercises[exerciseId];

    // Optimistic update
    const updatedExercises = { ...progress.completed_exercises };
    if (isCompleted) {
      updatedExercises[exerciseId] = true;

      // Auto-scroll to next exercise
      if (workoutData?.workout.schedule && exerciseIndex < workoutData.workout.schedule[selectedDay].exercises.length - 1) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: (exerciseIndex + 1) * (330 + 16), // 330 width + 16 margin
            animated: true
          });
        }, 500); // 500ms delay for better UX
      }
    } else {
      delete updatedExercises[exerciseId];
    }

    setProgress({
      ...progress,
      completed_exercises: updatedExercises
    });

    try {
      await fetch(`${API_URL}/progress/${userId}/exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, isCompleted })
      });

      // Check for Day Completion
      checkDayCompletion(updatedExercises);
    } catch (err) {
      console.error('Toggle completion error:', err);
      fetchProgress(); // Revert on error
    }
  };

  const checkDayCompletion = (currentExercises: { [key: string]: boolean }) => {
    if (!workoutData?.workout.schedule) return;

    const currentDay = workoutData.workout.schedule[selectedDay];
    const allExercisesCompleted = currentDay.exercises.every((_, idx) =>
      currentExercises[`w${selectedWeek}_d${selectedDay}_e${idx}`]
    );

    if (allExercisesCompleted) {
      setShowDayCompleteModal(true);

      // Check if week is also complete
      const allDaysCompleted = workoutData.workout.schedule.every((day, dIdx) =>
        day.exercises.every((_, eIdx) =>
          currentExercises[`w${selectedWeek}_d${dIdx}_e${eIdx}`]
        )
      );

      if (allDaysCompleted && !isWeekCompleted(selectedWeek)) {
        // Week Completion - checkWeekCompletion handles the logic
        checkWeekCompletion(currentExercises);
      } else if (selectedDay < workoutData.workout.schedule.length - 1) {
        // Just Day Completion -> Advance to next day automatically
        setTimeout(() => {
          setShowDayCompleteModal(false);
          setSelectedDay(prev => prev + 1);
        }, 1500);
      }
    }
  };

  const checkWeekCompletion = async (currentExercises: { [key: string]: boolean }) => {
    if (!workoutData?.workout.schedule) return;

    const allDaysCompleted = workoutData.workout.schedule.every((day, dIdx) =>
      day.exercises.every((_, eIdx) =>
        currentExercises[`w${selectedWeek}_d${dIdx}_e${eIdx}`]
      )
    );

    if (allDaysCompleted && !isWeekCompleted(selectedWeek)) {
      handleCompleteWeek();
    }
  };

  const handleCompleteWeek = async () => {
    if (!userId || completing) return;

    setCompleting(true);
    try {
      const response = await fetch(`${API_URL}/progress/${userId}/complete-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: selectedWeek })
      });

      const data = await response.json();

      if (response.ok) {
        setProgress({
          ...progress!,
          completed_weeks: data.completed_weeks,
          current_week: data.current_week,
          is_cycle_complete: data.is_cycle_complete
        });

        if (data.is_cycle_complete) {
          setShowNewCycleModal(true);
        } else {
          // Add small delay before switching to let user see "Day Complete" first if active
          setTimeout(() => {
            setSelectedWeek(data.current_week);
            fetchWorkout(data.current_week);
            setSelectedDay(0); // Reset day
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Complete week error:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleStartNewCycle = async () => {
    if (!userId) return;

    // Validate at least one value is entered
    const hasValue = Object.values(newOneRepMax).some(v => v && parseFloat(v) > 0);
    if (!hasValue) {
      alert('Please enter at least one 1RM value');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/progress/${userId}/new-cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oneRepMax: newOneRepMax })
      });

      const data = await response.json();

      if (response.ok) {
        setShowNewCycleModal(false);
        setProgress({
          cycle_number: data.cycle_number,
          completed_weeks: [],
          completed_exercises: {},
          current_week: 1,
          is_cycle_complete: false
        });
        setSelectedWeek(1);
        fetchWorkout(1);
        setSelectedDay(0);
        setNewOneRepMax({ 'Bench press': '', 'Back squat': '', 'Deadlift': '' });
      }
    } catch (err) {
      console.error('New cycle error:', err);
    }
  };

  const isWeekCompleted = (week: number) => progress?.completed_weeks.includes(week) || false;
  const isExerciseCompleted = (exerciseIndex: number) => {
    if (!progress) return false;
    return !!progress.completed_exercises[`w${selectedWeek}_d${selectedDay}_e${exerciseIndex}`];
  }

  const isDayCompleted = (dayIndex: number) => {
    if (!workoutData?.workout.schedule || !progress) return false;
    const day = workoutData.workout.schedule[dayIndex];
    return day.exercises.every((_, idx) =>
      progress.completed_exercises[`w${selectedWeek}_d${dayIndex}_e${idx}`]
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-[#162926]' : 'bg-[#F0F4F8]'}`}>
        <ActivityIndicator size="large" color={isDark ? '#F2FD7D' : '#1F2937'} />
        <Text
          style={{ fontFamily: 'Outfit_400Regular' }}
          className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Loading your workout...
        </Text>
      </View>
    );
  }

  if (error || !workoutData) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${isDark ? 'bg-[#162926]' : 'bg-[#F0F4F8]'}`}>
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text
          style={{ fontFamily: 'Outfit_700Bold' }}
          className={`text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Oops!
        </Text>
        <Text
          style={{ fontFamily: 'Outfit_400Regular' }}
          className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {error || 'No workout found'}
        </Text>

        <View className="flex-row gap-4">
          <Pressable
            className={`rounded-full px-8 py-4 active:opacity-80 ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
              }`}
            onPress={() => fetchWorkout(selectedWeek)}
          >
            <Text
              style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
              className={isDark ? 'text-[#28443f]' : 'text-white'}
            >
              Retry
            </Text>
          </Pressable>

          <Pressable
            className={`rounded-full px-8 py-4 active:opacity-80 ${isDark ? 'bg-[#28443f]' : 'bg-white border border-gray-300'
              }`}
            onPress={handleLogout}
          >
            <Text
              style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
              className={isDark ? 'text-[#F2FD7D]' : 'text-gray-700'}
            >
              Restart
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentWorkout = workoutData.workout.schedule?.[selectedDay];
  const currentWeekInfo = WEEKS[selectedWeek - 1];

  return (
    <View className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}>
      {/* New Cycle Modal */}
      <Modal visible={showNewCycleModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-[#1e3632]' : 'bg-white'}`}>
            <View className="items-center mb-6">
              <Text className="text-5xl mb-4">🎉</Text>
              <Text
                style={{ fontFamily: 'Outfit_700Bold' }}
                className={`text-2xl text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Congratulations!
              </Text>
              <Text
                style={{ fontFamily: 'Outfit_400Regular' }}
                className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                You completed Cycle {progress?.cycle_number}! Update your 1RM values to start a new stronger cycle.
              </Text>
            </View>

            {Object.keys(newOneRepMax).map((exercise) => (
              <View key={exercise} className="mb-4">
                <Text
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                  className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {exercise} (kg)
                </Text>
                <TextInput
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  className={`rounded-xl px-4 py-4 text-lg ${isDark
                    ? 'bg-[#162926] border border-[#28443f] text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                    }`}
                  placeholder="Enter new 1RM"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="numeric"
                  value={newOneRepMax[exercise]}
                  onChangeText={(text) => setNewOneRepMax({ ...newOneRepMax, [exercise]: text })}
                />
              </View>
            ))}

            <Pressable
              className={`rounded-full py-5 mt-4 active:opacity-80 ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
                }`}
              onPress={handleStartNewCycle}
            >
              <Text
                style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                className={`text-center text-lg ${isDark ? 'text-[#28443f]' : 'text-white'}`}
              >
                Start Cycle {(progress?.cycle_number || 0) + 1} 🚀
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Day Complete Modal */}
      <Modal visible={showDayCompleteModal} animationType="fade" transparent>
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className={`rounded-3xl p-6 w-full ${isDark ? 'bg-[#1e3632]' : 'bg-white'}`}>
            <Text className="text-6xl text-center mb-4">🙌</Text>
            <Text
              style={{ fontFamily: 'Outfit_700Bold' }}
              className={`text-2xl text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Day Completed!
            </Text>
            <Text
              style={{ fontFamily: 'Outfit_400Regular' }}
              className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Awesome work today. Keep up the momentum!
            </Text>
            <Pressable
              className={`rounded-full py-4 ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'}`}
              onPress={() => setShowDayCompleteModal(false)}
            >
              <Text
                style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                className={`text-center ${isDark ? 'text-[#28443f]' : 'text-white'}`}
              >
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <View className={`rounded-lg px-3 py-1 ${isDark ? 'bg-[#28443f]' : 'bg-white shadow-sm'}`}>
              <Text
                style={{ fontFamily: 'Outfit_600SemiBold' }}
                className={`text-xs ${isDark ? 'text-[#F2FD7D]' : 'text-gray-700'}`}
              >
                Cycle {progress?.cycle_number || 1}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                className={`rounded-full p-2 active:opacity-80 ${isDark ? 'bg-[#28443f]' : 'bg-white shadow-sm'
                  }`}
                onPress={() => router.push({ pathname: "/settingsScreen" })}
              >
                <Text className={`${isDark ? 'text-[#F2FD7D]' : 'text-gray-700'} text-xs`}>⚙️</Text>
              </Pressable>
              <Pressable
                className={`rounded-full px-3 py-2 active:opacity-80 ${isDark ? 'bg-[#1e3632]' : 'bg-white shadow-sm'
                  }`}
                onPress={handleLogout}
              >
                <Text
                  style={{ fontFamily: 'SpaceGrotesk_500Medium' }}
                  className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>

          <Text
            style={{ fontFamily: 'Outfit_700Bold' }}
            className={`text-2xl leading-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {workoutData.workout.name}
          </Text>
          <Text
            style={{ fontFamily: 'Outfit_400Regular' }}
            className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {/* {workoutData.workout.description} */}
          </Text>
        </View>

        {/* {workoutData.workout.note && (
          <View className="px-6 mb-6">
            <View className={`rounded-2xl p-5 ${isDark ? 'bg-[#1e3632] border border-[#28443f]' : 'bg-white border border-gray-200'
              }`}>
              <Text
                style={{ fontFamily: 'Outfit_400Regular' }}
                className={isDark ? 'text-gray-300' : 'text-gray-700'}
              >
                {workoutData.workout.note}
              </Text>
            </View>
          </View>
        )} */}

        {workoutData.workout.schedule && (
          <>
            {currentWorkout && (
              <View className="pb-4">
                <View className={`mx-6 rounded-xl p-3 mb-2 ${isDark ? 'bg-[#28443f]' : 'bg-gray-900'
                  }`}>
                  <Text
                    style={{ fontFamily: 'Outfit_700Bold' }}
                    className={`text-lg ${isDark ? 'text-[#F2FD7D]' : 'text-white'}`}
                  >
                    {currentWorkout.focus}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Outfit_400Regular' }}
                    className={`text-xs ${isDark ? 'text-[#F2FD7D]/70' : 'text-gray-300'}`}
                  >
                    {currentWorkout.exercises.length} exercises • {currentWeekInfo.percentage} intensity
                  </Text>
                </View>

                {/* Exercise Carousel */}
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                  decelerationRate="fast"
                >
                  {currentWorkout.exercises.map((exercise, idx) => {
                    const isCompleted = isExerciseCompleted(idx);
                    return (
                      <View
                        key={idx}
                        style={{ width: 330, marginRight: 16 }}
                        className={`rounded-2xl p-4 ${isDark
                          ? isCompleted ? 'bg-green-900/30 border border-green-500/50' : 'bg-[#1e3632] border border-[#28443f]'
                          : isCompleted ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
                          }`}
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <View className="flex-1">
                            <Text
                              style={{ fontFamily: 'Outfit_600SemiBold' }}
                              className={`text-lg mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              {exercise.name}
                            </Text>
                            <Text
                              style={{ fontFamily: 'Outfit_400Regular' }}
                              className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                            >
                              Exercise {idx + 1} of {currentWorkout.exercises.length}
                            </Text>
                          </View>
                          {isCompleted && (
                            <Text className="text-xl">✅</Text>
                          )}
                        </View>

                        {/* Exercise Image */}
                        {getExerciseImage(exercise.name) && (
                          <View className="items-center justify-center mb-3 rounded-xl overflow-hidden bg-white/5 h-32 w-full">
                            <Image
                              source={getExerciseImage(exercise.name)}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                          </View>
                        )}

                        {exercise.notes && (
                          <View className={`rounded-full px-2 py-0.5 self-start mb-2 ${isDark ? 'bg-[#28443f]' : 'bg-gray-100'
                            }`}>
                            <Text
                              style={{ fontFamily: 'Outfit_600SemiBold' }}
                              className={`text-[10px] ${isDark ? 'text-[#F2FD7D]' : 'text-gray-700'}`}
                            >
                              {exercise.notes}
                            </Text>
                          </View>
                        )}

                        {exercise.weight && (
                          <View className={`rounded-lg p-2 mb-2 ${isDark ? 'bg-[#28443f]' : 'bg-gray-900'}`}>
                            <Text
                              style={{ fontFamily: 'Outfit_400Regular' }}
                              className={`text-[10px] mb-0.5 ${isDark ? 'text-[#F2FD7D]/70' : 'text-gray-300'}`}
                            >
                              Weight
                            </Text>
                            <Text
                              style={{ fontFamily: 'Outfit_700Bold' }}
                              className={`text-lg ${isDark ? 'text-[#F2FD7D]' : 'text-white'}`}
                            >
                              {exercise.weight}
                            </Text>
                          </View>
                        )}

                        <View className="flex-row gap-2 mb-3">
                          <View className={`flex-1 rounded-lg p-2 ${isDark ? 'bg-[#162926] border border-[#28443f]' : 'bg-gray-50 border border-gray-200'}`}>
                            <Text style={{ fontFamily: 'Outfit_400Regular' }} className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Sets</Text>
                            <Text style={{ fontFamily: 'Outfit_700Bold' }} className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{exercise.sets}</Text>
                          </View>
                          <View className={`flex-1 rounded-lg p-2 ${isDark ? 'bg-[#162926] border border-[#28443f]' : 'bg-gray-50 border border-gray-200'}`}>
                            <Text style={{ fontFamily: 'Outfit_400Regular' }} className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Reps</Text>
                            <Text style={{ fontFamily: 'Outfit_700Bold' }} className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{exercise.reps}</Text>
                          </View>
                          <View className={`flex-1 rounded-lg p-2 ${isDark ? 'bg-[#162926] border border-[#28443f]' : 'bg-gray-50 border border-gray-200'}`}>
                            <Text style={{ fontFamily: 'Outfit_400Regular' }} className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Rest</Text>
                            <Text style={{ fontFamily: 'Outfit_700Bold' }} className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{exercise.rest}</Text>
                          </View>
                        </View>

                        <Pressable
                          className={`rounded-full py-3 active:opacity-80 mt-auto ${isCompleted
                            ? isDark ? 'bg-green-600' : 'bg-green-500'
                            : isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
                            }`}
                          onPress={() => toggleExerciseCompletion(idx)}
                        >
                          <Text
                            style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                            className={`text-center text-sm ${isCompleted
                              ? 'text-white'
                              : isDark ? 'text-[#28443f]' : 'text-white'
                              }`}
                          >
                            {isCompleted ? 'Completed ✓' : 'Complete Exercise'}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Week Selector */}
            <View className="px-6 mb-2">
              <Text
                style={{ fontFamily: 'Outfit_700Bold' }}
                className={`text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Progressive Overload Cycle
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {WEEKS.map((week) => {
                    const completed = isWeekCompleted(week.week);
                    return (
                      <Pressable
                        key={week.week}
                        className={`rounded-lg px-3 py-2 min-w-[80px] ${selectedWeek === week.week
                          ? isDark
                            ? week.week === 4 ? 'bg-orange-500' : 'bg-[#F2FD7D]'
                            : 'bg-gray-900'
                          : completed
                            ? isDark ? 'bg-green-800' : 'bg-green-100'
                            : isDark ? 'bg-[#1e3632]' : 'bg-white'
                          }`}
                        onPress={() => {
                          setSelectedWeek(week.week);
                          fetchWorkout(week.week);
                          setSelectedDay(0); // Reset day on week switch
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            style={{ fontFamily: 'Outfit_600SemiBold' }}
                            className={`text-xs ${selectedWeek === week.week
                              ? isDark ? 'text-[#28443f]' : 'text-white'
                              : completed
                                ? isDark ? 'text-green-400' : 'text-green-700'
                                : isDark ? 'text-white' : 'text-gray-900'
                              }`}
                          >
                            {week.label}
                          </Text>
                          {completed && (
                            <Text className="ml-1 text-xs">✓</Text>
                          )}
                        </View>
                        <Text
                          style={{ fontFamily: 'Outfit_400Regular' }}
                          className={`text-[10px] ${selectedWeek === week.week
                            ? isDark ? 'text-[#28443f]/70' : 'text-gray-300'
                            : isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                        >
                          {week.description}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Week Info Badge (Hidden when compact, or simplified? I'll hide it for max compaction or keep it very small) */}
              {/* Keeping it simple - removing for "everything in screen" goal or making it tiny. Let's make it tiny. */}
              <View className={`rounded-xl p-2 mt-2 flex-row items-center ${currentWeekInfo.week === 4
                ? isDark ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-orange-50 border border-orange-200'
                : isDark ? 'bg-[#28443f]' : 'bg-gray-900'
                }`}>
                <Text className="text-lg mr-2">
                  {currentWeekInfo.week === 4 ? '🧘' : currentWeekInfo.week === 3 ? '🔥' : '💪'}
                </Text>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                    className={`text-xs ${currentWeekInfo.week === 4
                      ? isDark ? 'text-orange-400' : 'text-orange-700'
                      : isDark ? 'text-[#F2FD7D]' : 'text-white'
                      }`}
                  >
                    {currentWeekInfo.week === 4 ? 'Deload Week' : `${currentWeekInfo.description} Phase`} • {currentWeekInfo.percentage}
                  </Text>
                </View>
              </View>
            </View>

            {/* Day Selector */}
            <View className="px-6 mb-2">
              <Text
                style={{ fontFamily: 'Outfit_700Bold' }}
                className={`text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Daily Schedule
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {workoutData.workout.schedule.map((day, idx) => {
                    const completed = isDayCompleted(idx);
                    return (
                      <Pressable
                        key={idx}
                        className={`rounded-lg px-4 py-2 ${selectedDay === idx
                          ? isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
                          : completed
                            ? isDark ? 'bg-green-800' : 'bg-green-100'
                            : isDark ? 'bg-[#1e3632]' : 'bg-white'
                          }`}
                        onPress={() => setSelectedDay(idx)}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            style={{ fontFamily: 'Outfit_600SemiBold' }}
                            className={`text-sm ${selectedDay === idx
                              ? isDark ? 'text-[#28443f]' : 'text-white'
                              : completed
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-white' : 'text-gray-900'
                              }`}
                          >
                            {day.day}
                          </Text>
                          {completed && (
                            <Text className="ml-1 text-xs">✓</Text>
                          )}
                        </View>
                        <Text
                          style={{ fontFamily: 'Outfit_400Regular' }}
                          className={`text-[10px] ${selectedDay === idx
                            ? isDark ? 'text-[#28443f]/70' : 'text-gray-300'
                            : completed
                              ? isDark ? 'text-green-400/70' : 'text-green-600'
                              : isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                        >
                          {day.focus}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </ScrollView>
            </View>


          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

export default dashboard
