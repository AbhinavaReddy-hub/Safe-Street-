import { StyleSheet, Platform, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Home/Header';
import Colors from '../../constants/Colors';
import { CircularProgress } from 'react-native-circular-progress';

const Home = () => {
  const [completed, setCompleted] = useState(1);
  const [inComplete, setInComplete] = useState(0.3);
  const [progress, setProgress] = useState(0.7);



  return (
    <View
      style={{
        padding: 25,
        paddingTop: Platform.OS == 'ios' ? 45 : 25,
        flex: 1,
        backgroundColor: Colors.WHITE,
      }}
    >
      <Header />
      <View style={{
        marginTop:20,

      }}>
        <Text style={{textAlign:'center',fontSize:24,fontFamily:'outfit'}}>My Work Analytics 😊</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          marginTop: 20,
        }}
      >
        {/* Progress Circle */}
        <View >
          <CircularProgress
            size={130}
            width={10}
            fill={progress * 100} 
            tintColor={progress < 0.5 ? 'red' : progress < 0.75 ? '#F3C13A' : 'green'} 
            backgroundColor={'lightgrey'}
            lineCap="round" 
          rotation={270} 
          padding={10}
           
          >
            {() => (
              <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {`${Math.round(progress * 100)}%\nProgress`}
              </Text>
            )}
          </CircularProgress>
        </View>

        {/* Completed Circle */}
        <View >
          <CircularProgress
            size={130}
            width={10}
            fill={completed * 100}
            tintColor={completed < 0.5 ? 'red' : completed < 0.75 ? '#F3C13A' : 'green'}
            backgroundColor={'lightgrey'}
            lineCap="round" // Rounded edges for the progress bar
            rotation={270} 
            padding={10}
           
          >
            {() => (
              <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {`${Math.round(completed * 100)}%\nDone`}
              </Text>
            )}
          </CircularProgress>
        </View>

        {/* Incomplete Circle */}
        <View >
          <CircularProgress
            size={130}
            width={10}
            fill={inComplete * 100}
            tintColor={inComplete < 0.5 ? 'red' : inComplete < 0.75 ? '#F3C13A' : 'green'}
            backgroundColor={'lightgrey'}
            lineCap="round" // Rounded edges for the progress bar
            rotation={270} 
            padding={10}
          >
            {() => (
              <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {`${Math.round(inComplete * 100)}%\nIncomplete`}
              </Text>
            )}
          </CircularProgress>
        </View>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});