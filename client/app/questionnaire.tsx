import { View } from 'react-native'
import React from 'react'
import QuestionnaireScreen from './components/QuestionCard'

const questionnaire = () => {
  return (
    <View className='flex-1 justify-start items-center mt-[60px]'>
      <QuestionnaireScreen/>
    </View>
  )
}

export default questionnaire