import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, Button } from 'react-native';
import ProfilePicture from './ProfilePicture';
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  getDocs,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { storage, db, auth } from '../firebase_config';
import { FontAwesome5 } from '@expo/vector-icons';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';


const OtherUserPosts = ({ navigation, userDataIn, userUID }) => {
  const [profileImage, setProfileImage] = useState(''); 
  const [userName, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0); 
  const [newComment, setNewComment] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [liked, setLiked] = useState(false); 
  navigation = useNavigation();
  const route = useRoute();

  const currentUserID = userUID;
  const userUploadsCollectionRef = collection(db, "userUploads");
  const userDocumentRef = doc(userUploadsCollectionRef, `${userUID}`);
  const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");
  const postDocumentRef = doc(uploadsSubcollectionRef, `${userDataIn.id}`);

  const numberOfComments = comments.length;

  const timeSincePost = (data) => {
    const givenDate = new Date(data.seconds * 1000 + data.nanoseconds / 1000000);
    const currentDate = new Date();
    const timeDifference = currentDate - givenDate;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
    if (days) {
      return `${days} days ago`;
    }
    if (hours) {
      return `${hours} hours ago`;
    }
    if (minutes) {
      return `${minutes} minutes ago`;
    }
    return `${seconds} seconds ago`;
  };

  useEffect(() => {
    const initPage = async () =>{
      await fetchUserData();
      await fetchPosts();
      await fetchLikedStatus();
    }
    initPage()
  }, []);

  const fetchPosts = async () => {
    const postsData = await fetchPostsFromFirestore();
    setProfileImage(postsData);
  };
  const openCommentsModal = () => {
    setShowCommentsModal(true);
  };

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
  };
  const toggleLike = async () => 
  {
    try {
      const likedSnapshot = await getDoc(postDocumentRef);
      const likedData = likedSnapshot.data();

      if (likedData && likedData.liked)
      {
        if (likedData.liked.includes(auth.currentUser.uid))
        {
          const updatedLikedList = likedData.liked.filter(id => id !== auth.currentUser.uid);
          await updateDoc(postDocumentRef, { liked: updatedLikedList });
          setLiked(false);
          setLikes(likes - 1);
        }
        else {
          const updatedLikedList = (likedData && likedData.liked) || [];
          updatedLikedList.push(auth.currentUser.uid);
          await updateDoc(postDocumentRef, { liked: updatedLikedList });
          setLiked(true);
          setLikes(likes + 1);
        }
      }
      else {
        console.log('Liked data not found');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const fetchLikedStatus = async () => {
    try {
      likedSnapshot = await getDoc(postDocumentRef);
      likedData = likedSnapshot.data();
      setLikes(likedData.liked.length)

      if (likedData.liked && likedData.liked.includes(auth.currentUser.uid)){
        setLiked(true);
      }
      else {
        setLiked(false);
      }
    } catch (error) {
      console.error('Error fetching liked status:', error);
    }
  }

  const fetchPostsFromFirestore = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const id = userUID;
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
      console.log('NO USER LOGGED IN');
      return null;
    }
  };

  const fetchUserData = async () => {
    const currentUser = userUID;
    const userRefDoc = doc(db, 'User Profiles', currentUser);

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
  };
  const addComment = () => {
    if (newComment.trim() !== '') {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const username = currentUser.userName ; 
          setComments([...comments, { user: userName, text: newComment }]);
          setNewComment('');
        } else {
          console.log('No user logged in');
        }
      }
  };

  const handleUserProfileClick = async () => { 

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

    const postsData = await fetchPostsFromFirestore();
    postsData.reverse()
    if (userUID && route.name != 'RenderOtherUserProfile') { 
      navigation.navigate("RenderOtherUserProfile", {
          userID: userUID,
          userName: userName,
          bio: bio,
          postArr: postsData,
      });
    } else {
        console.log("Not navigated to RenderOtherUserProfile")
    }
  }

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.userPfpContainer} onPress={handleUserProfileClick}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.userPfp} />
          ) : (
            <Image source={require('wanderwise-frontend/icons/profile.webp')} style={styles.userPfp} />
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleUserProfileClick}>
            <Text style={styles.userName}>{userName.split(' ')[0]}</Text>
          </TouchableOpacity>
          {userDataIn.location ? (
            <TouchableOpacity
              style={styles.locationContainer}
              onPress={()=>navigation.navigate('MapScreen', { location: `${userDataIn.location}`})}
            >
              <Text style={styles.locationTextBlue}>{userDataIn.location}</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.postTime}>{timeSincePost(userDataIn.Date)}</Text>
        </View>
      </View>
      <Text style={styles.postText}>{userDataIn.imageDescriotion}</Text>
      {userDataIn.postImg !== 'none' ? (
        <Image source={{ uri: userDataIn.URL }} style={styles.postImage} />
      ) : null}

        <TouchableOpacity style={styles.likeCommentButton} onPress={toggleLike}>
          <FontAwesome5 name='heart' size={24} color={liked ? 'red' : '#FFF'} solid={true} />
          <Text style={styles.likeCommentText}> {likes} </Text>
        </TouchableOpacity>
    </View>
  );
};

export default OtherUserPosts;

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 8,
    overflow: 'ddd',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
   // borderBottomWidth: 1, // another option
   // borderBottomColor: '#ddd', // another option
   //backgroundColor: '#f5f5f5', // another option
   //borderTopLeftRadius: 10, // another option
   //borderTopRightRadius: 10,//  another option
  },
  userPfpContainer: {
    padding: 5,
  },
  userPfp: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
    color: '#777',
  },
  postText: {
    fontSize: 14,
    margin: 10,
   // marginHorizontal: 10, // another option
    //marginBottom: 12, // another option
    marginTop: 0,  
    color: '#555',
    lineHeight: 18, 
    textAlign: 'justify',
  },
  
  postImage: {
    width: '100%',
    minHeight: 250,
    resizeMode: 'cover',
    resizeMode: 'cover',
    borderBottomLeftRadius: 10, 
    borderBottomRightRadius: 10, 
    
  },
  likeCommentButton: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 5,
    left: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
    padding: 3,
  },
  likeCommentText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#333',
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  addCommentInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  addCommentInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
  },
  addCommentButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 8,
  },
  commentSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
    marginLeft: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  locationTextBlue: {
    fontSize: 12,
    color: '#007BFF',
  },
});
