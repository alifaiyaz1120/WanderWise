import React from 'react';
import {View, Text, Button, StyleSheet, Image, TouchableOpacity} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import MyMap from './MapScreen';
import { Animated } from "react-native";

const av = new Animated.Value(0);
av.addListener(() => {return});

const FlightDetails = ({route}) => {
    const flightDataIN = route.params.selectedFlightObj;
    console.log(flightDataIN);
    const navigation = useNavigation();

    function convertMinutesToHoursAndMinutes(minutes) {
      if (isNaN(minutes) || minutes < 0) {
        return "Invalid input";
      }
    
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
    
      const hoursText = hours > 0 ? `${hours}H` : "";
      const minutesText = remainingMinutes > 0 ? `${remainingMinutes}M` : "";
    
      if (hours > 0 && remainingMinutes > 0) {
        return `${hoursText} ${minutesText}`;
      } else {
        return hoursText || minutesText;
      }
    }

    function formatDateTime(inputDateTime) {
      const dateTimeParts = inputDateTime.split(' ');
      if (dateTimeParts.length === 2) {
        const [datePart, timePart] = dateTimeParts;
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
    
        const formattedDateTime = `${month}/${day}/${year} - ${hours}:${minutes}`;
        return formattedDateTime;
      } else {
        return "NA";
      }
    }

    function headingDateFormatter(dateTimeString) {
      const dateParts = dateTimeString.split(' ')[0].split('-');
      const year = dateParts[0];
      const month = getMonthName(parseInt(dateParts[1]));
      const day = dateParts[2];
    
      return `${month} ${day}, ${year}`;
    }
    
    function getMonthName(monthNumber) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return monthNames[monthNumber - 1];
    }

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.date}>{headingDateFormatter(flightDataIN.dep_time)}</Text>
          <View style={styles.headerContainer}>
            <Text style={styles.flightNameNumber}>{flightDataIN.airline_name}</Text>
            <Text style={styles.flightNameNumber}>{flightDataIN.flight_iata}</Text>
          </View>
  
          <View style={styles.airportNamesContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.airportNamesContainerItems}>
                <Text style={styles.airportNames}>{flightDataIN.dep_iata}</Text>
                <Text style={styles.cityText}>{flightDataIN.dep_city}</Text>
              </View>
  
              <View style={styles.airportNamesContainerItems}>
                <Image source={require('wanderwise-frontend/icons/black-plane.png')} resizeMode='contain' style={styles.planeImage} />
                <Text style={styles.durationText}>{convertMinutesToHoursAndMinutes(flightDataIN.duration)}</Text>
              </View>
  
              <View style={styles.airportNamesContainerItems}>
                <Text style={styles.airportNames}>{flightDataIN.arr_iata}</Text>
                <Text style={styles.cityText}>{flightDataIN.arr_city}</Text>
              </View>
            </View>
          </View>
  
          <View style={styles.deptArrContainer}>
          <View style={styles.departureContainer}>
            <Text style={styles.deptArrContainerTitles}>DEPARTURE</Text>
            <Text style={styles.deptArrContainerContent}>{formatDateTime(flightDataIN.dep_time)}</Text>

            <View style={styles.gateTerContainersRow}>
              <View style={styles.gateTerContainers}>
                <Text style={styles.deptArrContainerTitles}>GATE</Text>
                <Text style={styles.deptArrContainerContent}>{flightDataIN.dep_gate == null ? "N/A" : flightDataIN.dep_gate}</Text>
              </View>

              <View style={styles.gateTerContainers}>
                <Text style={styles.deptArrContainerTitles}>TERMINAL</Text>
                <Text style={styles.deptArrContainerContent}>{flightDataIN.dep_terminal == null ? "N/A" : flightDataIN.dep_terminal}</Text>
              </View>
            </View>
          </View>

          <View style={styles.arrivalContainer}>
            <Text style={styles.deptArrContainerTitles}>ARRIVAL</Text>
            <Text style={styles.deptArrContainerContent}>{formatDateTime(flightDataIN.arr_time)}</Text>

            <View style={styles.gateTerContainersRow}>
              <View style={styles.gateTerContainers}>
                <Text style={styles.deptArrContainerTitles}>GATE</Text>
                <Text style={styles.deptArrContainerContent}>{flightDataIN.arr_gate == null ? "N/A" : flightDataIN.arr_gate}</Text>
              </View>

              <View style={styles.gateTerContainers}>
                <Text style={styles.deptArrContainerTitles}>TERMINAL</Text>
                <Text style={styles.deptArrContainerContent}>{flightDataIN.arr_terminal == null ? "N/A" : flightDataIN.arr_terminal}</Text>
              </View>
            </View>
          </View>
        </View>
  
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={{
                backgroundColor: flightDataIN.status === 'landed' ? '#33673B' : flightDataIN.status === 'en-route' ? '#FFBA08' : '#43BCCD',
                borderRadius: 40,
                marginTop: 5,
                marginBottom: 5
              }} activeOpacity={1}>
              <Text style={{ padding: 8, borderRadius: 50, color: 'white' }}>{flightDataIN.status.toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={styles.etaContainer}>
              {flightDataIN.eta && (
                <Text>Arriving in {convertMinutesToHoursAndMinutes(flightDataIN.eta)}</Text>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("MapScreen", { flightData: flightDataIN.dep_name })}>
          <Text style={styles.exploreButtonText}>Explore Departure Airport</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("MapScreen", { flightData: flightDataIN.arr_name })}>
          <Text style={styles.exploreButtonText}>Explore Arrival Airport</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('wanderwise-frontend/icons/back.png')} resizeMode='contain' style={styles.backButtonIcon} />
        </TouchableOpacity>
      </View>
    );
  
    
}

export default FlightDetails;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2', 
    // backgroundColor: '#011936'

  },
  innerContainer: {
    backgroundColor: '#F9F9F9', 
    borderRadius: 20,
    width: '90%',
    paddingVertical: 20,
    paddingHorizontal: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
    elevation: 8,
    marginBottom: 20,
  },
  
date: {
  textAlign: 'center',
  fontSize: 20,
  fontWeight: 'bold',
  color: '#011936',
  paddingBottom: 30,
},


  flightNameNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#011936',
    marginLeft: 10, 
    marginRight: 30, 
  },

  planeImage: {
    width: 25,
    height: 25,
    tintColor: '#011936',
  },

  headerContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', 
    marginBottom: 20,
    paddingLeft: 10, 
  },
  airportNamesContainer: {
    paddingBottom: 20,
    justifyContent: "space-around",
  },

  airportNamesContainerItems: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, 
  },
  airportNames: {
    fontWeight: "bold",
    fontSize: 25,
    color: '#011936'
  },

  cityText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#011936',
  },

  durationText: {
    textAlign: 'center',
    fontSize: 11,
  },

  deptArrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginBottom: 20,
  },
  departureContainer: {
    marginLeft: 0, 
  },
  arrivalContainer: {
    marginLeft: 30, 
  },

  deptArrContainerTitles: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 5,
  },

  deptArrContainerContent: {
    textAlign: 'center',
    fontWeight: "bold",
    fontSize: 15,
    paddingBottom: 5,
  },

  gateTerContainers: {
    marginHorizontal: 5,
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  statusButton: {
    borderRadius: 40,
    marginTop: 5,
    marginBottom: 5,
    padding: 8,
  },

  statusButtonText: {
    color: 'white',
  },

  etaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  etaText: {
    color: '#011936',
  },
  exploreButton: {
    marginTop: 20, 
    backgroundColor: '#011936',
    borderRadius: 30,
    alignSelf: 'center',
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    elevation: 8,
  },

  
exploreButtonText: {
  color: 'white',
  fontSize: 14, 
  fontWeight: 'bold',
},

backButton: {
  marginTop: 20, 
  backgroundColor: '#D6D6D6',
  borderRadius: 30,
  alignSelf: 'center',
  elevation: 8,
},

  backButtonIcon: {
    width: 25,
    height: 25,
    paddingHorizontal: 20,
  },
});