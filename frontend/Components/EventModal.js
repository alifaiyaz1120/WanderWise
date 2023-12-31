import React, { useState } from 'react';
import { Modal, View, TextInput, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { auth } from '../firebase_config';

const EventModal = ({ visible, onClose, onSubmit }) => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventBudget, setEventBudget] = useState('');

  const handleSubmit = () => {
    const eventData = {
      firebase_user_id: auth.currentUser.uid,
      event_name: eventName,
      event_description: eventDescription,
      event_location: eventLocation,
      event_budget: eventBudget,
    };
    onSubmit(eventData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Event</Text>
          <TextInput
            placeholder="Event Name"
            value={eventName}
            onChangeText={setEventName}
            style={styles.input}
            placeholderTextColor={"#bbb"}
          />
          <TextInput
            placeholder="Event Description"
            value={eventDescription}
            onChangeText={setEventDescription}
            style={styles.input}
            placeholderTextColor={"#bbb"}
          />
          <TextInput
            placeholder="Event Location"
            value={eventLocation}
            onChangeText={setEventLocation}
            style={styles.input}
            placeholderTextColor={"#bbb"}
          />
          <TextInput
            placeholder="Event Expense"
            value={eventBudget}
            onChangeText={setEventBudget}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={"#bbb"}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#3498db',
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EventModal;
