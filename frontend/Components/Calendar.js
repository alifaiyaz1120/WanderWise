import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Button,
  FlatList,
  RefreshControl,
  ActivityIndicator, 
  Alert,
  TouchableWithoutFeedback, 
  Keyboard,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc,deleteDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import Ionicons from '@expo/vector-icons/Ionicons';

function MyCalendar() {
  const [selectedDate, setSelectedDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventLocation, setLocationName] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [isSelected, setSelected] = useState(0);
  const [eventDescription, setEventDescription] = useState("");
  const [userMarkedDates, setUserMarkedDates] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [endTime, setEndTime] = useState(""); // Add this line
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [allUserEvents, setAllUserEvents] = useState([]);
  const [groupedUserEvents, setGroupedUserEvents] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [setting, setSetting] = useState(false);
  const [showDeleteConfirm, setDeleteConfirm] = useState(false);
  const [index, setIndex] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [locationInput, setLocationInput] = useState("");

  const fetchEventData = async () => {
    setIsLoading(true);
    setAllUserEvents([]);
    await fetchAllEvents();
    await groupAndSortEvents();
    await sortEvents();
    setIsLoading(false);
  };
  useEffect(() => {
    fetchEventData();
  }, []);

  const sortEvents = async () => {
    setAllUserEvents((prevPosts) =>
      [...prevPosts].sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  };

  const groupAndSortEvents = async () => {
    await sortEvents();

    const groupedEvents = new Object();

    allUserEvents.forEach((event) => {
      if (groupedEvents[event.date]) {
        groupedEvents[event.date].push(event);
      } else {
        groupedEvents[event.date] = [event];
      }
    });
    setGroupedUserEvents(groupedEvents);
  };

  const navigation = useNavigation();
  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleConfirmTime = (selectedTime) => {
    let timestamp = new Date(selectedTime);

    // Format the time as "6:10 PM"
    let formattedTime = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    setEventTime(formattedTime);
    hideTimePicker();
  };
  const showEndTimePicker = () => {
    setEndTimePickerVisible(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisible(false);
  };

  const handleConfirmEndTime = (selectedTime) => {
    let timestamp = new Date(selectedTime);

    // Format the time as "6:10 PM"
    let formattedTime = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    // Format the selected time if needed
    setEndTime(formattedTime);
    hideEndTimePicker();
  };

  const fetchAllEvents = async () => {
    const currentUser = auth.currentUser.uid;
    console.log(currentUser);
    if (currentUser) {
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
            eventID = doc.id;
            // console.log(eventData, eventID)
            postsData.push({
              id: eventID,
              ...eventData,
            });
          } else {
            console.log("No such document!");
          }
        });

        setAllUserEvents((prevAllUserEvents) => [
          ...prevAllUserEvents,
          ...postsData,
        ]);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("NO USER LOGGED IN");
      return [];
    }
  };

  const allEvents = [
    {
      id: 1,
      date: "2023-11-15",
      name: "Eat Dinner",
      startTime: "7:00 PM",
      endTime: "9:00 PM",
      description: "Enjoy a good meal",
    },
    {
      id: 2,
      date: "2023-11-15",
      name: "Wash Dishes",
      startTime: "8:00 PM",
      endTime: "10:07 PM",
      description: "Clean up after dinner",
    },
    {
      id: 3,
      date: "2023-11-28",
      name: "Workout",
      startTime: "5:00 PM",
      endTime: "5:20 PM",
      description: "Exercise and stay fit",
    },
    {
      id: 4,
      date: "2023-11-28",
      name: "Study",
      startTime: "7:00 PM",
      description: "Prepare for exams",
    },
  ];
  const uniqueDates = [...new Set(allEvents.map((event) => event.date))];

  const updateMarkedDates = () => {
    setUserMarkedDates((prevMarkedDates) => [
      ...prevMarkedDates,
      ...uniqueDates,
    ]);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelected(1);
  };

  const handleAddEvent = () => {
    setEventName("");
    setLocationName("");
    setEventTime("");
    setEventDescription("");
    setEndTime("");

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSubmitEvent = async () => {
    setSelected(1);
    setUserMarkedDates([...userMarkedDates, selectedDate]);
    console.log("Selected Date:", selectedDate);
    console.log("Event Name:", eventName);
    console.log("Event Time:", eventTime);
    console.log("Event Description:", eventDescription);
    console.log(markedDates);

    const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/;
    if (eventName == ''){
      console.log("Event name is empty");
      Alert.alert('Error', 'Please enter a name for the event.');
    }
    else if (timeRegex.test(eventTime) == false || timeRegex.test(endTime) == false) {
      console.log("Time is not valid");
      Alert.alert('Error', 'Time is not valid, please use the format: \'00:00 PM/AM\'');
    } 
    else {
      try {
        const currentUserId = auth.currentUser.uid;
  
        const userUploadsCollectionRef = collection(db, "User Calendars");
        const userDocumentRef = doc(userUploadsCollectionRef, `${currentUserId}`);
        const uploadsSubcollectionRef = collection(userDocumentRef, "Events");
  
        const docRef = await addDoc(uploadsSubcollectionRef, {
          date: selectedDate,
          eventName: eventName,
          eventDescription: eventDescription,
          eventLocation: eventLocation,
          startTime: eventTime,
          endTime: endTime,
        });
        console.log("Doc saved", docRef.id);
      } catch (e) {
        console.log(e);
      }
      onRefresh();
  
      setModalVisible(false);
    }
  };

  const prepareMarkedDates = (userMarkedDates) => {
    const markedDates = {};
    if (userMarkedDates.length !== 0) {
      userMarkedDates.forEach((event) => {
        const date = event;
        markedDates[date] = { marked: true, dotColor: "green" };
      });
    }
    return markedDates;
  };

  const markedDatesWithEvents = prepareMarkedDates(userMarkedDates);
  const markedDates = {
    ...markedDatesWithEvents,
    [selectedDate]: { selected: true, marked: true, dotColor: "transparent" },
  };
  const handleEditEvent = (event) => {
    setLocationInput(event.eventLocation);

    setEditingEvent({ ...event, eventLocation: event.eventLocation });
    setIsEditing(true);
  };

  const handleUpdateEvent = async () => {
    try {
      const updatedEventData = {
        date: editingEvent.date,
        eventName: editingEvent.eventName,
        eventLocation: editingEvent.eventLocation,
        eventDescription: editingEvent.eventDescription,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
  
      };
  
      if (editingEvent.date !== updatedEventData.date) {
        const newDate = new Date(updatedEventData.date);
        const formattedDate = newDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
  
        updatedEventData.date = formattedDate;
  
        const userUploadsCollectionRef = collection(db, "User Calendars");
        const userDocumentRef = doc(userUploadsCollectionRef, `${auth.currentUser.uid}`);
        const uploadsSubcollectionRef = collection(userDocumentRef, "Events");
  
        const newPostDocumentRef = await addDoc(uploadsSubcollectionRef, updatedEventData);
  
        const oldPostDocumentRef = doc(uploadsSubcollectionRef, `${editingEvent.id}`);
        await deleteDoc(oldPostDocumentRef);
  
        console.log('Event with updated date created successfully!');
      } else {
        const userUploadsCollectionRef = collection(db, "User Calendars");
        const userDocumentRef = doc(userUploadsCollectionRef, `${auth.currentUser.uid}`);
        const uploadsSubcollectionRef = collection(userDocumentRef, "Events");
        const postDocumentRef = doc(uploadsSubcollectionRef, `${editingEvent.id}`);
  
        await updateDoc(postDocumentRef, updatedEventData);
  
        console.log('Event updated successfully!');
      }
  
      setEditingEvent(null);
      setIsEditing(false);
  
      onRefresh();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const customTheme = {
    calendarBackground: "#FFFFFF",
    textSectionTitleColor: "#333",
    selectedDayBackgroundColor: "#3498db",
    selectedDayTextColor: "white",
    todayTextColor: "#3498db",
    dayTextColor: "#333",
    textDisabledColor: "#A9A9A9",
    textDayFontSize: 18,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 15,
  };

  const sortedEvents = allEvents.sort((a, b) => a.date.localeCompare(b.date));
  const groupedEvents = {};
  sortedEvents.forEach((event) => {
    if (!groupedEvents[event.date]) {
      groupedEvents[event.date] = [];
    }
    groupedEvents[event.date].push(event);
  });

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    };
    const formattedDate = new Date(dateString)
      .toLocaleDateString(undefined, options)
      .replace(",", "");
    return formattedDate;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setAllUserEvents([]);
    await fetchAllEvents();
    await sortEvents();
    await groupAndSortEvents();
    setRefreshing(false);
  };

  const confirmDelete = (index) => {
    setIndex(index);
    setDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
    setIndex("");
  };

  const deleteFavLoc = async () => {
    const userUploadsCollectionRef = collection(db, "User Calendars");
    const userDocumentRef = doc(
      userUploadsCollectionRef,
      `${auth.currentUser.uid}`
    );
    const uploadsSubcollectionRef = collection(userDocumentRef, "Events");
    const postDocumentRef = doc(uploadsSubcollectionRef, `${index}`);
    try {
      await deleteDoc(postDocumentRef);
      console.log("Document successfully deleted!");
      setDeleteConfirm(false);
      setIndex("");
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("wanderwise-frontend/icons/back.png")}
          resizeMode="contain"
          style={styles.backButtonIcon}
        />
      </TouchableOpacity>

      
        <Calendar
          style={styles.calendar}
          theme={customTheme}
          onDayPress={handleDateSelect}
          markedDates={markedDates}
        />

        {isSelected === 1 && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
            <Text style={styles.addButtonLabel}>Add Event</Text>
          </TouchableOpacity>
        )}

        <Modal
          isVisible={isModalVisible}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.7}
          onBackdropPress={closeModal}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { width: "98%" }]}
                placeholder="Event Name"
                value={eventName}
                onChangeText={(text) => setEventName(text)}
                editable={true}
                placeholderTextColor={"#bbb"}
              />
            </View>

            <View style={styles.inputContainer}>
            <TextInput
                style={[styles.input, { width: "98%" }]}
                placeholder="Event Location"
                value={eventLocation}
                onChangeText={(text) => setLocationName(text)}
                editable={true}
                placeholderTextColor={"#bbb"}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Type the Note Here"
                value={eventDescription}
                onChangeText={(text) => setEventDescription(text)}
                multiline={true}
                numberOfLines={4}
                editable={true}
                placeholderTextColor={"#bbb"}
              />
            </View>

            <View style={styles.dateTimeContainer}>
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateTimeInput]}
                  placeholder="Start Time"
                  value={
                    eventTime instanceof Date
                      ? eventTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : eventTime
                  }
                  editable={true}
                  onChangeText={(text) => setEventTime(text)}
                  placeholderTextColor={"#bbb"}
                />
                <TouchableOpacity onPress={showTimePicker}>
                  <FontAwesome5
                    name="clock"
                    style={{
                      position: "absolute",
                      right: 10,
                      fontSize: 20,
                      color: "#808080",
                      top: -50,
                    }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.timeInputContainer}>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, styles.dateTimeInput]}
                    placeholder="End Time"
                    value={
                      endTime instanceof Date
                        ? endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : endTime
                    }
                    editable={true}
                    onChangeText={(text) => setEndTime(text)}
                    placeholderTextColor={"#bbb"}
                  />
                  <TouchableOpacity onPress={() => showEndTimePicker()}>
                    <FontAwesome5
                      name="clock"
                      style={{
                        position: "absolute",
                        right: 10,
                        fontSize: 20,
                        color: "#808080",
                        top: -17,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitEvent}
            >
              <Text style={styles.submitButtonLabel}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {
          <View style={styles.events}>
            <Text
              style={{ alignSelf: "center", fontSize: 25, marginBottom: 20 }}
            >
              Upcoming Events
            </Text>

            {refreshing && <ActivityIndicator size="large" color="#3498db" />}

            <Modal visible={showDeleteConfirm} transparent>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 20,
                    borderRadius: 10,
                    elevation: 5,
                    borderColor: "#ddd",
                    borderWidth: 1,
                    alignItems: "center",
                    width: "85%",
                    elevation: 5, 
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}
                >
                  <Text style={{ textAlign: "center" }}>
                    Are you sure you want to delete this location?
                  </Text>
                  <TouchableOpacity
                    onPress={deleteFavLoc}
                    style={{
                      backgroundColor: "#D11A2A",
                      padding: 5,
                      borderRadius: 5,
                      marginTop: 10,
                      width: "80%",
                    }}
                  >
                    <Text style={{ textAlign: "center", color: "black" }}>
                      Yes, Delete
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    title="Cancel"
                    onPress={cancelDelete}
                    style={{
                      backgroundColor: "#ddd",
                      padding: 5,
                      borderRadius: 5,
                      marginTop: 10,
                      width: "80%",
                    }}
                  >
                    <Text style={{ textAlign: "center" }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {!isLoading ? (
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
          {allUserEvents.length > 0 ? (
              allUserEvents.map((item, index) => (
                <View key={index} style={styles.eventContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.eventDay}>{formatDate(item.date)}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                          onPress={() => confirmDelete(item.id)}
                        >
                          <Image
                            source={require("wanderwise-frontend/icons/x.png")}
                            style={{ height: 15, width: 15 }}
                          />
                        </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.eventName}>{item.eventName}</Text>
                  {item.startTime && item.endTime ? (
                    <Text style={styles.eventTime}>
                      {item.startTime} - {item.endTime}
                    </Text>
                  ) : (
                    <Text style={styles.eventTime}>{item.startTime}</Text>
                  )}
                  <Text style={styles.eventDescription}>{item.eventLocation}</Text>
                  <Text style={styles.eventDescription}>{item.eventDescription}</Text>      
                  <TouchableOpacity
                    onPress={() => handleEditEvent(item)}
                    style={{ position: "absolute", bottom: 8, right: 5 }}
                  >
                    <FontAwesome5
                      name="edit"
                      style={{ fontSize: 20, color: "#808080" }}
                    />      
                  </TouchableOpacity>    
                </View>
              ))
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No upcoming events</Text>
              </View>
            )}     
                <Modal
                  isVisible={isEditing}
                  animationIn="slideInUp"
                  animationOut="slideOutDown"
                  backdropOpacity={0.7}
                  onBackdropPress={() => {
                    setIsEditing(false);
                    setEditingEvent(null);
                  }}
                >
                  <View style={styles.modalContent}>
                    <View style={{ marginTop: 40, paddingHorizontal: 10 }}>
                      <TouchableOpacity
                        style={styles.closeButtonContainer}
                        onPress={() => {
                          setIsEditing(false);
                          setEditingEvent(null);
                        }}
                      >
                        <Image
                          source={require("wanderwise-frontend/icons/x.png")}
                          resizeMode="contain"
                          style={styles.closeButtonIcon}
                        />
                      </TouchableOpacity>

                      <Text style={[styles.modalTitle, { marginBottom: 30 }]}>
                        Edit Event
                      </Text>

                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { width: "98%" }]}
                          placeholder="Enter Date"
                          value={editingEvent?.date}
                          onChangeText={(text) =>
                            setEditingEvent({ ...editingEvent, date: text })
                          }
                          editable={true}
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { width: "98%" }]}
                          placeholder="Event Name"
                          value={editingEvent?.eventName}
                          onChangeText={(text) =>
                            setEditingEvent({
                              ...editingEvent,
                              eventName: text,
                            })
                          }
                          editable={true}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { width: "98%" }]}
                          placeholder="Location Name"
                          value={editingEvent?.eventLocation}
                          onChangeText={(text) =>
                            setEditingEvent({
                              ...editingEvent,
                              eventLocation: text,
                            })
                          }
                          editable={true}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[
                            styles.input,
                            styles.multilineInput,
                            { height: 80 },
                          ]}
                          placeholder="Type the Note Here"
                          value={editingEvent?.eventDescription}
                          onChangeText={(text) =>
                            setEditingEvent({
                              ...editingEvent,
                              eventDescription: text,
                            })
                          }
                          editable={true}
                          multiline={true}
                          numberOfLines={4}
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { width: "48%" }]}
                          placeholder="Enter Start Time"
                          value={editingEvent?.startTime}
                          onChangeText={(text) =>
                            setEditingEvent({
                              ...editingEvent,
                              startTime: text,
                            })
                          }
                          editable={true}
                        />

                        <View style={{ width: 10 }} />

                        <TextInput
                          style={[styles.input, { width: "48%" }]}
                          placeholder="Enter End Time"
                          value={editingEvent?.endTime}
                          onChangeText={(text) =>
                            setEditingEvent({ ...editingEvent, endTime: text })
                          }
                          editable={true}
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleUpdateEvent}
                      >
                        <Text style={styles.submitButtonLabel}>
                          Update Event
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#3498db" />
            )}
          </View>
        }
    </View>
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}
export default MyCalendar;

const styles = StyleSheet.create({
  noEventsContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  noEventsText: {
    fontSize: 18,
    color: "#808080",
  },
  closeButtonContainer: {
    position: "absolute",
    top: -30,
    right: 10,
    zIndex: 1,
  },

  closeButtonIcon: {
    height: 20,
    width: 20,
  },
  dateText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  timeIcon: {
    position: "absolute",
    right: 10,
    fontSize: 20,
    color: "#808080",
    top: -400,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
    color: "#C47335",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  timeIcon: {
    position: "absolute",
    right: 10,
    fontSize: 20,
    color: "#C47335",
    top: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFFFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    width: "100%",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
  },

  timeInputContainer: {
    flex: 1,
    marginRight: 10,
    width: "48%",
  },
  dateTimeInput: {
    flex: 1,
    paddingVertical: 15,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#808080",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    width: "98%",
  },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    backgroundColor: "transparent",
    borderRadius: 30,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  backButtonIcon: {
    width: 25,
    height: 25,
    tintColor: "#333",
    marginLeft: 5,
  },
  calendar: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  addButton: {
    backgroundColor: "#3498db",
    borderRadius: 30,
    alignSelf: "center",
    marginVertical: 15,
    padding: 15,
    width: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  addButtonLabel: {
    textAlign: "center",
    fontSize: 15,
    color: "white",
  },
  textInput: {
    alignSelf: "center",
    borderColor: "gray",
    borderBottomWidth: 50,
    fontSize: 15,
    flex: 1,
    width: 200,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#3498db",
    borderRadius: 30,
    alignSelf: "center",
    marginVertical: 15,
    padding: 15,
    width: "50%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  submitButtonLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  events: {
    backgroundColor: "#F2F2F2",
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
  },

  eventContainer: {
    width: "95%",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
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
    color: "#3498db",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  eventDay: {
    fontSize: 14,
    color: "black",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
