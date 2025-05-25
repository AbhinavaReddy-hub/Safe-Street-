import { View, Text,ScrollView } from 'react-native'
import DefaultLayout from '../../components/Shared/DefaultLayout'
import React, { useState } from 'react'


const History = () => {
    const [hist, setHist]= useState([]);
  return (
    <DefaultLayout>
        <ScrollView className="flex-1 bg-gray-50 px-3 mt-10">
            <Text>History</Text>
        </ScrollView>
    </DefaultLayout>
  )
}

export default History