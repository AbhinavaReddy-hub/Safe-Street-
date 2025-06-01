import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator, ToastAndroid } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { MapPin, ArrowRight, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultLayout from '../../components/Shared/DefaultLayout';
import { useIp } from '../../context/IpContext';

const getSeverityColor = (severity) => {
  switch (severity) {
    case severity>7:
      return 'bg-red-500';
    case severity<=7 && severity>4:
      return 'bg-amber-500';
    case severity<5:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-red-500';
    case 'assigned': return 'bg-yellow-200';
    case 'completed':
      return 'bg-green-200';
    default:
      return 'bg-gray-200';
  }
};

const openMapsWithDirections = (coordinates) => {
  if (coordinates[0] && coordinates[1]) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    Linking.openURL(url);
  } else {
    ToastAndroid.show('Location coordinates not available', ToastAndroid.SHORT);
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'Unknown date';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function Tasks() {
  const router = useRouter();
  const navigation = useNavigation();
  const { ip } = useIp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found, please login again');

      const response = await fetch(`http://${ip}:3000/api/admin/worker/reports`, {
        method: 'GET',
        headers: {
         'authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setTasks(data.data);
      } else {
        throw new Error('No tasks available');
      }
    } catch (err) {
      setError(err.message);
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [ip]);


  const handleResolveTask = async (caseId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log(caseId);
      if (!token) throw new Error('No token found, please login again');

      const response = await fetch(`http://${ip}:3000/api/admin/worker/complete`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
      });
      const text = await response.json();
console.log('Raw response body:', text);


      if (!response.ok) throw new Error('Failed to resolve task');
      
      ToastAndroid.show('Task marked as resolved', ToastAndroid.SHORT);
      fetchTasks();
    } catch (err) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  };

  const TaskCard = ({ task }) => (
    <View className="bg-white rounded-xl shadow-md mb-4 overflow-hidden">
      <View className="flex-row">
        <Image 
          source={{ 
            uri: task.reportId.imageUrls?.[0] || 'https://via.placeholder.com/128x128?text=No+Image' 
          }} 
          className="w-32 h-32" 
          resizeMode="cover"
        />
        <View className="flex-1 p-4 pr-10">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                {task.title || task.reportId.damageType || 'Road Issue'}
              </Text>
              <Text className="text-sm text-gray-500">
                {task.reportId.location.locationName || 'Location not specified'}
              </Text>
            </View>
            <View className={`px-2 py-1 rounded-full ${getSeverityColor(task.reportId.priorityScore)}`}>
              <Text className="text-xs text-white font-semibold">
                {task.reportId.priorityScore || 0}
              </Text>
            </View>
          </View>

          {task.message && (
            <Text numberOfLines={2} className="text-sm text-gray-600 mb-3">
              {task.message}
            </Text>
          )}

          <View className="flex-row justify-between items-center">
            <View className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
              <Text className="text-xs font-semibold">
                {task.status?.toUpperCase() || 'PENDING'}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              {formatDate(task.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row border-t border-gray-100 divide-x divide-gray-100">

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 bg-gray-50"
          onPress={() => openMapsWithDirections(task.reportId.location.coordinates)}
        >
          <MapPin size={16} color="#3b82f6" />
          <Text className="text-sm text-blue-500 ml-2">Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 bg-gray-50"
          onPress={() => handleResolveTask(task.caseId)}
        >
          <CheckCircle2 size={16} color="#3b82f6" />
          <Text className="text-sm text-blue-500 ml-2">Resolve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <DefaultLayout>
      <View className="flex-1 bg-gray-100">
        <View className="bg-white px-5 pt-14 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
          <View className="flex-row items-center mt-2">
            <AlertCircle size={16} color="#6b7280" />
            <Text className="text-gray-500 ml-2">
              {loading ? 'Loading...' : `${tasks.length} tasks assigned`}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-5 pt-4">
          {loading && (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-2">Loading tasks...</Text>
            </View>
          )}

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-600 text-center">{error}</Text>
              <TouchableOpacity 
                className="mt-2 bg-red-500 py-2 px-4 rounded self-center"
                onPress={fetchTasks}
              >
                <Text className="text-white text-sm">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && tasks.length === 0 && !error && (
            <View className="flex-1 justify-center items-center py-20">
              <AlertCircle size={48} color="#9ca3af" />
              <Text className="text-gray-600 text-center mt-4 text-lg">
                No tasks assigned yet
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Tasks will appear here when they are assigned to you
              </Text>
            </View>
          )}

          {!loading && tasks.map((task, index) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </ScrollView>
      </View>
    </DefaultLayout>
  );
}