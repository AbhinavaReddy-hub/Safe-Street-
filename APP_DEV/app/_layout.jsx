import { StyleSheet, Text, View } from 'react-native'
import {Slot,Stack} from 'expo-router';
import {useFonts} from 'expo-font';
import {UserDetailContext} from '../context/UserDetailContext';
import { IpProvider } from '../context/IpContext';
import { useState } from 'react';
import "../global.css";
import 'expo-router/entry';
import { preventAutoHideAsync } from 'expo-splash-screen';
import { useIp } from '../context/IpContext';

  preventAutoHideAsync();

const RootLayout = () => {
  useFonts({
    'outfit': require('../assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold': require('../assets/fonts/Outfit-Bold.ttf'),
  });
  const [userDetail,setUserDetail] = useState();
  return (
    // <View style={styles.container}>
    //   <Text> RootLayout</Text>
    // </View>
    // <>
    //   <Text>Header</Text>
    //   <Slot/>
    //   <Text>Footer</Text>
    // </>
    <IpProvider>
    <UserDetailContext.Provider value={{userDetail,setUserDetail}}>

    {/* <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name ="index" options={{headerShown:false}}/>
    </Stack> */}
    <Slot/>
    </UserDetailContext.Provider>
    </IpProvider>
  )
}

export default RootLayout

// const styles = StyleSheet.create({
//   container:{
//     display: 'flex',
//     flex: 1,
//     alignItems: "center",
//     justifyContent:"center",
//   },
// })