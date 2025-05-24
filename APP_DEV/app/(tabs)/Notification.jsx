// components/Notification.js
import { View, Text ,ScrollView,StyleSheet,Image, TouchableOpacity,Modal ,Pressable} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useState } from 'react';
import DefaultLayout from '../../components/Shared/DefaultLayout';
import React from 'react';

const Notification = () => {

  const notifications = [
    {
      "id": "notif_001",
      "src":'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
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
      "src": 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
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
      "src" : 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
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
      "src" : 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
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
      "src" : 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
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

  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const openImage = (uri) => {
    setCurrentImage([{ uri }]);
    setIsImageViewVisible(true);
  };
  
  const closeImage = () => {
    setIsImageViewVisible(false);
  };
  
      return (
        <DefaultLayout>
          <ScrollView className="flex-1 bg-gray-50 px-3">
            <View>
              <Text className="mt-[30px] text-center font-bold text-2xl mb-4">Messages</Text>
            </View>
          {notifications.map((data) => (
            <View key={data.id} className="mb-3 p-2 bg-white rounded-lg flex-1 flex-row gap-2 " style={styles.shadow}>
              <View>
                <TouchableOpacity onPress={()=>openImage(data.src)}>
                  <Image source ={{uri:data.src}} className="w-16 h-16 rounded-full "/>
                </TouchableOpacity>
                
              </View>
              <View className="flex-1">
                <View className='flex-row justify-between'>
                  <Text className="font-semibold text-[16px] text-black">{data.title}</Text>
                  <View className={`w-3 h-3 rounded-full ${getSeverityColor(data.severity)}`} />
                </View>
                <Text className="text-gray-700 break-words">{data.message}</Text>
                <Text className="text-xs text-gray-500">{data.location}</Text>
                <Text className="text-xs italic text-gray-400">{data.severity}</Text>
              </View>
              
          </View>
        ))}
        <ImageViewing
          images={currentImage || []}
          imageIndex={0}
          visible={isImageViewVisible}
          onRequestClose={closeImage}
        />
      </ScrollView>
    </DefaultLayout>

  );
};



const styles = StyleSheet.create({
  shadow: {
      shadowColor: "#000000",
      shadowOffset: {
          width: 1,
          height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius:1,

      elevation: 15,
  }
})


export default Notification;
