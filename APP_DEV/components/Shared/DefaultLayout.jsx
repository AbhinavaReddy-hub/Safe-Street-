// components/DefaultLayout.js
import { View ,Text,ScrollView, Button, Pressable,Modal, TouchableWithoutFeedback,Platform} from 'react-native';
 
import { useEffect } from 'react';
import {Stack} from 'expo-router';
import Footer from '../Home/Footer';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from "../Home/Header";
import { useContext } from 'react';
import {UserDetailContext} from '../../context/UserDetailContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const DefaultLayout = ({ children }) => {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isNewNotif , setNewNotif] = useState(false);
  const {userDetail,setUserDetail} = useContext(UserDetailContext);
  const router = useRouter();
  
const mockUser = {
    name: 'John Doe',
    stats: {
      totalReports: 24,
      pendingTasks: 5,
      resolvedCases: 19,
    },
    recentReports: [
      {
        id: 1,
        image: 'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
        type: 'Pothole',
        severity: 'High',
        status: 'Pending',
        location: 'Miyapur, Hyderabad',
        date: '2024-02-20',
      },
      {
        id: 2,
        image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
        type: 'Crack',
        severity: 'Medium',
        status: 'In Progress',
        location: 'Narayanaguda',
        date: '2024-02-19',
      },
      {
        id: 3,
        image: 'https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.jpg?s=612x612&w=0&k=20&c=C6x40SIitvOnljrXy-1AZcZ16k3rhmkqnXEDVz-ifZ0=',
        type: 'Surface Damage',
        severity: 'Low',
        status: 'Completed',
        location: 'Gachibowli',
        date: '2024-02-18',
      },
    ],
  };
  
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
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-red-500';
      case 'in progress':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  const insets = useSafeAreaInsets(); 
 

  return (
    <>
  
      <View style={{ flex: 1 ,paddingBottom: insets.bottom}}>
        {/* Page Content */}
        <View style={{ flex: 1 }}>
          {children}
        </View>

      
        <Footer/>
      </View>
    </>
  );
};

export default DefaultLayout;
