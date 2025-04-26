import { View, Text, ScrollView,StyleSheet, TouchableOpacity,Image, ToastAndroid, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useState,useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import ImageViewing from 'react-native-image-viewing';
import DefaultLayout from "../../components/Shared/DefaultLayout";
import { Camera, MapPin, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react'


const Upload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const[message,setMessage] = useState("");
  const[reportLoading,setReportLoading]=useState(false);
  const[isSent,setIsSent] = useState(false);
  const[isMessage,setIsMessage] = useState(false);
  
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
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'This app needs camera roll permission to work properly');
      }
    })();
  }, []);



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

//choosing from gallery

const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
    base64:true,
    exif:true,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
    // console.log(result.assets[0].exif);
    setPrediction(null);
  }
};

//taking photo
const takePhoto = async () => {
  let result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
    setPrediction(null);
  }
};


// getting prediction

const uploadImage = async () => {
  if (!selectedImage) {
    ToastAndroid.show('No image selected Please select an image first',ToastAndroid.SHORT);
    return;
  }
  
  setLoading(true);
  
  // Create form data for image upload
  const formData = new FormData();
  formData.append('image', {
    uri: selectedImage,
    type: 'image/jpeg',
    name: 'road-damage.jpg',
  });
  
  try {
    // Send image to backend for analysis
    // NOTE: In a real app, replace with your actual API endpoint
    // const response = await axios.post(`${API_URL}/analyze-damage`, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    
    // For demo purposes, simulate API response with mock data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    const mockResponse = {
      data: {
        damageType: 'Pothole',
        severity: 'High',
        confidence: 90,
        location: 'Madhapur',
        date:'12-03-2025',
        summary: 'Severe pothole detected. Immediate repair action is required to prevent accidents and further road degradation.'

      }
    };
    
    setPrediction(mockResponse.data);
    setLoading(false);
    
  } catch (error) {
    console.error('Error uploading image:', error);
    Alert.alert(
      'Upload failed', 
      'There was an error uploading your image. Please try again later.'
    );
    setLoading(false);
  }
};

const sendReport = async()=>{
  setReportLoading(true);
  setIsMessage(false);
  setMessage("");
  const formdata = new FormData();
  formdata.append('report',{
    prediction: prediction,
    usermessage : message,
  })
  await (new Promise((resolve)=>setTimeout(resolve,3000)));

  setReportLoading(false);
  console.log("report sent succussfully!!....");
  setIsSent(true);
}


  return (
    <DefaultLayout>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="mx-2 mt-6 p-4 items-center rounded-xl bg-gray-50 gap-3" style={styles.shadow}>
          <View className="items-center"> 
            <TouchableOpacity
              className="px-3 py-2 bg-amber-800 rounded-2xl items-center"
              onPress={pickImage}
            >
              <Text className="text-white text-xl">Select from Gallery</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-center text-xl">Or</Text>
          <View className="items-center">
            <TouchableOpacity
              className="px-3 py-2 bg-amber-800 rounded-2xl items-center"
              onPress={takePhoto}
            >
              <Text className="text-white text-xl"><Camera size={20} color="#ffffff"/>    Take Photo</Text>
            </TouchableOpacity>
          </View>
          
          <View>
            {selectedImage ? (
              <TouchableOpacity onPress={()=>openImage(selectedImage)}>

                <Image 
                  source={{ uri: selectedImage }} 
                  className="rounded-xl w-[250px] h-[200px]"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <View className="border-[1px] border-black p-4 rounded-xl" >
                <Image 
                  source={require('../../assets/images/upload.png')} 
                  className="w-[150px] h-[150px] rounded-xl"
                />
              </View>
            )}
          </View>

          <View className="items-center">
            <TouchableOpacity
              disabled={!selectedImage || loading}
              style={{
                opacity: !selectedImage || loading ? 0.7 : 1,
              }}
              className="px-5 py-3 bg-amber-800 rounded-2xl items-center"
              onPress={uploadImage}
            >{loading? <ActivityIndicator size={20} color={'white'}/>:
              <Text className="text-white text-xl">Upload</Text>
            }
            </TouchableOpacity>
          </View>
          </View>
              <ImageViewing
                images={currentImage || []}
                imageIndex={0}
                visible={isImageViewVisible}
                onRequestClose={closeImage}
              />
            {prediction &&
                <View className="mb-14 mx-2 mt-6 p-4 rounded-xl bg-gray-50 gap-3" style={styles.shadow}>
                  <View> 
                    <Text className="text-2xl font-bold self-center">Analysis Result</Text>
                  </View>
                  <View className="gap-3">
                    <View className="flex-row justify-around">
                      <Text className="text-xl font-semibold">{prediction.damageType}</Text>
                      <Text className={`px-2 py-1 rounded-full text-white ${getSeverityColor(prediction.severity)}`}>{prediction.severity}</Text>
                    </View>
                    <View className="self-center flex-row gap-4">
                      <MapPin size={18} color="#6b7280"/>
                      <Text className="text-xl">{prediction.location}</Text>
                    </View>
                    <View className="self-center flex-row gap-4">
                      <Calendar size={18} color="#6b7280"/>
                      <Text className="text-xl">{prediction.date}</Text>
                    </View>
                    <View className="w-[200px] mx-6 bg-red-400 rounded-xl overflow-hidden self-center">
                      <View
                      style={{
                        width: `${3 * prediction.confidence}px`,
                        backgroundColor:
                          prediction.confidence >= 80
                            ? 'green'
                            : prediction.confidence >= 70
                            ? 'yellow'
                            : 'red',
                      }}
                      >
                      <Text className="text-white text-center text-[14px] z-10 font-semibold">Confidence: {prediction.confidence}%</Text>
                      </View>
                    </View>
                    <View>
                      <Text className="text-xl font-semibold">Summary</Text>
                      <Text className="text-[16px]">{prediction.summary}</Text>
                    </View>
                    <View>
                      <Pressable onPress={()=>{setIsMessage((cur)=>!cur);
                        setIsSent(false);
                      }}>
                        <Text className="text-[15px] text-amber-800/[90%] ">Want to Convey some thing to Authorities ?</Text>
                      </Pressable>
                      {isMessage&&
                        <View className="my-1 self-center relative p-4">
                          <TextInput
                          className='w-[250px] h-auto border-[1px] border-black rounded-xl'
                          multiline
                          placeholder='enter your message'
                          maxLength={200}
                          value={message}
                          onChangeText={(value)=>setMessage(value)}
                          />
                          <Text className="absolute text-gray-500 text-[13px] bottom-0 right-4 ">{200-message.length} characters left</Text>
                        </View>
                      }
                    </View>
                    <View className="items-center">
                      <TouchableOpacity
                       style={{
                        opacity: reportLoading? 0.7 : 1,
                      }}
                        className="px-5 py-3 bg-amber-800 rounded-2xl items-center"
                        onPress={sendReport}
                        disabled={reportLoading}
                      >{reportLoading? <ActivityIndicator size={24} color={'white'}/>:
                        <Text className="text-white text-xl">Send This Report</Text>
                        }
                      </TouchableOpacity>
                    </View>
                    {isSent&&
                      <Text className="italic text-lg text-green-600 "><Ionicons name="checkmark-circle-sharp" size={18} color="green" /> Report Sent You will be updated soon!</Text>
                    }
                  </View>
                </View>
          }       
      </ScrollView>
    </DefaultLayout>
  );
}

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

export default Upload;