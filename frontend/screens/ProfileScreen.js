import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, FlatList, TextInput, RefreshControl, Modal, Platform} from 'react-native';
import UserPost from '../Components/UserPost';
import {ref, uploadBytesResumable, getDownloadURL, FirebaseStorage} from 'firebase/storage';
//reference bucket, helps us uplaod image - give info abt upload, give url to ref data 
import {addDoc, collection, onSnapshot, doc, getDocs, updateDoc, getDoc} from 'firebase/firestore';
import {storage, db, auth} from '../firebase_config';
import * as ImagePicker from 'expo-image-picker';
import ProfilePicture from '../Components/ProfilePicture';
import FavoriteLocation from '../Components/FavoriteLocation';
import FollowingsListPF from '../Components/FollowingsListPF';

var docs = [];

const fetchPostsFromFirestore = async () => {
    const currentUser = auth.currentUser;
    if (currentUser){
        try{ 
            const id = currentUser.uid;
            const userUploadsCollectionRef = collection(db, "userUploads");
            const userDocumentRef = doc(userUploadsCollectionRef, `${id}`);
            const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");
      
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

const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    return date.toISOString();
  };

const ProfileScreen = ({navigation}) => {
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState('');
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(require('wanderwise-frontend/icons/mockPfp.jpeg'));
    const [posts, setPosts] = useState([]);
    const [showPosts, setShowPosts] = useState(true);
    const currentUser = auth.currentUser;
    const [refreshing, setRefreshing] = useState(false);
    const [favLocations, setFavLocations] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFollowings, setShowFollowings] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showLogoutConfirm, setLogOutConfirm] = useState(false);

    
    useEffect(() => {
        fetchUserData();
        fetchFollowingData();
        fetchData()
        fetchFavLoc();
    }, []);
    
    const fetchUserData = async () => {
        const currentUser = auth.currentUser;
        const userRefDoc = doc(db, 'User Profiles', currentUser.uid);
        
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

    const fetchData = async () => {
        setPosts([])
        try {
            await fetchPostsFromFirestore();
            await sortPosts();
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false); 
        } 
    };

    const fetchPostsFromFirestore = async () => {
        const currentUser = auth.currentUser.uid;
        console.log(currentUser)
        if (currentUser){
            try {

                const id = currentUser;
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

      const sortPosts = async () => {
        setPosts(prevPosts => [...prevPosts].sort((a, b) => new Date(b.ConDate) - new Date(a.ConDate)));
    }

    const handleSaveBio = async () => {
        const currentUser = auth.currentUser;
        // Save the bio to the backend
        if (bio.trim() !== '') {
            const userRef = doc(db, 'User Profiles', currentUser.uid);
            try {
                await updateDoc(userRef, {
                    bio: bio.trim()
                });
                setIsEditingBio(false); 
            } catch (error) {
                console.error('Error updating document:', error);
            }
        } else {
            setIsEditingBio(false); 
        }
    };

    const selectProfileImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
      });

      if (!result.cancelled) {
          setProfileImage({ uri: result.uri });
      }
    };

    const handlePostsClick = () =>{
        setShowPosts(true)
    }

    const handleFavsClick = () =>{
        setShowPosts(false)
    }

    const onRefresh = async () => {
        setRefreshing(true);
        setIsLoading(true);
        await fetchData()
        await  fetchFavLoc();
        await fetchFollowingData();
        setRefreshing(false);
        setIsLoading(false)
      };

    const fetchFavLoc = async () => {
        const currentUserID = auth.currentUser.uid;
        const userRef = doc(db, 'User Profiles', currentUserID);
        try {
            const userDoc = await getDoc(userRef);
            let favoritedLocations = [];
        
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setFavLocations(userData.favoritedLocations)
                console.log(userData.favoritedLocations)
            }
            console.log(favoritedLocations)
            } catch (error) {
            console.log(error);
            }
    }

    const fetchFollowingData = async () =>{
        const userProfilesCollectionRef = collection(db, "User Profiles");
        const userDocumentRef = doc(userProfilesCollectionRef, `${auth.currentUser.uid}`);
        userSnapshot = await getDoc(userDocumentRef);
        userFollowers = userSnapshot.data().followers
        userFollowings = userSnapshot.data().followings

        setFollowers(userFollowers)
        setFollowings(userFollowings)
    }

      const openFollowingList = () => {
        setShowFollowings(true);
      };
      const closeFollowingList = () => {
        setShowFollowings(false);
      };

      const openFollowerList = () => {
        setShowFollowers(true);
      };
      const closeFollowerList = () => {
        setShowFollowers(false);
      };

      const ExecLogoutUser = async () => {
        auth.signOut().then(() => {
            console.log('User successfully signed out!');
        })
        .catch((error) => {
            console.log('Error signing out user:', error);
        });
        navigation.navigate('Login'); 
        setLogOutConfirm(false);
      }
      const cancelLogout = () => {
        setLogOutConfirm(false);
      };
      const confirmLogout = () => {
        setLogOutConfirm(true);
      };

    return (
      <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
          <ScrollView style={styles.container} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false} refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
            <TouchableOpacity style={styles.logoutButton} onPress={() => confirmLogout()}>
                <Image source={require('wanderwise-frontend/icons/logout.png')} style={{height:25, width:25,}}></Image>
            </TouchableOpacity>

            <Modal visible={showLogoutConfirm} transparent>
                <View style={{justifyContent: 'center', alignItems: 'center', marginTop:'50%'}}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', 
                    padding: 20, borderRadius: 10, elevation: 5, borderColor:'#ddd', 
                    borderWidth:1, width:'85%', elevation: 5,
                    shadowColor: '#000', 
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,}}>
                        <Text style={{textAlign:'center'}}>Are you sure you want to logout?</Text>
                        <TouchableOpacity onPress={() => ExecLogoutUser()} style={{backgroundColor:'#CE2D4F', padding:5, borderRadius:5, marginTop:10, width: '80%'}}>
                            <Text style={{textAlign:'center', color:'white'}}>Logout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity title="Cancel" onPress={() => cancelLogout()} style={{backgroundColor:'#ddd', padding:5, borderRadius:5, marginTop:10, width: '80%'}}>
                            <Text style={{textAlign:'center'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </Modal>

            <ProfilePicture></ProfilePicture>
            <Text style={styles.userName}>{userName}</Text>
            
                {isEditingBio ? (
                    <TextInput
                        style={styles.bioTextInput}
                        multiline
                        placeholder="Edit your bio..."
                        value={bio}
                        onChangeText={(text) => setBio(text)}
                    />
                ) : (
                    <Text style={styles.aboutUser}>{bio}</Text>
                )}

              {isEditingBio ? (
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveBio}>
                      <Text style={{color:'white'}}>Save</Text>
                  </TouchableOpacity>
              ) : (
                  <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingBio(true)}>
                      <Text style={{color: 'white'}}>Edit Bio</Text>
                  </TouchableOpacity>
              )}

              <View style={styles.userInfoWrapper}>
                <View style={styles.userInfoItem}>
                    <Text style={styles.userInfoTitle}>{posts.length}</Text>
                    <Text style={styles.userInfoSubTitle}>Posts</Text>
                </View>
                <TouchableOpacity onPress={() => openFollowerList()}>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>{followers.length}</Text>
                        <Text style={styles.userInfoSubTitle}>Followers</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openFollowingList()}>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>{followings.length}</Text>
                        <Text style={styles.userInfoSubTitle}>Following</Text>
                    </View>
                </TouchableOpacity>
                
                <Modal visible={showFollowings || showFollowers} transparent>
                    <View style={{justifyContent: 'center', alignItems: 'center', marginTop:'20%'}}>
                        <View style={{ backgroundColor: 'white', 
                        padding: 20, borderRadius: 10, elevation: 5, borderColor:'#ddd', 
                        borderWidth:1, width:'85%', height: '70%', elevation: 5, 
                        shadowColor: '#000', 
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,}}>
                        
                        {
                            showFollowings ?
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10}}>
                                    <Text style={{fontWeight:'bold', fontSize: 18, paddingBottom: 0}}>Followings</Text>
                                    <TouchableOpacity style={{paddingHorizontal: 10, }} onPress={() => closeFollowingList()}>
                                        <Image source={require('wanderwise-frontend/icons/x.png')} style={{height:18, width:18,}}></Image>
                                    </TouchableOpacity>
                                </View>
                            :
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10}}>
                                    <Text style={{fontWeight:'bold', fontSize: 18, paddingBottom: 0}}>Followers</Text>
                                    <TouchableOpacity style={{paddingHorizontal: 10, }} onPress={() => closeFollowerList()}>
                                        <Image source={require('wanderwise-frontend/icons/x.png')} style={{height:18, width:18,}}></Image>
                                    </TouchableOpacity>
                                </View>
                        }
                        
                        <ScrollView>
                            {
                                showFollowings ?
                                    followings.map((item, index)=><FollowingsListPF setShowFollowings={setShowFollowings} showFollowings={showFollowings} key={index} userDataIn={item}></FollowingsListPF>)
                                :
                                    followers.map((item, index)=><FollowingsListPF setShowFollowers={setShowFollowers} showFollowers={showFollowers} key={index} userDataIn={item}></FollowingsListPF>)
                            }
                        </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>


                <View style={{ width: '90%', flexDirection:'row', justifyContent:'space-around'}}>

                    <TouchableOpacity style={{}} onPress={handlePostsClick}>
                        <Image source={require('wanderwise-frontend/icons/insert-picture-icon.png')} style={{width:25, height: 25}} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{}} onPress={handleFavsClick}>
                        <Image source={require('wanderwise-frontend/icons/favorite.png')} style={{width:25, height: 25,}} />
                    </TouchableOpacity>
                    
                </View>

                    {
                        showPosts ?
                        <View style={{ width: '95%', flexDirection:'row', justifyContent:'center'}}>
                            <View style={{borderBottomColor:'black', borderBottomWidth: 1, width:'50%', alignSelf:'center', marginTop: 15}}></View>
                            <View style={{borderBottomColor:'#ddd', borderBottomWidth: 1, width:'50%', alignSelf:'center', marginTop: 15}}></View>
                        </View>
                        :
                        <View style={{ width: '95%', flexDirection:'row', justifyContent:'center'}}>
                            <View style={{borderBottomColor:'#ddd', borderBottomWidth: 1, width:'50%', alignSelf:'center', marginTop: 15}}></View>
                            <View style={{borderBottomColor:'black', borderBottomWidth: 1, width:'50%', alignSelf:'center', marginTop: 15}}></View>
                        </View>
                    }

                {
                    showPosts ? 

                        posts.length!=0?
                        <View style={styles.userInfoWrapper}>
                            <View style={{width:"100%"}}>
                                {
                                    posts.map((item, index)=><UserPost key={index} userDataIn={item} refreshProfile={onRefresh}></UserPost>)
                                }
                            </View>
                        </View>
                        :
                        <Text style={{marginTop:15}}>Make a new posts to share!</Text>

                    :

                    <View style={styles.userInfoWrapper}>
                        <FavoriteLocation userDataIn={favLocations} refreshFavs={onRefresh}></FavoriteLocation>
                    </View>
                }
                
          </ScrollView>
      </SafeAreaView>
        
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container:{
      flex: 1, 
      // justifyContent: 'center', 
      // alignItems: 'center',
      backgroundColor: '#fff',
      padding: 20
  },
  logoutButton: {
    justifyContent: 'center', 
    alignSelf: 'center', 
    alignItems: 'center', 
    alignSelf: 'flex-end',
    backgroundColor: '#CE2D4F', 
    height: 45, 
    width: 45, 
    borderRadius: 50,
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
    }),
    marginTop: Platform.OS === "ios" ? 0 : 20,
    marginRight: Platform.OS === "ios" ? 0 : 5,
  },
  userImage:{
      height: 150,
      width: 150, 
      borderRadius: 75
  },
  userName:{
      fontSize: 18, 
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 10,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bioTextInput: {
      height: 100,
      width: '100%',
      backgroundColor: '#eee',
      padding: 15,
      marginVertical: 10,
      textAlignVertical: 'top',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  saveButton: {
      marginTop: 10,
      backgroundColor: 'black',
      paddingVertical: 8,
      paddingHorizontal: 30,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  aboutUser: {
      fontSize: 14, 
      fontWeight: '600',
      color: '#666',
      textAlign: 'center',
    //   marginBottom: 10,
    //   backgroundColor: 'red',
  },
  userBtnWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 10,
    },
    userBtn: {
      borderColor: '#2e64e5',
      borderWidth: 2,
      borderRadius: 3,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 5,
    },
    userBtnTxt: {
      color: '#2e64e5',
    },
    userImage:{
        height: 150,
        width: 150, 
        borderRadius: 75,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    userName:{
        fontSize: 18, 
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center'
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
})
