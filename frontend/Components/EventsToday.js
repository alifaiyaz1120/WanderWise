import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {storage, db, auth} from '../firebase_config';
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc} from 'firebase/firestore';

function EventsToday() {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventLocation, setLocationName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isSelected, setSelected] = useState(0);
  const [eventDescription, setEventDescription] = useState('');
  const [userMarkedDates, setUserMarkedDates] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [endTime, setEndTime] = useState(''); // Add this line
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [allUserEvents, setAllUserEvents] = useState([])
  const [groupedUserEvents, setGroupedUserEvents] = useState()
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [setting, setSetting] = useState(false);
  const navigation = useNavigation();

  const fetchEventData = async () => {
    setIsLoading(true)
    setAllUserEvents([]) 
    await fetchAllEvents();
    await groupAndSortEvents()
    await sortEvents()
    setIsLoading(false)
  };
  useEffect(() => {
    fetchEventData();
  }, []); 

  const fetchAllEvents = async () => {
    const currentUser = auth.currentUser.uid;
    console.log(currentUser)
    if (currentUser){
        try {

            const id = currentUser;
            const userUploadsCollectionRef = collection(db, "User Calendars");
            const userDocumentRef = doc(userUploadsCollectionRef, `${id}`);
            const uploadsSubcollectionRef = collection(userDocumentRef, "Events");
    
            const querySnapshot = await getDocs(uploadsSubcollectionRef);
            const postsData = [];
    
            querySnapshot.forEach((doc) => {
                if (doc.exists()) {
                    eventData = doc.data();
                    eventID = doc.id
                    // console.log(eventData, eventID)
                    postsData.push({
                        id: eventID,
                        ...eventData,
                    });
                } else {
                    console.log("No such document!");
                }
            });

            setAllUserEvents((prevAllUserEvents) => [...prevAllUserEvents, ...postsData]);
        }
        catch(error){
            console.log(error)
        }
      }else{
          console.log("NO USER LOGGED IN");
          return [];
      }
  }

  const sortEvents = async () => {
    setAllUserEvents(prevPosts => [...prevPosts].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2));
  }
 
  const groupAndSortEvents = async () => {
    await sortEvents();

    const groupedEvents = new Object();
    
    allUserEvents.forEach((event) => {
      if(groupedEvents[event.date]){
        groupedEvents[event.date].push(event)
      } 
      else{
        groupedEvents[event.date] = [event]
      }
    });
    setGroupedUserEvents(groupedEvents)
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'numeric', day: 'numeric', timeZone: 'UTC'};
    const formattedDate = new Date(dateString).toLocaleDateString(undefined, options)
      .replace(',', ''); 
    return formattedDate;
  };


  const handleViewCalendar = () => {
    navigation.navigate('MyCalendar');
  };

  // Get today's date
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const currentDate = new Date();
  const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = currentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

  const formattedDate = `${dayOfWeek.split(',')[0]} ${monthDay}`;
  console.log(formattedDate);

  // Sample events data
  const events = [
    { id: 1, date: '2023-11-15', name: 'Wake Up', startTime: '8:00 AM', endTime: '9:30 AM', description: 'Drink coffee and have breakfast' },
    { id: 2, date: '2023-11-15', name: 'Capstone Presentation', startTime: '10:00 AM', description: 'Present this week\'s progress' },
  ];

  return (
    <TouchableOpacity onPress={handleViewCalendar}>
      <View style={styles.container}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Upcoming Events</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : allUserEvents.length > 0 ? (
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {allUserEvents.map((item, index) => (
              <View key={index} style={styles.eventContainer}>
                <Text style={styles.eventDay}>{formatDate(item.date)}</Text>
                <Text style={styles.eventName}>{item.eventName}</Text>
                {item.startTime && item.endTime ? (
                  <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
                ) : (
                  <Text style={styles.eventTime}>{item.startTime}</Text>
                )}
                <Text style={styles.eventDescription}>{item.eventLocation}</Text>
                <Text style={styles.eventDescription}>{item.eventDescription}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No upcoming events</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default EventsToday;

const styles = StyleSheet.create({
  noEventsContainer: {
    alignItems: 'center',
    marginTop: -10,
    paddingVertical: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
  },
  container: {
    borderRadius: 15,
    marginTop: 25,
    marginBottom: 25,
    width: '90%',
    alignSelf: 'center', 
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    elevation: 5,
    padding: 15,
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
  
  dateContainer: {
    marginBottom: 10,
  },
  eventContainer: {
    width: '95%',
    marginBottom: 20,
    backgroundColor: '#FFFFFF', 
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventName: {
    fontSize: 18,
    color: '#3498db',
    marginBottom: 4
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4
  },
  viewCalendarButton: {
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#97D8C4',
    height: 50,
    width: 50,
    borderRadius: 25,
    marginTop: 5, 
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
  buttonText: {
    textAlign: 'center',
    color: 'white',
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4
  },
  eventDay: {
    fontSize: 14,
    color: 'black',
    marginBottom: 4
  },
  dateText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
});
