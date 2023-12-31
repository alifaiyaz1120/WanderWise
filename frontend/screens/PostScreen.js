import React, {useState} from 'react';
import {View, Text, TouchableWithoutFeedback, Keyboard, StyleSheet, TouchableOpacity, Image,TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import ProgressBar from '../Components/ProgressBar';
import { Uploading } from '../Components/Uploading';
import * as ImagePicker from "expo-image-picker";
import {Ionicons} from '@expo/vector-icons';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { FontAwesome5 } from '@expo/vector-icons';

//reference bucket, helps us uplaod image - give info abt upload, give url to ref data 
import {addDoc, collection, onSnapshot, doc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';


const GOOGLE_PLACES_API_KEY = "..."; 

const PostScreen = ({navigation}) => {
    const currentUser = auth.currentUser;
    if (currentUser){
        const id = currentUser.uid;
        console.log(currentUser.uid)
    }else{
        console.log("NO USER LOGGED IN")
    }
    
    const [image, setImage] = useState("");
    const [video, setVideo] = useState("");
    const [fileType, setFileType] = useState("");
    const [progress, setProgress] = useState(0);
    const [imageBio, setImageBio] = useState("");
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showCancel, setCancel] = useState(false);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("");

    
    const openLocationPopup = () => {
      setShowLocationPopup(true);
   
  };

    async function pickImage (){
        setImageError(false);

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true,
            aspect: [3,4],
            quality: 0.1
        })
        if (!result.canceled){
            setImage(result.assets[0].uri);
            setFileType('image'); 
            setCancel(true);
        }
    }

    async function pickVideo (){
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos, 
            allowsEditing: true,
            aspect: [3,4],
            quality: .2,
        })
        if (!result.canceled){
            setImage(result.assets[0].uri)
            await uploadImage(result.assets[0].uri, 'video');
        }
    }
    
    async function uploadCaller(){
        if(!image){
            console.log("NO IMAGE");
            setImageError(true)
        }
        else{
            setCancel(false);
            setImageError(false);
            await uploadImage(image, fileType, imageBio);
            setUploading(true);
            setSelectedLocation(null);
        }
    }

    async function uploadImage(uri, fileType, bio){
        console.log("CALLED")
        const response = await fetch(uri); 
        const blob = await response.blob();

        const storageRef = ref(storage, "UserUploads/" + new Date().getTime())
        const uploadTask = uploadBytesResumable(storageRef, blob)

        uploadTask.on("state_changed", 
            (snapshot)=>{
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Progress ", progress);
                setProgress(progress.toFixed());
            },
            (error)=>{
                console.log(error)
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadUrl)=>{
                    await saveRecord(fileType, downloadUrl, bio);
                    console.log("File available at: ", downloadUrl);
                    setImage("");
                    setVideo("");
                })
            }
        )
    }

    async function saveRecord(fileType, url, bio){
        try{
            const currentUserId = auth.currentUser.uid;

            const userUploadsCollectionRef = collection(db, "userUploads");
            const userDocumentRef = doc(userUploadsCollectionRef, `${currentUserId}`);
            const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");

            const docRef = await addDoc(uploadsSubcollectionRef, {
                "userId": currentUserId,
                "fileType": fileType,
                "URL": url, 
                "imageDescriotion": bio,
                "Date": new Date(),
                "liked": [],
                "location": selectedLocation
            })
            console.log("Doc saved", docRef.id)
            setImage("");
            setImageBio("");
            setFileType("");
            setUploading(false);

            navigation.goBack();

        }catch(e){
            console.log(e)
        }
    }

    function cancelUpload(){
        setImage("");
        setVideo("");
        setImageBio("");
        setFileType("");
        setProgress(0)
        setUploading(false);
        setImageBio("");
        setCancel(false);
        setSelectedLocation("")
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
            <View style={styles.imgBioContainer}>
                <TextInput placeholder="What's on your mind?" onChangeText={setImageBio} value={imageBio} style={styles.bioInput}></TextInput>
                {image && <View style={{height: '50%', width: '100%'}}>
                    {image && <Image style={styles.userImage} source={{uri:image}}></Image>}
                </View>}
                {/* location */}
                {showLocationPopup && (
                    <View style={styles.locationPopup}>
                        <GooglePlacesAutocomplete
                            placeholder="Enter location"
                            minLength={2}
                            autoFocus={false}
                            returnKeyType={'search'}
                            listViewDisplayed="auto"
                            fetchDetails={true}
                            renderDescription={(row) => row.description}
                            onPress={(data, details = null) => {
                                const { location } = details.geometry;
                                setSelectedLocation(data.description);
                                setShowLocationPopup(false);
                            }}
                            query={{
                                key: GOOGLE_PLACES_API_KEY,
                                language: 'en',
                            }}
                            styles={{
                                textInputContainer: styles.textInputContainer,
                                textInput: styles.textInput,
                                description: styles.description,
                                listView: styles.listView,
                            }}
                        />
                        {/* close button for the pop-up */}
                        <TouchableOpacity onPress={() => setShowLocationPopup(false)} style={styles.closeButton}>
                            <Text style={{ color: 'white' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* display selected location */}
                {selectedLocation ? (
                    <View style={styles.locationContainer}>
                        <FontAwesome5 name="map-marked-alt" size={20} color="#007bff" />
                        <Text style={{ color: '#007bff', marginLeft: 5 }}>{selectedLocation}</Text>
                    </View>
                ) : (
                    <TouchableOpacity onPress={openLocationPopup} style={styles.locationContainer}>
                        <FontAwesome5 name="map-marked-alt" size={20} color="#007bff" />
                        <Text style={{ color: '#007bff', marginLeft: 5 }}>Add Location</Text>
                    </TouchableOpacity>
                )}
                
               
                <TouchableOpacity style={{backgroundColor: '#DDD', borderRadius: 30, alignSelf: 'center', marginTop: 30, padding: 7}} onPress={uploadCaller}>
                    {uploading
                        ? <ProgressBar progress={progress} style={{marginTop: 30}}></ProgressBar> 
                        : <Image source={require('wanderwise-frontend/icons/upload.png')} style={{height:25, width:25}}></Image>
                    }
                </TouchableOpacity>
                {imageError && <Text style={{color:'red', marginTop: 5}}>No image selected</Text>}

                {showCancel && <TouchableOpacity style={{backgroundColor: 'black', borderRadius: 30, alignSelf: 'center', marginTop: 10}} onPress={cancelUpload}>
                        <Text style={{textAlign: 'center', alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 40, fontSize: 15, color: 'white'}}>Cancel</Text>
                </TouchableOpacity>}
            </View>

        <TouchableOpacity
            onPress={pickImage}
            style={{
                width: 50,
                height: 50,
                backgroundColor: '#7ab8d6',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 25,
                marginRight: 20,
                marginBottom: 20,
                alignSelf: 'flex-end',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOpacity: 1,
                elevation: 6,
                shadowRadius: 15 ,
                shadowOffset : { width: 1, height: 13},
            }}
        >
           <Ionicons name='image' size={25} color="white"></Ionicons>
        </TouchableOpacity>
        </View>
        </TouchableWithoutFeedback>
    );
}

export default PostScreen;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
    },
  locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
  },
  locationPopup: {
    position: 'absolute',
    top: '40%', 
    left: '5%', 
    width: '90%',
    padding: 30, 
    backgroundColor: '#f0f0f0',
    borderRadius: 10, 
    elevation: 5,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
      marginTop: 10,
      backgroundColor: '#CE2D4F',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  bioInput:{
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 30,
  },
  imgBioContainer:{
      flex:1,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      width: '100%',
      backgroundColor: '#fff',
      // backgroundColor: 'red',
    },
  userImage:{
    height: '100%',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10
  },
})