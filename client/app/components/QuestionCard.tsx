import { useNavigation } from "expo-router";
import { useLayoutEffect, useState, useContext } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import questions from "../data/questions.json";
import { SessionContext } from "../context/SessionContext";
import { ThemeContext } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { API_URL } from "../utils/apiConfig";


export default function QuestionnaireScreen() {

  const router = useRouter();
  const [currentId, setCurrentId] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const navigation = useNavigation();
  const currentQuestion = questions[currentId];

  const { sessionId } = useContext(SessionContext);
  const { isDark } = useContext(ThemeContext);

  useLayoutEffect(() => {
    navigation.setOptions({ title: currentQuestion.headerTitle });
  }, [currentId]);

  const handleOptionSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option })
    goToNext();
  }
  const handleInputChange = (field: string, value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: { ...answers[currentQuestion.id], [field]: value }
    });
  };

  const goToNext = async () => {
    if (currentQuestion.id === 3) {
      const oneRepMaxValues = answers[currentQuestion.id];
      const hasAtLeastOne = oneRepMaxValues && Object.values(oneRepMaxValues).some((val: any) => val && val.trim() !== '');

      if (!hasAtLeastOne) {
        alert('Please enter at least one 1 Rep Max value to continue');
        return;
      }
    }

    if (currentId < questions.length - 1) {
      setCurrentId(currentId + 1);
    } else {
      try {
        const response = await fetch(`${API_URL}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, sessionId }),
        });
        const data = await response.json();
        console.log(data);
        router.replace('/paywallScreen');
      } catch (error) {
        console.error('Error submitting answers:', error);
      }
    }
  }

  const progress = ((currentId + 1) / questions.length) * 100;

  return (
    <View className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}>
      <View className="px-6 pt-14 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className={`rounded-xl px-4 py-2 ${isDark ? 'bg-[#28443f]' : 'bg-white shadow-sm'}`}>
            <Text
              style={{ fontFamily: 'Outfit_600SemiBold' }}
              className={`text-sm ${isDark ? 'text-[#F2FD7D]' : 'text-gray-700'}`}
            >
              {currentQuestion.headerTitle}
            </Text>
          </View>
          <Pressable
            className={`rounded-full px-4 py-2 active:opacity-80 ${isDark ? 'bg-[#1e3632]' : 'bg-white shadow-sm'
              }`}
            onPress={() => goToNext()}
          >
            <Text
              style={{ fontFamily: 'SpaceGrotesk_500Medium' }}
              className={isDark ? 'text-gray-400' : 'text-gray-500'}
            >
              Skip
            </Text>
          </Pressable>
        </View>

        <View className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#28443f]' : 'bg-gray-200'}`}>
          <View
            className={`h-full rounded-full ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'}`}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text
          style={{ fontFamily: 'Outfit_700Bold' }}
          className={`text-4xl leading-tight mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {currentQuestion.question}
        </Text>

        {currentQuestion.options &&
          currentQuestion.options.map((opt: any, idx: number) => (
            <Pressable
              key={idx}
              className={`rounded-2xl p-5 mb-3 active:opacity-70 ${isDark
                ? 'bg-[#1e3632] border border-[#28443f]'
                : 'bg-white border border-gray-200'
                }`}
              onPress={() => handleOptionSelect(opt.option)}
            >
              <Text
                style={{ fontFamily: 'Outfit_600SemiBold' }}
                className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {opt.option}
              </Text>
              {opt.description && (
                <Text
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {opt.description}
                </Text>
              )}
            </Pressable>
          ))}

        {currentQuestion.inputFields &&
          currentQuestion.inputFields.map((field: any, idx: number) => (
            <View key={idx} className="mb-4">
              <View className={`rounded-2xl p-5 ${isDark
                ? 'bg-[#1e3632] border border-[#28443f]'
                : 'bg-white border border-gray-200'
                }`}>
                <Text
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                  className={`text-base mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {field.label}
                </Text>
                <TextInput
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  className={`rounded-xl px-4 py-4 text-lg ${isDark
                    ? 'bg-[#162926] border border-[#28443f] text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                    }`}
                  keyboardType="numeric"
                  placeholder={field.placeholder}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  value={answers[currentQuestion.id]?.[field.label] || ""}
                  onChangeText={(text) => handleInputChange(field.label, text)}
                />
              </View>
            </View>
          ))}

        {currentQuestion.inputFields && (
          <Pressable
            className={`rounded-full py-5 mb-8 active:opacity-80 ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
              }`}
            onPress={goToNext}
          >
            <Text
              style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
              className={`text-center text-lg ${isDark ? 'text-[#28443f]' : 'text-white'}`}
            >
              {currentId < questions.length - 1 ? 'Next' : 'Complete'}
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}