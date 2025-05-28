import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  ToastAndroid,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useContext, useState } from 'react';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { UserDetailContext } from '../../context/UserDetailContext';
import signin from '../../assets/images/login.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function TeamLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {userDetail, setUserDetail } = useContext(UserDetailContext);

 class TeamNotFoundError extends Error {
  constructor(message = "Team does not exist. Please get the credentials from the authority.") {
    super(message);
    this.name = "TeamNotFoundError";
  }
}
 
  const onSignin = async () => {
    if (!email || !pass) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

   console.log("hello");

    setLoading(true);
    try {
      const mongores = await fetch("http://192.168.207.157:3000/api/auth/login",{
         method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
         
            email: email,
            password: pass,
          
          }),
      });
      const mongojson = await mongores.json()
      console.log(mongojson);
     
      if (mongojson.status === "success" && mongojson.data?.user?.role === "worker") {
        const user = mongojson.data.user;
        console.log(user);
        await AsyncStorage.setItem('userToken', mongojson.token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        setUserDetail(user);
        console.log(userDetail);
        router.replace('../(tabs)/Home');
      }else{
        throw new TeamNotFoundError();
      }

    
      
    } catch (e) {
      console.error(e);
      ToastAndroid.show({e}, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

 

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={signin}
            style={styles.logo}
          />

          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            placeholder="Email"
            style={styles.textInput}
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={[styles.textInput, { flex: 1 }]}
              onChangeText={setPass}
              value={pass}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity
            onPress={onSignin}
            disabled={loading}
            style={styles.signInButton}
          >
            {loading ? (
              <ActivityIndicator size="large" color={Colors.WHITE} />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: Colors.WHITE,
  },
  logo: {
    width: 350,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'outfit-bold',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    width: '100%',
    padding: 15,
    fontSize: 18,
    borderRadius: 8,
    marginTop: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  showPasswordButton: {
    position: 'absolute',
    top:'35%',
    right: 15,
    padding: 10,
  },
  showPasswordText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit-bold',
  },
  signInButton: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    width: '100%',
    marginTop: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  signInButtonText: {
    fontFamily: 'outfit',
    fontSize: 20,
    color: Colors.WHITE,
  },
  signUpContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 20,
  },
  signUpText: {
    fontFamily: 'outfit',
  },
  signUpLink: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit-bold',
  },
});