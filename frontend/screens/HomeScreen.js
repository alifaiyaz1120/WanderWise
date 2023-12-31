import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image, Platform} from 'react-native';
import UserPost from '../Components/UserPost.js';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
//reference bucket, helps us uplaod image - give info abt upload, give url to ref data 
import {addDoc, collection, onSnapshot, doc, getDocs, getDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import OtherUserPosts from '../Components/otherUserPosts.js';
import OtherUserProfile from '../Components/otherUserProfile.js';
import SearchUsers from '../Components/SearchUsers.js';
import TextGradient from '../Components/TextGradient.js';
import FavoriteLocation from '../Components/FavoriteLocation.js';
import PopularLocations from '../Components/PopularLocations.js';

const popularLocData = [
    {
      "image": "https://i0.wp.com/thattravelista.com/wp-content/uploads/2020/08/France-Paris-12.jpg?fit=1100%2C825&ssl=1",
      "name": "Paris, France",
      "rating": "#1 in World's Best Places to Visit for 2023"
    },
    {
        "image": "https://www.tahiti.com/images1/thumbs/BOBPBR-aerial7-1200x720.jpg",
        "name": "Bora Bora",
        "rating": "#2 in World's Best Places to Visit for 2023"
    },
    {
        "image": "https://getinspiredeveryday.com/wp-content/uploads/2020/05/Top-10-Tips-for-Visiting-Glacier-National-Park-Get-Inspired-Everyday-13.jpg",
        "name": "Glacier National Park",
        "rating": "#3 in World's Best Places to Visit for 2023"
    },
    {
        "image": "https://www.fodors.com/wp-content/uploads/2018/10/HERO_UltimateRome_Hero_shutterstock789412159.jpg",
        "name": "Rome",
        "rating": "#4 in World's Best Places to Visit for 2023"
    },
    {
        "image": "https://deih43ym53wif.cloudfront.net/small_zermatt-matterhorn-switzerland-shutterstock_1298208013_44fea015e5.jpeg",
        "name": "Swiss Alps",
        "rating": "#5 in World's Best Places to Visit for 2023"
    },
  ]

const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    return date.toISOString();
  };

const HomeScreen = ({navigation}) => {
    const [posts, setPosts] = useState([]);
    const [userName, setUserName] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = async () => {
        try {
            await fetchFollowingsList();
            await sortPosts();
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false); 
        } 
    };
    useEffect(() => {
        fetchData()
    }, []);

    const sortPosts = async () => {
        setPosts(prevPosts => [...prevPosts].sort((a, b) => new Date(b.ConDate) - new Date(a.ConDate)));
    }

    const fetchFollowingsList = async () => {
        setPosts([])
        try {
            const currUserProfileRef = collection(db, "User Profiles");
            const currUserDocRef = doc(currUserProfileRef, `${auth.currentUser.uid}`);
            currUserSnapshot = await getDoc(currUserDocRef);
            currUserFollowings = currUserSnapshot.data().followings
      
            if (currUserFollowings)
            {
                await Promise.all(currUserFollowings.map(async (user) => {
                    await fetchPostsFromFirestore(user);
                }));
                
            }
            else {
              console.log('Liked data not found');
            }
          } catch (error) {
            console.error('Error toggling like:', error);
          }
    }

    const fetchPostsFromFirestore = async (userID) => {
        const currentUser = userID;
        if (currentUser){
            try {

                const id = userID;
                const userUploadsCollectionRef = collection(db, "userUploads");
                const userDocumentRef = doc(userUploadsCollectionRef, `${id}`);
                const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");
        
                const querySnapshot = await getDocs(uploadsSubcollectionRef);
                const postsData = [];
        
                querySnapshot.forEach((doc) => {
                    if (doc.exists()) {
                        imageData = doc.data();
                        imageID = doc.id
                        const convertedDate = convertTimestampToDate(imageData.Date);
                        postsData.push({
                            id: imageID,
                            ...imageData,
                            ConDate: convertedDate, 
                          });
                    } else {
                        console.log("No such document!");
                    }
                });

                setPosts((prevPosts) => [...prevPosts, ...postsData]);
            }
            catch(error){
                console.log(error)
            }
          }else{
              console.log("NO USER LOGGED IN");
              return [];
          }
      }

      const onRefresh = async () => {
        setRefreshing(true);
        setIsLoading(true)

        await fetchData()

        setRefreshing(false);
        setIsLoading(false)
      };

    return (
        <SafeAreaView style={{ backgroundColor: '#fff', flex: 1}}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>


                <View style={styles.header}>
                    <Text style={styles.headerTitle}>WANDERWISE</Text>
                </View>

                <View style={{alignSelf:'center'}}>
                    <SearchUsers></SearchUsers>
                </View>
                
                {
                    !isLoading && 
                    <View style={{width:"100%", padding: 11}}>
                        {
                            posts.map((item, index)=><OtherUserPosts key={index} userDataIn={item} userUID={item.userId}></OtherUserPosts>)
                        }
                    </View>
                }

                {
                    posts.length == 0 && !isLoading &&
                    <View style={styles.noPostsContainer}>
                            <View style={{justifyContent:'center', alignItems: 'center'}}>
                                <PopularLocations userDataIn={popularLocData}></PopularLocations>
                            </View>

                            <View style={{justifyContent: 'center', alignItems:'center'}}>
                                <TextGradient text={"Let's explore the world together! 🌍🚀"} fontSize={18}></TextGradient>
                            </View>

                            <View style={styles.noPostsInnerContainers}>
                                <View style={{padding: 10, borderRadius: 50}}>
                                    <Image 
                                    source={require('wanderwise-frontend/icons/home(1).png')} 
                                    resizeMode='contain'
                                    style={{
                                        width:35,
                                        height:35,
                                        tintColor: '#CE2D4F'
                                    }}
                                    />
                                </View>
                                <Text style={{flex:1, flexWrap: 'wrap', paddingLeft: 15, padding: 5}}>
                                    Our Home Page allows you to explore posts from travelers around the world! 
                                    See updates, photos, and stories from users you follow, and 
                                    stay connected with the global travel community!
                                </Text>
                            </View>
                            <View style={styles.noPostsInnerContainers}>
                                <View style={{padding: 10, borderRadius: 50}}>
                                    <Image 
                                    source={require('wanderwise-frontend/icons/placeholder.png')} 
                                    resizeMode='contain'
                                    style={{
                                        width:35,
                                        height:35,
                                        tintColor: '#CE2D4F'
                                    }}
                                    />
                                </View>
                                <Text style={{flex:1, flexWrap: 'wrap', paddingLeft: 15, padding: 5}}>
                                    Navigating to our Map Page, you are able to discover new destinations and plan your next adventure. 
                                    Search for locations, explore nearby attractions, and get inspired by the travel experiences shared by others.
                                </Text>
                            </View>
                            <View style={styles.noPostsInnerContainers}>
                                <View style={{padding: 10, borderRadius: 50}}>
                                    <Image 
                                    source={require('wanderwise-frontend/icons/add.png')} 
                                    resizeMode='contain'
                                    style={{
                                        width:35,
                                        height:35,
                                        tintColor: '#CE2D4F',
                                    }}
                                    />
                                </View>
                                <Text style={{flex:1, flexWrap: 'wrap', paddingLeft: 15, padding: 5}}>
                                Share your travel experiences with the community via the Post Page. Upload photos, write about your journeys, and connect with fellow travelers. 
                                Your posts will be visible to your followers, fostering a vibrant sharing culture.
                                </Text>
                            </View>
                            <View style={styles.noPostsInnerContainers}>
                                <View style={{padding: 10, borderRadius: 50}}>
                                    <Image 
                                    source={require('wanderwise-frontend/icons/menu.png')} 
                                    resizeMode='contain'
                                    style={{
                                        width:35,
                                        height:35,
                                        tintColor: '#CE2D4F'
                                    }}
                                    />
                                </View>
                                <Text style={{flex:1, flexWrap: 'wrap', paddingLeft: 15, padding: 5}}>
                                    Enhance your travel experience with in-app widgets on our Widget Page. Access tools like calendars, expense trackers, 
                                    and flight trackers to stay organized and make the most of your trips!
                                </Text>
                            </View>
                            <View style={styles.noPostsInnerContainers}>
                                <View style={{padding: 10, borderRadius: 50}}>
                                    <Image 
                                    source={require('wanderwise-frontend/icons/user.png')} 
                                    resizeMode='contain'
                                    style={{
                                        width:35,
                                        height:35,
                                        tintColor: '#CE2D4F'
                                    }}
                                    />
                                </View>
                                <Text style={{flex:1, flexWrap: 'wrap', paddingLeft: 15, padding: 5}}>
                                Personalize your profile, showcase your travel history, and manage your posts on the Profile Page. Edit your profile information, view your followers, 
                                and curate your travel memories in one place!
                                </Text>
                            </View>
                        </View>
                }

            </ScrollView>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    noPostsContainer:{
        width: '90%',
        alignSelf: 'center',
        // borderWidth: 1,
    },
    noPostsInnerContainers: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    container: {
      flex: 1,
      backgroundColor: '#FFF',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 16,
      backgroundColor: '#fff',
      marginTop:  Platform.OS === "ios" ? 0 : 20,
    },
    headerTitle: {
      fontSize: 27,
      color: '#4059AD', 
    //   backgroundColor: 'blue',
    },
    logoutButton: {
      backgroundColor: '#97D8C4',
      padding: 8,
      borderRadius: 50,
    },
    logoutButtonText: {
      fontSize: 15,
      color: 'black',
    },
    content: {
      flex: 1,
      backgroundColor: 'white',
      padding: 20,
    },
  });

export default HomeScreen;