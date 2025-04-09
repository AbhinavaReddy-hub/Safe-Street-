import { View, Text, Pressable } from 'react-native';
import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter, usePathname } from 'expo-router';

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <View className="bottom-0 flex-row justify-around items-center pt-1 bg-amber-800/[40%]">
      <Pressable
        className="flex-col gap-1 items-center justify-center "
        onPress={() => router.replace('/Home')}>
        <MaterialIcons name="home" size={24} color={isActive('/Home') ? 'white' : 'black'} />
        <Text className={`text-16 ${isActive('/Home') ? 'text-white' : 'text-black'}`}>Home</Text>
      </Pressable>

      <Pressable
        className="flex-col gap-1 items-center justify-center"
        onPress={() => router.replace('/Tasks')}>
        <FontAwesome5 name="tasks" size={24} color={isActive('/Tasks') ? 'white' : 'black'} />
        <Text className={`text-16 ${isActive('/Tasks') ? 'text-white' : 'text-black'}`}>My Tasks</Text>
      </Pressable>
      <Pressable
        className="flex-col gap items-center justify-center absolute bottom-4 left-[39%] border-gray-50 border-[6px]  rounded-full p-3 bg-amber-800"
        onPress={() => router.replace('/Upload')}>
          <MaterialIcons name="camera-alt" size={24} color={isActive('/Upload') ? 'white' : 'black'} />
          <Text className={`text-16 ${isActive('/Upload') ? 'text-white' : 'text-black'}`}>Upload</Text>
      </Pressable>
      
      <Pressable
        className="flex-col gap-1 items-center justify-center ml-5 relative"
        onPress={() => router.replace('/Notification')}>
        <Ionicons name="notifications" size={24} color={isActive('/Notification') ? 'white' : 'black'} />
        {!isActive('/Notification') && <View className='rounded-full bg-red-600 p-[0.1rem] absolute w-[20px] bottom-9 items-center right-5'>
          <Text className='text-18 text-white font-semibold'>{3}</Text>
        </View>}
        <Text className={`text-16 ${isActive('/Notification') ? 'text-white' : 'text-black'}`}>Notifications</Text>
      </Pressable>

      <Pressable
        className="flex-col gap-1 items-center justify-center"
        onPress={() => router.replace('/Profile')}>
        <FontAwesome name="user-circle-o" size={24} color={isActive('/Profile') ? 'white' : 'black'} />
        <Text className={`text-16 ${isActive('/Profile') ? 'text-white' : 'text-black'}`}>Profile</Text>
      </Pressable>
    </View>
  );
};

export default Footer;
