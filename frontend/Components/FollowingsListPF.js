import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase_config';


const FollowingsListPF = ({ navigation, userDataIn, setShowFollowings, showFollowings, setShowFollowers, showFollowers }) => {
  const [profileImage, setProfileImage] = useState('');
  const [userName, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const currentUserID = auth.currentUser.uid;
  const userUploadsCollectionRef = collection(db, "userUploads");
  const userDocumentRef = doc(userUploadsCollectionRef, `${currentUserID}`);
  const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");
  const postDocumentRef = doc(uploadsSubcollectionRef, `${userDataIn.id}`);
  navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    setProfilePicture();
    fetchUserData();
  }, []);

  const setProfilePicture = async () => {
    const postsData = await fetchProfilePictureFromFireBase();
    setProfileImage(postsData);
  };

  const fetchProfilePictureFromFireBase = async () => {
    const currentUser = userDataIn;
    if (currentUser) {
      const id = currentUser;
      const userDocumentRef = doc(db, 'userProfilePics', id);

      try {
        const docSnapshot = await getDoc(userDocumentRef);
        if (docSnapshot.exists()) {
          const image = docSnapshot.data();
          return image.URL;
        } else {
          console.log('No profile picture document found for the user.');
          return null;
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        return null;
      }
    } else {
      console.log('User not found.');
      return null;
    }
  };

  const fetchUserData = async () => {
    const currentUser = userDataIn;
    const userRefDoc = doc(db, 'User Profiles', currentUser);

    try {
      const userDocSnapshot = await getDoc(userRefDoc);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserName(userData.firstName + " " + userData.lastName);
        setBio(userData.bio);
      } else {
        console.log('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleUserProfileClick = async () => {

    const fetchPostsFromFirestore = async () => {
      const currentUser = userDataIn;
        if (currentUser){
            try{ 
                const id = currentUser;
                const userUploadsCollectionRef = collection(db, "userUploads");
                const userDocumentRef = doc(userUploadsCollectionRef, `${id}`);
                const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");
                // console.log(currentUser.uid)
          
                const querySnapshot = await getDocs(uploadsSubcollectionRef);
                const postsData = [];
          
                querySnapshot.forEach((doc) => {
                    if (doc.exists()) {
                        imageData = doc.data();
                        imageID = doc.id
                        postsData.push({id:imageID, ...imageData})
                    } else {
                        console.log("No such document!");
                    }
                });
                return postsData;
    
            }
            catch(error){
                console.log(error)
            }
        }else{
            console.log("NO USER LOGGED IN");
            return [];
        }
    }

    const postsData = await fetchPostsFromFirestore();
    postsData.reverse()
    if (userDataIn && route.name != 'RenderOtherUserProfile') { 
      navigation.navigate("RenderOtherUserProfile", {
          userID: userDataIn,
          userName: userName,
          bio: bio,
          postArr: postsData,
      });
      {
        showFollowings?
          setShowFollowings(false)
        :
          setShowFollowers(false)
      }
    } else {
        console.log("Not navigated to RenderOtherUserProfile")
    }
  }

  return (
    <TouchableOpacity style={styles.userContainer} onPress={()=>handleUserProfileClick()}>
        <View style={styles.userPfpContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.userPfp} />
          ) : (
            <Image source={require('wanderwise-frontend/icons/profile.webp')} style={styles.userPfp} />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
        </View>
    </TouchableOpacity>
  );
};

export default FollowingsListPF;

const styles = StyleSheet.create({
  userContainer: {
    flexDirection:'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginVertical: 10,
    padding: 5,
    shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
  },
  userPfpContainer: {
    padding: 5,
  },
  userPfp: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    // fontWeight: 'bold',
  },
});