import { View, Text, ScrollView, Image, TouchableOpacity ,StyleSheet} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import {Stack} from 'expo-router';
import DefaultLayout from '../../components/Shared/DefaultLayout';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useIp } from '@/context/IpContext';
import Header from '@/components/Home/Header';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, ClipboardList, CircleUser as UserCircle, MapPin, Calendar } from 'lucide-react-native';
import { useContext, useState } from 'react';


const getSeverityColor = (severity) => {
  if(!severity) return 'bg-gray-500';
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


export default function Home() {
  const router = useRouter();
  const {userDetail, setUserDetail}  =useContext(UserDetailContext)
  const [recentReport , setRecentReport] = useState([]);
  const [data,setData] = useState([])
  const {ip} = useIp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const getRecentReport = async ()=>{
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found, please login again');

      const response = await fetch(`http://${ip}:3000/api/reports`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setData(data.data);
        setRecentReport(data.data.slice(0,5));
      } else {
        throw new Error('No data available');
      }
    } catch (err) {
      setError(err.message);
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  getRecentReport();
}, [ip]);


const getStats = () => {
  const total = data.filter(r => r.status === 'analyzed').length;
  const pending = data.filter(r => r.status === 'assigned').length;
  const completed = data.filter(r => r.status === 'completed').length;
  return { total, pending, completed };
};

const stats = getStats();

 return (
  <DefaultLayout>
    <Header />
    {loading ? (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f59e0b" /> 
        <Text className="mt-2 text-gray-600">Loading reports...</Text>
      </View>
    ) : (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-5 py-6 bg-white mt-[1px] mx-2 rounded-xl" style={styles.shadow}>
          {/* Stats Section */}
          <View className="flex-row justify-between">
            <View className="flex-1 items-center bg-amber-800/[40%] p-4 rounded-2xl mr-2">
              <Text className="text-2xl font-bold">{stats.total}</Text>
              <Text className="text-[16px] text-blue-700 text-center mt-1">Analyzed Reports</Text>
            </View>
            <View className="flex-1 items-center bg-amber-800/[40%] p-4 rounded-2xl mx-2">
              <Text className="text-2xl font-bold">{stats.pending}</Text>
              <Text className="text-[16px] text-yellow-700 text-center mt-1">Assigned Tasks</Text>
            </View>
            <View className="flex-1 items-center bg-amber-800/[40%] p-4 rounded-2xl ml-2">
              <Text className="text-2xl font-bold">{stats.completed}</Text>
              <Text className="text-[16px] text-green-700 mt-1">Completed</Text>
            </View>
          </View>

          {userDetail?.role === 'worker' && (
            <View className="flex-1 items-center justify-center mt-5">
              <TouchableOpacity onPress={() => router.push('/(tabs)/Tasks')} className="px-5 py-3 bg-amber-800 rounded-2xl">
                <Text className="text-white text-xl">Go to My Tasks</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Reports Section */}
        <View className="p-5 bg-white mt-3 mb-14 mx-2 rounded-xl" style={styles.shadow}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Recent Reports</Text>
          {recentReport.map((report) => (
            <View key={report._id} className="flex-row bg-white rounded-xl mb-4 border border-gray-100 overflow-hidden">
              <Image source={{ uri: report.imageUrls?.[0] || 'https://via.placeholder.com/100' }} className="w-24 h-24" />
              <View className="flex-1 p-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-bold text-gray-900">{report.title || 'Road Damage Report'}</Text>
                  <View className={`px-2 py-1 rounded-full ${getSeverityColor(report.severity)}`}>
                    <Text className="text-xs text-white font-bold">{report.severity}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={14} color="#6b7280" />
                  <Text className="text-sm text-gray-500 ml-1">{report.location?.locationName || 'Unknown'}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-1">
                  <View className="flex-row items-center">
                    <Calendar size={12} color="#9ca3af" />
                    <Text className="text-xs text-gray-400 ml-1">{new Date(report.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                    <Text className="text-xs text-white font-bold">{report.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    )}
  </DefaultLayout>
);
}

const styles = StyleSheet.create({
  shadow: {
      shadowColor: "#000",
      shadowOffset: {
          width: 0,
          height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 6,
  }
})