// components/Notification.js
import { View, Text, ScrollView } from 'react-native';
import DefaultLayout from '../../components/Shared/DefaultLayout';
import React from 'react';

const Notification = () => {

  const notifications = [
    {
      "id": "notif_001",
      "type": "damage_reported",
      "title": "New Road Damage Reported",
      "message": "A new pothole has been reported in Sector 12.",
      "severity": "medium",
      "location": "Sector 12, Main Road",
      "timestamp": "2025-04-04T09:15:00Z",
      "read": false
    },
    {
      "id": "notif_002",
      "type": "status_update",
      "title": "Repair Scheduled",
      "message": "Road damage in Sector 9 has been scheduled for repair on April 7.",
      "severity": "low",
      "location": "Sector 9, Park Avenue",
      "timestamp": "2025-04-03T16:30:00Z",
      "read": false
    },
    {
      "id": "notif_003",
      "type": "damage_alert",
      "title": "High-Severity Damage Alert",
      "message": "Multiple severe cracks detected on Highway 22. Immediate attention required.",
      "severity": "high",
      "location": "Highway 22",
      "timestamp": "2025-04-03T08:00:00Z",
      "read": true
    },
    {
      "id": "notif_004",
      "type": "feedback_received",
      "title": "Feedback Submitted",
      "message": "Your feedback on the Sector 4 repair has been received. Thank you!",
      "severity": "info",
      "location": "Sector 4",
      "timestamp": "2025-04-02T12:45:00Z",
      "read": true
    },
    {
      "id": "notif_005",
      "type": "maintenance_reminder",
      "title": "Routine Inspection Due",
      "message": "Routine road inspection for Zone B is due this week.",
      "severity": "info",
      "location": "Zone B",
      "timestamp": "2025-04-01T10:00:00Z",
      "read": false
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };


  return (
    <DefaultLayout>
      <ScrollView className=" w-full px-4 mt-[20px]">
        {notifications.map((data) => (
          <View key={data.id} className="mb-3 p-2 bg-white rounded-lg shadow">
            <View className='flex-1 flex-row mr-10 justify-between'>
              <Text className="font-bold text-[16px] text-black">{data.title}</Text>
              <View className={`w-2 h-2 rounded-full mr-2 ${getSeverityColor(data.severity)}`} />
            </View>

            <Text className="text-gray-700">{data.message}</Text>
            <Text className="text-xs text-gray-500">{data.location}</Text>
            <Text className="text-xs italic text-gray-400">{data.severity}</Text>
          </View>
        ))}
      </ScrollView>
    </DefaultLayout>

  );
};

export default Notification;
