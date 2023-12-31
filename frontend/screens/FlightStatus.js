import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Image, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Animated } from "react-native";

const av = new Animated.Value(0);
av.addListener(() => { return; });
const FlightStatus = () => {
  const [airline_Name, onChangeAirlineName] = useState('');
  const [flight_Num, onChangeFlightNum] = useState('');
  const [flight_obj, onChangeFlightObj] = useState();
  const [flight_iata, onChangeFlightIata] = useState('');
  const [isVisible, setVisibility] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    console.log(flight_obj);
    if (flight_obj) {
      setVisibility(false);
      navigation.navigate("FlightDetails", { selectedFlightObj: flight_obj });
    }
  }, [flight_obj]);

  const getFlightData = async (flightIataIn) => {
    const api_key = '...'
    try {
      // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/api/flight-status/${flightIataIn}/`;
      const url = `https://airlabs.co/api/v9/flight?flight_iata=${flightIataIn}&api_key=${api_key}`
      const res = await fetch(url);
      const json = await res.json();
      console.log(json)
      onChangeFlightObj(json.response);
      if(flight_obj==undefined){
          setVisibility(true)
      }
    } catch (error) {
      console.log(error);
      setVisibility(true)
    }
  };

  const flightDataCaller = () => {
    getFlightData(flight_iata);
  };

  return (
    <View style={styles.container}>
      <View style={styles.flightTitleContainer}>
        <Text style={styles.flightTrackerTitle}>Flight Status</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '95%' }}>
        <TextInput placeholder='Flight Iata' style={styles.input} onChangeText={onChangeFlightIata} value={flight_iata}></TextInput>
        <TouchableOpacity style={styles.submitButton} onPress={flightDataCaller}>
          <Image source={require('wanderwise-frontend/icons/black-plane.png')} style={{ height: 30, width: 30, tintColor:'black' }}></Image>
        </TouchableOpacity>
      </View>
      <Text style={{ paddingLeft: 10, paddingTop: 2, color: '#E85D75' }}>
        {
          isVisible ? (
            <Text>Flight not found.</Text>
          ) : (
            <Text></Text>
          )
        }
      </Text>
    </View>
  )
}

export default FlightStatus;

const styles = StyleSheet.create({
    container: {
        borderRadius: 15,
        padding: 15,
        width: '90%', 
        alignSelf: 'center',
        marginTop: 30,
        backgroundColor: '#ffffff',
        elevation: 5,
        marginBottom: 20,
        ...Platform.select({
          android: {
            elevation: 8,
          },
          ios: {
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.5,
            shadowRadius: 3,
          },
        }),
      },
  flightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, 
  },
  input: {
    flex: 1,
    height: 55,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flightTrackerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    width: 42,
    height: 42,
    marginLeft: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 50,
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
    }),
  }
});
