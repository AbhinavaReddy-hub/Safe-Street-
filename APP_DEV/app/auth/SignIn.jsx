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
import { auth, db } from '../../config/fireBaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { UserDetailContext } from '../../context/UserDetailContext';
import signin from '../../assets/images/login.jpg';


export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUserDetail } = useContext(UserDetailContext);

  const onSignin = async () => {
    if (!email || !pass) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

    if (!validateEmail(email)) {
      ToastAndroid.show('Please enter a valid email address.', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const resp = await signInWithEmailAndPassword(auth, email, pass);
      const user = resp.user;

      // Reload user to get the latest email verification status
      await user.reload();

      if (!user.emailVerified) {
        ToastAndroid.show('Please verify your email before logging in.', ToastAndroid.LONG);
        setLoading(false);
        return;
      }

      await getUserDetails();
      router.replace('../(tabs)/Home');
    } catch (e) {
      console.error(e);
      ToastAndroid.show('Incorrect Email or Password', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async () => {
    try {
      const result = await getDoc(doc(db, 'users', email));
      if (result.exists()) {
        setUserDetail(result.data());
      } else {
        console.warn('User details not found');
        ToastAndroid.show('User details not found. Please contact support.', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      ToastAndroid.show('Failed to fetch user details. Please try again.', ToastAndroid.SHORT);
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

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/auth/SignUp')}>
              <Text style={styles.signUpLink}>Sign Up Here</Text>
            </Pressable>
          </View>
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