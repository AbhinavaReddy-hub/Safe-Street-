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
import Button from "../components/Shared/Button";
import * as SplashScreen from 'expo-splash-screen';

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

  return (
    <View style={{
      flex: 1,
      backgroundColor:Colors.WHITE,
    }}>
      <Image source={require('../assets/images/road_damage.png')}
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
        marginTop:80,
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
        onPress={()=>router.push('./auth/SignUp')}
        >
          <Text style={[styles.buttonText,{color:Colors.PRIMARY}]}>Get Started</Text>
        </TouchableOpacity>

        <Button text={'Already have an Account'} onPress={()=>router.push('./auth/SignIn')}/>
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
