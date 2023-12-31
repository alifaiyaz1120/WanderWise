import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, FlatList, TextInput} from 'react-native';
import UserPost from './UserPost';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
//reference bucket, helps us uplaod image - give info abt upload, give url to ref data 
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc, setDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import * as ImagePicker from 'expo-image-picker';
import OtherUserProfile from './otherUserProfile';
import OtherUserProfilePicture from './otherUserProfilePicture';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import OtherUserPosts from './otherUserPosts';


const RenderOtherUserProfile = ({route}) => {
    const [followerCount, setFollowerCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [following, setFollowing] = useState(false)
    const navigation = useNavigation();
    posts = route.params.postArr

    useEffect(() => {
        fetchFollowingStatus()
    }, []);

    const fetchFollowingStatus = async () => {
        try {
            const userProfilesCollectionRef = collection(db, "User Profiles");
            const userDocumentRef = doc(userProfilesCollectionRef, `${route.params.userID}`);

            userSnapshot = await getDoc(userDocumentRef);
            userFollowers = userSnapshot.data().followers
            userFollowings = userSnapshot.data().followings

            setFollowerCount(userFollowers.length)
            setFollowingCount(userFollowings.length)

            if (userFollowers && userFollowers.includes(auth.currentUser.uid)){
                setFollowing(true);
                console.log("TRUE")
            }
            else{
                setFollowing(false)
                console.log("False")
            }

        } catch (error) {
            console.error('Error fetching liked status:', error);
        }
    }

    const handleFollow = async () =>{
        try {
            const userProfilesCollectionRef = collection(db, "User Profiles");
            const userDocumentRef = doc(userProfilesCollectionRef, `${route.params.userID}`);
            userSnapshot = await getDoc(userDocumentRef);
            userFollowers = userSnapshot.data().followers

            const currUserProfileRef = collection(db, "User Profiles");
            const currUserDocRef = doc(currUserProfileRef, `${auth.currentUser.uid}`);
            currUserSnapshot = await getDoc(currUserDocRef);
            currUserFollowings = currUserSnapshot.data().followings
      
            if (userFollowers)
            {
              if (userFollowers.includes(auth.currentUser.uid))
              {
                const updatedFollowers = userFollowers.filter(id => id !== auth.currentUser.uid);
                await updateDoc(userDocumentRef, { followers: updatedFollowers });
                setFollowerCount(followerCount - 1);
                setFollowing(false);

                if(currUserFollowings){
                    if(currUserFollowings.includes(route.params.userID)){
                        const updatedFollowingList = currUserFollowings.filter(id => id !== route.params.userID);
                        await updateDoc(currUserDocRef, { followings: updatedFollowingList });
                    }
                }
              }
              else {
                const updatedFollowers = (userFollowers) || [];
                updatedFollowers.push(auth.currentUser.uid);
                await updateDoc(userDocumentRef, { followers: updatedFollowers });
                setFollowerCount(followerCount + 1);
                setFollowing(true);

                if(currUserFollowings){
                    const updatedFollowings = (currUserFollowings) || [];
                    updatedFollowings.push(route.params.userID);
                    await updateDoc(currUserDocRef, { followings: updatedFollowings });
                }
              }
            }
            else {
              console.log('Liked data not found');
            }
          } catch (error) {
            console.error('Error toggling like:', error);
          }
    }


    return (
        <SafeAreaView style={{ backgroundColor: 'transparent', width: '100%', marginTop: 30, justifyContent: 'center', alignItems:'center'}}>
            <ScrollView style={styles.container} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center'}} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={{marginTop: 15,backgroundColor: 'transparent', borderRadius: 30, alignSelf:'flex-start'}} onPress={()=>navigation.goBack()}>
                <Image source={require('wanderwise-frontend/icons/back.png')} resizeMode='contain' style={{width: 25, height: 25, paddingHorizontal: 20}}></Image>
            </TouchableOpacity>

                    <OtherUserProfilePicture props={route.params.userID}></OtherUserProfilePicture>
                    <Text style={styles.userName}>{route.params.userName}</Text>
                    <Text style={styles.aboutUser}>{route.params.bio}</Text>

                    <View style={styles.userInfoWrapper}>
                        <View style={styles.userInfoItem}>
                            <Text style={styles.userInfoTitle}>{posts.length}</Text>
                            <Text style={styles.userInfoSubTitle}>Posts</Text>
                        </View>
                        <View style={styles.userInfoItem}>
                            <Text style={styles.userInfoTitle}>{followerCount}</Text>
                            <Text style={styles.userInfoSubTitle}>Followers</Text>
                        </View>
                        <View style={styles.userInfoItem}>
                            <Text style={styles.userInfoTitle}>{followingCount}</Text>
                            <Text style={styles.userInfoSubTitle}>Following</Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.editButton} onPress={handleFollow}>
                        {
                            following ? 
                                <Text style={{color: 'white', textAlign: 'center', fontSize: 16}}>Unfollow</Text>
                                : <Text style={{color: 'white', textAlign: 'center', fontSize: 16}}>Follow</Text>
                            
                        }
                    </TouchableOpacity>

                    <View style={{width:"100%" }}>
                    {
                        posts.map((item, index)=><OtherUserPosts key={index} userDataIn={item} name={route.params.userName} userUID={route.params.userID}></OtherUserPosts>)
                    }
                    </View>
            </ScrollView>
      </SafeAreaView>
        
  );
}

export default RenderOtherUserProfile;

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#eee',
        borderRadius: 10,
        padding: 10,
        width: '100%',
        // justifyContent: 'center',
        // alignItems:'center'
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

      userInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 20,
      },
      userInfoItem: {
        justifyContent: 'center',
      },
      userInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
      },
      userInfoSubTitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
      },

      editButton: {
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        backgroundColor: '#2e64e5',
        borderRadius: 10,
        width: '40%'
      },
})