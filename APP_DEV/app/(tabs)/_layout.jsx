import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
export default function _layout() {
    
  return (
    <Tabs screenOptions={{headerShown:false}}>
        <Tabs.Screen name="Home"
        options={{
            tabBarIcon:({color,size})=> <AntDesign name="home" size={size} color={color} />,
            tabBarLabel: 'Home'
        }}
        />
        <Tabs.Screen name="Explore" 
            options={{
                tabBarIcon:({color,size})=> <Octicons name="search" size={size} color={color} />,
                tabBarLabel: 'Explore'
            }}/>
        <Tabs.Screen name="TakePhoto"
            options={{
                tabBarIcon:({color,size})=> <MaterialIcons name="add-a-photo" size={size} color={color} />,
                tabBarLabel: 'TakePhoto'
            }} />
        <Tabs.Screen name="Profile" 
            options={{
                tabBarIcon:({color,size})=> <Ionicons name="person-circle-outline" size={size} color={color} />,
                tabBarLabel: 'Profile'
            }}/>
    </Tabs>
  )
}