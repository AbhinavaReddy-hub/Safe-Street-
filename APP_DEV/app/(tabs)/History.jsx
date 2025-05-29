import { View, Text, ScrollView, ActivityIndicator, ToastAndroid, Image } from 'react-native';
import DefaultLayout from '../../components/Shared/DefaultLayout';
import React, { useState, useEffect } from 'react';
import { useIp } from '../../context/IpContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const History = () => {
  const { ip } = useIp();
  const [hist, setHist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
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
        setHist(data.data);
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
    fetchHistory();
  }, [ip]);


  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DefaultLayout>
      <ScrollView className="flex-1 bg-gray-50 px-4 mt-10">
        <Text className="text-2xl font-extrabold mb-6 text-gray-800">History</Text>

        {loading && <ActivityIndicator size="large" color="#3b82f6" />}
        {error && <Text className="text-red-600 mb-4">{error}</Text>}

        {!loading && hist.length === 0 && !error && (
          <Text className="text-gray-600 text-center mt-10">No history available.</Text>
        )}

        {hist.map((item, index) => (
          <View
            key={index}
            className="flex-row bg-white rounded-lg shadow-md p-4 mb-4 items-center"
          >
            <Image
              source={{ uri: item.imageUrls?.[0] || 'https://via.placeholder.com/80' }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />

            <View className="flex-1 ml-4">
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                {item.title || 'Road Damage Report'}
              </Text>
              <Text className="text-gray-600 mb-1">{item.message || 'No additional details.'}</Text>

              <View className="flex-row items-center mt-2">
                <View
                  className={`px-2 py-1 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-green-200'
                      : item.status === 'assigned'
                      ? 'bg-yellow-200'
                      : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      item.status === 'analyzed'
                        ? 'text-green-800'
                        : item.status === 'pending'
                        ? 'text-yellow-800'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
                <Text className="ml-4 text-sm text-gray-500">
                  Severity: <Text className="font-semibold">{item.severity}</Text>
                </Text>
              </View>

              {/* Reported at date */}
              <Text className="text-sm text-gray-400 mt-2">
                Reported at: <Text className="font-medium text-gray-700">{formatDate(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </DefaultLayout>
  );
};

export default History;
