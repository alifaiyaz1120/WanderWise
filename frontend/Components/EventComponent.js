import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Button, KeyboardAvoidingView } from 'react-native';
import { auth } from '../firebase_config';
import { Image } from 'react-native';


const EventComponent = ({ events, onDelete }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const assignColor = (index) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71']; 
    const colorIndex = index % colors.length;
    return colors[colorIndex];
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedEvent(item);
        setModalVisible(true);
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        borderColor: '#ddd',
        borderWidth: 1,
        marginLeft: 20,
        marginRight: 20,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: assignColor(index),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {item.event_name[0]}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5, color: '#333' }}>
          {item.event_name}
        </Text>
        <Text style={{ color: '#777', fontWeight: 'bold', fontSize: 18, color: 'green' }}>
          ${item.event_budget}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onDelete(auth.currentUser.uid, item.id)}
        style={{
          padding: 10,
          borderRadius: 10,
        }}
      >
      <Image source={require('wanderwise-frontend/icons/x.png')} style={{height:15, width:15}}></Image>

      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10, color: '#333', textAlign: 'center' }}>
            {selectedEvent?.event_name}
          </Text>
          <Text style={{ marginBottom: 10, fontSize: 16, color: '#777', textAlign: 'center' }}>
            Description: {selectedEvent?.event_description}
          </Text>
          <Text style={{ marginBottom: 10, fontSize: 16, color: '#777', textAlign: 'center' }}>
            Location: {selectedEvent?.event_location}
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'green', textAlign: 'center' }}>
            Budget: ${selectedEvent?.event_budget}
          </Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
      {renderModal()}
    </KeyboardAvoidingView>
  );
};

export default EventComponent;
