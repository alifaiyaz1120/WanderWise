import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, FlatList, TextInput} from 'react-native';
import UserPost from './UserPost';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import ProfilePicture from './ProfilePicture';
import OtherUserProfilePicture from './otherUserProfilePicture';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Animated } from "react-native";

const av = new Animated.Value(0);
av.addListener(() => {return});


const OtherUserProfile = () => {
    const [userEmail, setUserEmail] = useState("");
    const [userUID, setUserUID] = useState("");
    const [bio, setBio] = useState('');
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(require('wanderwise-frontend/icons/mockPfp.jpeg'));
    const [posts, setPosts] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [userNotFound, setUserNotFound] = useState(false);
    const navigation = useNavigation();
    const [showView, setView] = useState(false);


    useEffect(() => {
        const fetchUserDataAndPosts = async () => {
            await fetchUserData();
            await fetchPosts();
            await sortPosts();
        };

        if (userUID) {
            fetchUserDataAndPosts();
        }
    }, [userUID]);

    const sortPosts = async () => {
        setPosts(prevPosts => [...prevPosts].sort((a, b) => new Date(b.ConDate) - new Date(a.ConDate)));
    }

    const handleUserSearch = async () =>{
        setUserNotFound(false)
        setView(false)
        setUserUID(objOfUsers[userEmail]);
        setUserName(''); 
        setBio('');
        console.log(userEmail)
        if(!userEmail){
            
        }
        else if(!objOfUsers[userEmail]){
            setUserNotFound(true)
        }
        else if(userEmail){
            await fetchUserDataAndPosts()
            setView(true)
        }
    }
    const fetchUserDataAndPosts = async () =>{
        await fetchUserData();
        await fetchPosts();
    }

    const fetchUserData = async () => {
        if(userUID){
            const userRefDoc = doc(db, 'User Profiles', userUID);
            
            try {
                const userDocSnapshot = await getDoc(userRefDoc);
        
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setBio(userData.bio);
                    setUserName(userData.firstName + ' ' + userData.lastName);
                } else {
                    console.log('User data not found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    }

    const fetchPosts = async () => {
        const postsData = await fetchPostsFromFirestore();
        postsData.reverse()
        setPosts(postsData);
    };

    const fetchPostsFromFirestore = async () => {
      const currentUser = userUID;
        if (currentUser){
            try{ 
                const id = userUID;
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

    const renderUserProfile = () => {
        if(userUID){
            navigation.navigate("RenderOtherUserProfile", {userID: userUID, userName: userName, bio: bio, postArr: posts});
        }
        else{
            return(
                <View>
                    {userNotFound ? <Text>User not found x_x</Text>
                        : <Text>Serach for Users...</Text>
                    }
                </View>
            )
        }
    }

    const handleViewUserProfile = () => {
        if (userUID) {
            navigation.navigate("RenderOtherUserProfile", {
                userID: userUID,
                userName: userName,
                bio: bio,
                postArr: posts,
            });
            setView(false)
        } else {
            // Handle the case when the user is not found or not set
            console.log('User not found');
        }
    }

    return (
      <SafeAreaView key={refreshKey} style={{ backgroundColor: 'transparent', width: '90%'}}>
        <View style={styles.container} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <View style={styles.searchUserContainer}>
                <Text style={styles.searchUserTitle}>Search Users</Text>
                <Image source={require('wanderwise-frontend/icons/multiple-users-silhouette.png')} resizeMode='contain' style={styles.groupImage}></Image>
            </View>
            
            <TextInput placeholder='User Email...' style={styles.input} onChangeText={setUserEmail} value={userEmail}></TextInput>

            {<TouchableOpacity style={{backgroundColor: '#C47335', borderRadius: 30, alignSelf: 'center', marginBottom: 5}} onPress={handleUserSearch}>
                <Text style={{textAlign: 'center', alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 40, fontSize: 15, color: 'white'}}>Search</Text>
            </TouchableOpacity>}

            {showView && <TouchableOpacity style={{ backgroundColor: '#011936', borderRadius: 30, alignSelf: 'center', marginBottom: 5 }} onPress={handleViewUserProfile}>
                    <Text style={{ textAlign: 'center', alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 40, fontSize: 15, color: 'white' }}>View Profile</Text>
                </TouchableOpacity>}

            {userNotFound && <Text>User not found.</Text>}

        </View>
      </SafeAreaView>
        
  );
}

export default OtherUserProfile;

const styles = StyleSheet.create({
    container:{
        flex: 1, 
        // justifyContent: 'center', 
        // alignItems: 'center',
        backgroundColor: '#D6D6D6',
        borderRadius: 10,
        padding: 10,
        width: '100%',
    },

    searchUserContainer:{
        // flex: 0.3,
        flexDirection: 'row',
        // flexWrap: 'wrap',
        // backgroundColor: 'yellow',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    searchUserTitle :{
        // backgroundColor: 'yellow',
        // textAlign: 'center',
        fontSize: 20,
        padding: 10,
        marginHorizontal: 10,
        flex:1
    },

    input: {
        width: '90%',
        height: 50,
        margin: 15,
        padding: 10,
        backgroundColor: '#eeeeee',
        borderRadius: 30,
    },

    userName:{
        fontSize: 18, 
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },

    aboutUser: {
        fontSize: 14, 
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
      //   marginBottom: 10,
      //   backgroundColor: 'red',
    },

    userInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 20,
    },

      groupImage: {
        width:25,
        height:25,
        // padding: 10,
        marginRight:20,
    },
})
