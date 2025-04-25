import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";



const TaskDetails = ({ route }) => {
  const { task } = route.params;

  const openMap = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <ScrollView className="bg-white p-4">
      <Text className="text-xl font-bold mb-4">Damage Details</Text>

      <Image
        source={{ uri: task.image }}
        className="w-full h-64 rounded-2xl mb-4"
        resizeMode="cover"
      />

      <Text className="text-lg font-semibold mb-2">{task.type}</Text>
      <Text className="text-base text-gray-600 mb-1">Severity: {task.severity}</Text>
      <Text className="text-base text-gray-600 mb-1">Status: {task.status}</Text>
      <Text className="text-base text-gray-500 mb-2">Date: {task.date}</Text>

      <Text className="text-base mb-4">
        <Text className="font-semibold">AI Summary: </Text>
        {task.summary}
      </Text>

      <TouchableOpacity
        onPress={openMap}
        className="flex-row items-center justify-center bg-blue-600 px-4 py-3 rounded-2xl mt-4"
      >
        <Ionicons name="navigate" size={20} color="white" />
        <Text className="text-white ml-2 font-medium">Navigate to Location</Text>
      </TouchableOpacity>
      <Image
        source={{ uri: task.image }}
        className="w-full h-64 rounded-2xl mb-4"
        resizeMode="cover"
      />

      <Text className="text-lg font-semibold mb-2">{task.type}</Text>
      <Text className="text-base text-gray-600 mb-1">Severity: {task.severity}</Text>
      <Text className="text-base text-gray-600 mb-1">Status: {task.status}</Text>
      <Text className="text-base text-gray-500 mb-2">Date: {task.date}</Text>

      <Text className="text-base mb-4">
        <Text className="font-semibold">AI Summary: </Text>
        {task.summary}
      </Text>

      <TouchableOpacity
        onPress={openMap}
        className="flex-row items-center justify-center bg-blue-600 px-4 py-3 rounded-2xl mt-4"
      >
        <Ionicons name="navigate" size={20} color="white" />
        <Text className="text-white ml-2 font-medium">Navigate to Location</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TaskDetails;
