import '../global.css';
import { Text,View,TouchableOpacity,Image,StyleSheet } from "react-native";
import {StatusBar} from 'expo-status-bar';
import {Link,useRouter} from 'expo-router';
import { useEffect } from "react";
import Colors from '../constants/Colors';
import { onAuthStateChanged } from "firebase/auth";
import { auth,db } from "../config/fireBaseConfig";
import { getDoc,doc } from "firebase/firestore";
import { useContext } from "react";
import { UserDetailContext } from "../context/UserDetailContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from "../components/Shared/Button";
import * as SplashScreen from 'expo-splash-screen';
import rdamage from '../assets/images/road_damage.png';



 export default function App(){
  const router = useRouter();
  const {userDetail,setUserDetail} = useContext(UserDetailContext);

 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try{
        if (user && user.emailVerified) {
          
          console.log("user already exists");
          const result = await getDoc(doc(db, "users", user?.email));
          console.log("user found redirecting to home ....");
          setUserDetail(result.data());
          router.replace("../(tabs)/Home"); 
        }
    }catch(e){
      console.log("error: ",e);
    }finally{
      await SplashScreen.hideAsync(); 
    }
    });
    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
   const checkLoginStatus = async () => {
    try{
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        console.log(storedUser);
        console.log("user exist.");
        console.log("redirecting to home...");
         setUserDetail(JSON.parse(storedUser));
        //  router.replace('../(tabs)/Home');
      }
    }catch(e){
      console.log(e);
      }
      finally{
          await SplashScreen.hideAsync(); 
      }
   };

   checkLoginStatus();
}, []);
  return (
    <View style={{
      flex: 1,
      backgroundColor:Colors.WHITE,
    }}>
      <Image source={rdamage}
       style={{
        borderRadius: 10,
        width:'80%',
        height :'30%',
        maxHeight: 300,
        marginTop: 40,
        alignSelf:'center'
       }}
      />
      <View style={{
        marginTop:50,
        padding:25,
        backgroundColor:Colors.PRIMARY,
        height:'100%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
      }}>
        <Text 
        style={{
          fontSize: 30,
          textAlign:'center',
          color: Colors.WHITE,
          fontFamily: 'outfit-bold'
        }}
        >Welcome to Street Lens</Text>
        <Text
        style={{
          fontSize:20,
          color: Colors.WHITE,
          marginTop: 20,
          textAlign:'center',
          fontFamily:'outfit'
        }}>
         Bridging Smart Tech and Public Service for the Roads of Tomorrow.
        </Text>
        <TouchableOpacity style={styles.button}
        onPress={()=>router.push("./auth/SignUp")}
        >
          <Text style={[styles.buttonText,{color:Colors.PRIMARY}]}>Get Started</Text>
        </TouchableOpacity>

        <Button text={'Already have an Account'} onPress={()=>router.push('./auth/SignIn')}/>
        <Text style={{alignSelf:'center',color:'white',fontSize:20}}>Or</Text>
        <Button text={'Team Login'} onPress={()=>router.push('./auth/TeamLogin')}/>
      </View>
    </View>
  );
 }

 const styles = StyleSheet.create({
  button:{
    padding: 15,
    backgroundColor: Colors.WHITE,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText :{
    textAlign:'center',
    fontSize: 18,
    fontFamily:'outfit'
  }
 })
