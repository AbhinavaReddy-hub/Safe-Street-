import { View, Text, ScrollView,StyleSheet, TouchableOpacity,Image, ToastAndroid, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useState,useEffect, useContext } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageViewing from 'react-native-image-viewing';
import DefaultLayout from "../../components/Shared/DefaultLayout";
import { UserDetailContext } from '../../context/UserDetailContext';
import { useIp } from '../../context/IpContext';
import { Camera, MapPin, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import uploadimg from '../../assets/images/upload.png';
import * as Location from 'expo-location';
import React from 'react'


const Upload = () => {
  const [location, setLocation] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null); 
  const [message, setMessage] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportStatusMessage, setReportStatusMessage] = useState(null);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const {ip,setIp} = useIp();

  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const openImage = (uri) => {
    setCurrentImage([{ uri }]);
    setIsImageViewVisible(true);
  };

  const closeImage = () => {
    setIsImageViewVisible(false);
  };

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to report issues. Please grant permission in settings.'
        );
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);
      } catch (error) {
        console.error('Error fetching location:', error);
        Alert.alert('Location Error', 'Could not get your current location. Please ensure GPS is enabled.');
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const requestMediaPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'This app needs camera roll permission to select images.'
        );
      }
    };
    requestMediaPermission();
  }, []);
  
  useEffect(() => {
    if (reportStatusMessage) {
      const timer = setTimeout(() => {
        setReportStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer); 
    }
  }, [reportStatusMessage]);


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

  // Choosing from gallery
  const pickImage = async () => {
    if (selectedImages.length >= 10) {
      ToastAndroid.show('You can only select up to 10 images.', ToastAndroid.SHORT);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected MediaType
      allowsMultipleSelection: true,
      selectionLimit: 10 - selectedImages.length,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      const totalImages = [...selectedImages, ...newImages];


      if (totalImages.length > 10) {
        ToastAndroid.show(`You can only select up to 10 images. You selected ${totalImages.length - selectedImages.length} more than allowed.`, ToastAndroid.LONG);
        setSelectedImages(totalImages.slice(0, 10)); 
      } else {
        setSelectedImages(totalImages);
      }
      setPrediction(null); 
    }
  };


  const takePhoto = async () => {
    if (selectedImages.length >= 10) {
      ToastAndroid.show('You can only select up to 10 images.', ToastAndroid.SHORT);
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
      setPrediction(null);
    }
  };

  // Uploading images and creating report
  const uploadImage = async () => {
    if (selectedImages.length === 0) {
      ToastAndroid.show('Please select at least one image.', ToastAndroid.SHORT);
      return;
    }
    if (selectedImages.length < 3) {
      ToastAndroid.show('Select at least 3 images for a complete report.', ToastAndroid.SHORT);
      return;
    }

    if (!location) {
      ToastAndroid.show('Acquiring location, please wait...', ToastAndroid.SHORT);
      return;
    }

    setLoading(true); 

    const formData = new FormData();

    selectedImages.forEach((uri, index) => {
      const fileExtension = uri.split('.').pop();
      formData.append('images', {
        uri,
        name: `image${index + 1}.${fileExtension || 'jpg'}`, 
        type: `image/${fileExtension || 'jpeg'}`,
      });
    });

    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    formData.append('usermessage', message);

    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        ToastAndroid.show('Authentication required. Please log in.', ToastAndroid.SHORT);
        return;
      }

      console.log('Attempting to send report with formData:', formData);
      const response = await fetch(`http://${ip}:3000/api/reports`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${storedToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json(); 
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful, backend response:', result);
      setPrediction(result); 
      setReportStatusMessage({ type: result.status, text: 'Thanks for reporting, you will be updated soon!' });
      ToastAndroid.show('Report submitted successfully!', ToastAndroid.SHORT);
      setSelectedImages([]);
      setMessage(''); 
      setLoading(false);

    } catch (error) {
      console.error('Report upload failed:', error.message);
      setReportStatusMessage({ type: 'fail', text: `Report submission failed: ${error.message}` });
      ToastAndroid.show(`Report submission failed: ${error.message}`, ToastAndroid.SHORT);
      setSelectedImages([]);
      setMessage(''); 
      setLoading(false);
    } finally {
      setLoading(false);
      setMessage('');
      setSelectedImages([]);
    }
  };


  // const sendReport = async () => {
  //   setReportLoading(true);
  //   setIsMessage(false);
  //   setMessage('');
  //   const formData = new FormData();
  //   // You need to decide what 'prediction' and 'usermessage' refer to
  //   // and if this is a separate API call.
  //   formData.append('report', JSON.stringify({ // Stringify JSON objects for FormData
  //     prediction: prediction,
  //     usermessage: message,
  //   }));
  //
  //   // Simulate network delay
  //   await new Promise((resolve) => setTimeout(resolve, 3000));
  //
  //   setReportLoading(false);
  //   // setIsSent(true); // This should be based on actual API response
  //   setReportStatusMessage({ type: 'success', text: 'Report details sent!' });
  // };

  return (
    <DefaultLayout>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="mx-2 mt-6 mb-7 p-4 items-center rounded-xl bg-gray-50 gap-3" style={styles.shadow}>
          <View className="items-center">
            <TouchableOpacity
              className="px-3 py-2 bg-amber-800 rounded-2xl items-center"
              onPress={pickImage}>
              <Text className="text-white text-xl">Select from Gallery</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-center text-xl">Or</Text>
          <View className="items-center">
            <TouchableOpacity
              className="px-3 py-2 bg-amber-800 rounded-2xl items-center"
              onPress={takePhoto}>
              <Text className="text-white text-xl">
                <Camera size={20} color="#ffffff" />    Take Photo
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-center gap-2">
            {selectedImages.length > 0 ? (
              selectedImages.map((uri, index) => (
                <TouchableOpacity key={index} onPress={() => openImage(uri)}>
                  <Image
                    source={{ uri }}
                    className="rounded-xl w-[100px] h-[100px]"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View className="border-[1px] border-black p-4 rounded-xl">
                <Image source={uploadimg} className="w-[150px] h-[150px] rounded-xl" />
              </View>
            )}
          </View>

          {selectedImages.length>0 && 
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-md mt-4 text-base"
              placeholder="Add an optional message or details about the issue..."
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />
          }

          <View className="items-center">
            <TouchableOpacity
              disabled={loading || selectedImages.length === 0 || !location}
              style={{
                opacity: loading || selectedImages.length === 0 || !location ? 0.7 : 1,
              }}
              className="px-5 py-3 bg-amber-800 rounded-2xl items-center"
              onPress={uploadImage}>
              {loading ? (
                <ActivityIndicator size={20} color={'white'} />
              ) : (
                <Text className="text-white text-xl">Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ImageViewing
          images={currentImage || []}
          imageIndex={0}
          visible={isImageViewVisible}
          onRequestClose={closeImage}
        />

        {reportStatusMessage && (
          <View className="mx-2 my-2 p-3 items-center rounded-xl"
            style={{ backgroundColor: reportStatusMessage.type === 'success' ? '#d4edda' : '#f8d7da' }}>
            <Text
              className={reportStatusMessage.type === 'success' ? 'text-green-700 font-semibold text-lg' : 'text-red-700 font-semibold text-lg'}>
              {reportStatusMessage.text}
            </Text>
          </View>
        )}
      </ScrollView>
    </DefaultLayout>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 15,
  },
});

export default Upload;