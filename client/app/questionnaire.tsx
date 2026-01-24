import { View } from 'react-native'
import React, { useContext } from 'react'
import QuestionnaireScreen from './components/QuestionCard'
import { ThemeContext } from './context/ThemeContext'

const questionnaire = () => {
  const { isDark } = useContext(ThemeContext)

  return (
    <View className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}>
      <QuestionnaireScreen />
    </View>
  )
}

export default questionnaire