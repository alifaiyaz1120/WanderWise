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
import { TouchableWithoutFeedback, Keyboard } from 'react-native';


const av = new Animated.Value(0);
av.addListener(() => {return});



const SearchUsers = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userUID, setUserUID] = useState('');
  const [bio, setBio] = useState('');
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(require('wanderwise-frontend/icons/mockPfp.jpeg'));

  const [posts, setPosts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [userNotFound, setUserNotFound] = useState(false);
  const navigation = useNavigation();
  const [showView, setView] = useState(false);
  const [objOfUsers, setObjofUsers] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleOutsideClick = () => {
    setShowDropdown(false);
  };

  useEffect(() => {
    const fetchUserDataAndPosts = async () => {
      await fetchUserData();
      await fetchPosts();
    };
    fetchUsernameToIdMap();

    if (userUID) {
      fetchUserDataAndPosts();
    }
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setShowDropdown(false);
      });
  
      return () => {
        keyboardDidHideListener.remove();
      };
  }, [userUID]);


  const fetchUsernameToIdMap = async () => {
    const usernameDocRef = doc(db, 'Usernames', 'All Users');
    const usernameDocSnapshot = await getDoc(usernameDocRef);
    const existingUsernameObj = usernameDocSnapshot.data().userNameToId || {};
    console.log(existingUsernameObj)

    setObjofUsers(existingUsernameObj);
  };

  const handleUserSearch = async () => {
    setUserNotFound(false);
    setView(false);
    setUserUID(objOfUsers[userEmail.toLocaleUpperCase()]);
    setUserName(''); 
    setBio('');

    const formattedEmail = userEmail.toLocaleUpperCase();

    if (!userEmail) {
    } else if (!objOfUsers[formattedEmail]) {
      setUserNotFound(true);
    } else {
      setUserUID(objOfUsers[formattedEmail]);
      await fetchUserDataAndPosts();
      setView(true);
    }
  };


  const fetchUserDataAndPosts = async () => {
    await fetchUserData();
    await fetchPosts();
  };
  

  const fetchUserData = async () => {
    if (userUID) {
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
  };

  const fetchPosts = async () => {
    const postsData = await fetchPostsFromFirestore();
    postsData.reverse();
    setPosts(postsData);
  };

  const fetchPostsFromFirestore = async () => {
    const currentUser = userUID;
    if (currentUser) {
      try {
        const id = userUID;
        const userUploadsCollectionRef = collection(db, 'userUploads');
        const userDocumentRef = doc(userUploadsCollectionRef, `${id}`);
        const uploadsSubcollectionRef = collection(userDocumentRef, 'Uploads');
        // console.log(currentUser.uid)

        const querySnapshot = await getDocs(uploadsSubcollectionRef);
        const postsData = [];

        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            imageData = doc.data();
            imageID = doc.id;
            postsData.push({ id: imageID, ...imageData });
          } else {
            console.log('No such document!');
          }
        });
        return postsData;
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('NO USER LOGGED IN');
      return [];
    }
  };

  const renderUserProfile = () => {
        if(userUID){
          navigation.navigate("RenderOtherUserProfile", {userID: userUID, userName: userName, bio: bio, postArr: posts});
      }
      else{
          return(
              <View>
                  {userNotFound ? <Text>User not found x_x</Text>
                      : <Text>Search for Users...</Text>
                  }
              </View>
          )
      }
  }
  

  const handleViewUserProfile = async () => {
    if (userUID) {
      if (userUID) {
        navigation.navigate('RenderOtherUserProfile', {
          userID: userUID,
          userName: userName,
          bio: bio,
          postArr: posts,
        });
        setView(false);
        setShowDropdown(false);
      } else {
        console.log('NOT LOADED');
      }
    } else {
      // Handle the case when the user is not found or not set
      console.log('User not found');
    }
  };

  const handleInputChange = (text) => {
    if(text.length == 0){
      setShowDropdown(false);
      setUserEmail(text);
    }
    else{
      setUserEmail(text);
      filterUsers(text);
    }
  };

  const filterUsers = (text) => {
    const formattedText = text.toLowerCase();  
  
    const filtered = Object.keys(objOfUsers)
      .filter((userEmail) => {
        const userUID = objOfUsers[userEmail];
        const lowerCaseUsername = userEmail.toLowerCase(); 
        return lowerCaseUsername.startsWith(formattedText) && userUID !== auth.currentUser.uid;
      });
  
    setFilteredUsers(filtered);
    setShowDropdown(true);
  };
  
  
  
  const handleDropdownItemPress = async (item) => {
    const formattedItem = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    setUserEmail(formattedItem);
    setShowDropdown(false);
    
    setUserNotFound(false);
    
    const selectedUserUID = objOfUsers[formattedItem];
    if (selectedUserUID) {
      setUserUID(selectedUserUID);
  
      await fetchUserDataAndPosts();
      handleUserSearch();
    } else {
      console.log("Selected user not found in objOfUsers");
    }
  };
  const renderDropdown = () => {
    if (showDropdown) {
      return (
        <View style={styles.dropdownContainer}>
          {filteredUsers.map((userName, index) => (
            <TouchableOpacity key={index} onPress={() => handleDropdownItemPress(userName)}>
              <Text style={styles.dropdownItem}>{userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return null;
  };
  

  return (

    <SafeAreaView key={refreshKey} style={{ backgroundColor: 'transparent', width: '90%' }}>
      <View style={styles.container} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextInput
            placeholder="Search users..."
            style={styles.input}
            onChangeText={handleInputChange}
            value={userEmail}
            onFocus={() => setShowDropdown(true)}
            
          />

          {!showView && (
            
            <TouchableOpacity style={{ borderRadius: 30, alignSelf: 'center', marginBottom: 5 }} onPress={handleUserSearch}>
              <Image source={require('wanderwise-frontend/icons/search.png')} style={{ height: 22, width: 22 }} />
            </TouchableOpacity>
          )}

          {showView && (
              <TouchableOpacity style={{ borderRadius: 30, alignSelf: 'center', marginBottom: 5 }} onPress={handleViewUserProfile}>
              <Image source={require('wanderwise-frontend/icons/fast-forward.png')} style={{ height: 22, width: 22 }} />
            </TouchableOpacity>
          )}
        </View>

        {renderDropdown()}

        {userNotFound && <Text style={{ textAlign: 'center', color: '#333' }}>User not found.</Text>}
      </View>
    </SafeAreaView>

  );
};

export default SearchUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', 
    // alignItems: 'center',
    backgroundColor: 'transparent',
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
    margin: 15,
    padding: 10,
    backgroundColor: '#eee',
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
  dropdownContainer: {
    backgroundColor: '#eee',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf:'center',
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    // backgroundColor:'yellow',
  },
});