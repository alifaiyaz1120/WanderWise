import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, FlatList, TextInput} from 'react-native';
import UserPost from './UserPost';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
//reference bucket, helps us uplaod image - give info abt upload, give url to ref data 
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc, setDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import * as ImagePicker from 'expo-image-picker';

const OtherUserProfilePicture = ({props}) => {
    
    const [profileImage, setProfileImage] = useState('');
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [userUID, setUserUID] = useState(props);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const postsData = await fetchPostsFromFirestore();
        setProfileImage(postsData);
      };

      const fetchPostsFromFirestore = async () => {
        const currentUserID = userUID;
        // console.log(userUID)
        if (currentUserID){
            const userDocumentRef = doc(db, "userProfilePics", currentUserID)
            
            try {
                const docSnapshot = await getDoc(userDocumentRef);
                if (docSnapshot.exists()) {
                    const image = docSnapshot.data();
                    // console.log(image)
                    return image.URL;
                } else {
                    console.log("No profile picture document found for the user.");
                    return null;
                }
            } catch (error) {
                console.error("Error fetching profile picture:", error);
                return null;
            }
        }else{
            console.log("NO USER FOUND");
            return null;
        }
    }

    return (
      <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1 }}>
            <View style={{backgroundColor:'transparent'}}>
                {profileImage ? <Image source={{uri: profileImage}} style={styles.userImage} />
                    : <Image source={require('wanderwise-frontend/icons/profile.webp')} style={styles.userImage} />
                }        
            </View>
      </SafeAreaView>
        
  );
}

export default OtherUserProfilePicture;

const styles = StyleSheet.create({
    userImage:{
        height: 150,
        width: 150, 
        borderRadius: 75,
    },
})
