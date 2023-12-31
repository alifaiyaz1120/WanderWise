import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, Button } from 'react-native';
import ProfilePicture from './ProfilePicture';
import { addDoc, collection, onSnapshot, doc, getDocs, updateDoc,  getDoc, setDoc, arrayRemove} from 'firebase/firestore';
import { storage, db, auth } from '../firebase_config';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';



const FavoriteLocation = (favLocData, refreshFavs) => {
  console.log(favLocData)

    const currentUserID = auth.currentUser.uid;
    const [favLocations, setFavLocations] = useState(favLocData.userDataIn);
    const [showDeleteConfirm, setDeleteConfirm] = useState(false)
    const [index, setIndex] = useState('')
    const navigation = useNavigation();


    const fetchFavLoc = async () => {
      const currentUserID = auth.currentUser.uid;
      const userRef = doc(db, 'User Profiles', currentUserID);
      try {
          const userDoc = await getDoc(userRef);
          let favoritedLocations = [];
      
          if (userDoc.exists()) {
              const userData = userDoc.data();
              setFavLocations(userData.favoritedLocations)
          }
          console.log(favoritedLocations)
          } catch (error) {
          console.log(error);
      }
    }
    const navigateToLocationDetail = (location) => {
      console.log(location);

      navigation.navigate('LocationDetails', { location });
    };
  
    const deleteFavLoc = async () => {
      const userRef = doc(db, 'User Profiles', currentUserID);
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedFavLocations = userData.favoritedLocations.filter(
            (_, i) => i !== index
          );
  
          await updateDoc(userRef, { favoritedLocations: updatedFavLocations });
          setFavLocations(updatedFavLocations);
          setDeleteConfirm(false)
          setIndex("")
        }
      } catch (error) {
        console.log(error);
      }
    };

    const cancelDelete = () => {
      setDeleteConfirm(false);
      setIndex("")
    };
    const confirmDelete = (index) => {
      setIndex(index)
      setDeleteConfirm(true);
    };
  
    
    return (
      <View style={styles.container}>
        {favLocations && favLocations.length !== 0 ? (
          favLocations.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.postContainer}
                onPress={() => navigateToLocationDetail(favLocations[index])}
              >
                <Image source={{ uri: favLocations[index].image }} style={styles.image}></Image>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{favLocations[index].name}</Text>
                  <Text style={styles.address}>{favLocations[index].address}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(index)}>
                  <Image source={require('wanderwise-frontend/icons/delete.png')} style={styles.deleteIcon}></Image>
                </TouchableOpacity>
              </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noLocationsText}>Your saved locations will appear here!</Text>
        )}
        <Modal visible={showDeleteConfirm} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to delete this location?</Text>
              <TouchableOpacity onPress={deleteFavLoc} style={styles.yesButton}>
                <Text style={styles.yesButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity title="Cancel" onPress={cancelDelete} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
};

export default FavoriteLocation;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginBottom: 15,
  },
  postContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',      
    // borderColor: '#ddd',
    // borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 10,
  },
  textContainer: {
    width: '100%',
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  address: {
    fontSize: 13,
  },
  deleteButton: {
    paddingRight: 10,
  },
  deleteIcon: {
    height: 20,
    width: 20,
    tintColor: '#CE2D4F',
  
  },
  noLocationsText: {
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    alignItems: 'center',
    width: '85%',
  },
  modalText: {
    textAlign: 'center',
  },
  yesButton: {
    backgroundColor: '#D11A2A',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
  },
  yesButtonText: {
    textAlign: 'center',
    color: 'black',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
  },
  cancelButtonText: {
    textAlign: 'center',
  },
});
