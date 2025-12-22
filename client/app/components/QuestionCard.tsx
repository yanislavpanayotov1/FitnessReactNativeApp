import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Button, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import questions from "../data/questions.json";

export default function QuestionnaireScreen() {

    const [currentId, setCurrentId] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const navigation = useNavigation();
    const currentQuestion = questions[currentId];

    useLayoutEffect(() => {
        navigation.setOptions({ title: currentQuestion.headerTitle });
      }, [currentId]);

    const handleOptionSelect = (option: string) => {
        setAnswers({...answers, [currentQuestion.id]: option})
        goToNext();
    }
    const handleInputChange = (field: string, value: string) => {
        setAnswers({
          ...answers,
          [currentQuestion.id]: { ...answers[currentQuestion.id], [field]: value }
        });
      };

      const goToNext = () => {
        if (currentId < questions.length - 1) {
          setCurrentId(currentId + 1);
        } else {
          console.log("Questionnaire complete:", answers);
        }
      };  

      return (
        <ScrollView>
           <View className="flex-1 flex-row justify-between items-center mt-2 mb-4 ">   
                <Text className="text-2xl text-black font-bold ml-[100px]">{currentQuestion.headerTitle}</Text>
                 <Pressable
                     className="rounded-md bg-slate-500 mr-4"
                     onPress={() => console.log("Pressed")}
                 >
                    <Text className="text-1xl text-center text-black font-bold mr-4">Skip</Text>
                </Pressable>
            </View>
          <Text >{currentQuestion.question}</Text>
              {currentQuestion.options &&
            currentQuestion.options.map((opt: any, idx: number) => (
              <View key={idx} className="grid grid-cols-1 justify-between items-center rounded-full h-15 w-[90%] bg-slate-500 px-3 py-2">
                <Pressable
                  onPress={() => handleOptionSelect(opt.option)}
                >
                  <Text className="text-black font-medium">{opt.option}</Text>
                  <Text className="text-xs text-slate-700 mt-1">
                    {opt.description}
                  </Text>
                </Pressable>
              </View>
            ))}
    
          {currentQuestion.inputFields &&
            currentQuestion.inputFields.map((field: any, idx: number) => (
              <View key={idx} >
                <Text>{field.label}</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder={field.placeholder}
                  value={answers[currentQuestion.id]?.[field.label] || ""}
                  onChangeText={(text) => handleInputChange(field.label, text)}
                />
              </View>
            ))}
          {currentQuestion.inputFields && (
            <Button title="Next" onPress={goToNext} />
          )}
        </ScrollView>
      );
    }