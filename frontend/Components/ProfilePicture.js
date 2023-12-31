import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, FlatList, TextInput} from 'react-native';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
//reference bucket, helps us uplaod image - give info abt upload, give url to ref data 
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc, setDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import * as ImagePicker from 'expo-image-picker';

const fetchPostsFromFirestore = async () => {
    const currentUser = auth.currentUser;
    if (currentUser){
        const id = currentUser.uid;
        const userDocumentRef = doc(db, "userProfilePics", id) 
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
        console.log("NO USER LOGGED IN");
        return null;
    }
}

const ProfilePicture = () => {

    const [profileImage, setProfileImage] = useState('');
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const postsData = await fetchPostsFromFirestore();
        setProfileImage(postsData);
      };



    const selectProfileImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true,
            aspect: [3,4],
            quality: 1
        })
        if (!result.canceled){
            setProfileImage(result.assets[0].uri);
            await uploadImage(result.assets[0].uri, 'image');
        }
    };

    async function uploadImage(uri, fileType){
        const currentUserId = auth.currentUser.uid;

        const response = await fetch(uri); 
        const blob = await response.blob();
    
        const storageRef = ref(storage, "UserProfilePics/" + currentUserId)
        const uploadTask = uploadBytesResumable(storageRef, blob)
    
        uploadTask.on("state_changed", 
            (snapshot)=>{
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Progress ", progress);
                setProgress(progress.toFixed());
            },
            (error)=>{
                // console.log("NOT UPLOADED")
                console.log(error)
                setProfileImage(null)
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadUrl)=>{
                    await saveRecord(fileType, downloadUrl);
                    console.log("File available at: ", downloadUrl);
                })
            }
        )
    }
    
    async function saveRecord(fileType, url){
        try{
            const currentUserId = auth.currentUser.uid;
            const userDocumentRef = doc(db, "userProfilePics", currentUserId)

    
            await setDoc(userDocumentRef, {
                "userId": currentUserId,
                "fileType": fileType,
                "URL": url, 
                "Date": new Date()
            }, { merge: true })
        }catch(e){
            console.log(e)
            setProfileImage(null)
        }
    }

    return (
      <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
            <TouchableOpacity disabled>
                {profileImage ? <Image source={{uri: profileImage}} style={styles.userImage} />
                    : <Image source={require('wanderwise-frontend/icons/profile.webp')} style={styles.userImage} />
                }
                
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={selectProfileImage}>
                <Image source={require('wanderwise-frontend/icons/edit.png')} style={{height:25, width:25}}></Image>
            </TouchableOpacity>
      </SafeAreaView>
        
  );
}

export default ProfilePicture;

const styles = StyleSheet.create({
    userImage:{
        height: 150,
        width: 150, 
        borderRadius: 75,
    },
    logoutButton:{
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: 9,
        borderRadius: 50,
        backgroundColor:'#eee',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
})
