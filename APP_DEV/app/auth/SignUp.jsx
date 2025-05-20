import { View, KeyboardAvoidingView, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Text, Image, TextInput, Pressable, ActivityIndicator, ScrollView, ToastAndroid, Platform } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../config/fireBaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import { UserDetailContext } from '../../context/UserDetailContext';
import signup from '../../assets/images/signup.jpg';

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const CreateNewAccount = () => {
    setLoading(true);
    setError("");
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (res) => {
        const user = res.user;
        console.log("user Created successfully!!");
        await sendEmailVerification(user);
        setEmailSent(true);
        console.log("Verification email sent");
        await SaveUser(user);
        setLoading(false);
      })
      .catch(e => {
        console.log(e.message);
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (emailSent && !emailVerified) {
      const interval = setInterval(async () => {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            setEmailVerified(true);
            clearInterval(interval);
            ToastAndroid.show('Email verified! Redirecting...', ToastAndroid.SHORT);
            setLoading(false);
            router.replace('../(tabs)/Home'); 
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [emailSent, emailVerified]);

  const SaveUser = async (user) => {
    const data = {
      name: fullName,
      email: email,
      member: false,
      emailVerified: emailVerified,
      uid: user?.uid
    };
    await setDoc(doc(db, 'users', email), data);
    setUserDetail(data);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: 50,
            flexGrow: 1,
            padding: 20,
            backgroundColor: Colors.WHITE,
          }}>
            {!emailSent ?
              <>
                <Image source={signup}
                  style={{
                    borderRadius:10,
                    width: 250,
                    height:200,
                  }}
                />

                <Text style={{
                  fontSize: 30,
                  fontFamily: 'outfit-bold',
                }}
                >Create New Account</Text>

                {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}

                <TextInput
                  placeholder='Full Name'
                  style={styles.textInput}
                  onChangeText={(value) => setFullName(value)}
                  value={fullName}
                />
                <TextInput
                  placeholder='Email'
                  style={styles.textInput}
                  onChangeText={(value) => setEmail(value)}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Password"
                    style={[styles.textInput, { flex: 1 }]}
                    onChangeText={setPassword}
                    value={password}
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
                  onPress={CreateNewAccount}
                  disabled={loading}
                  style={{
                    padding: 15,
                    backgroundColor: Colors.PRIMARY,
                    width: '100%',
                    marginTop: 25,
                    borderRadius: 10,
                  }}>
                  {!loading ? <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 20,
                    color: Colors.WHITE,
                    textAlign: 'center',
                  }}>Create Account</Text>
                    :
                    <ActivityIndicator size={'large'} color={Colors.WHITE} />
                  }
                </TouchableOpacity>
                <View style={{
                  display: 'flex',
                  flexDirection: 'row', gap: 5,
                  marginTop: 20,
                }}>

                  <Text style={{
                    fontFamily: 'outfit',
                  }}>
                    Already have Account?
                  </Text>
                  <Pressable onPress={() => router.push('/auth/SignIn')}>
                    <Text style={{
                      color: Colors.PRIMARY,
                      fontFamily: 'outfit-bold'
                    }}>SignIn Here</Text>
                  </Pressable>
                </View>
              </> :
              <Text style={{ fontSize: 18, color: emailVerified ? 'green' : 'red', textAlign: 'center' }}>
                {emailVerified ? 'Email Verified! Redirecting...' : 'Email verification sent. Please verify your email.'}
              </Text>
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );

  
}

const styles = StyleSheet.create({
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
      marginTop: 5,
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
});