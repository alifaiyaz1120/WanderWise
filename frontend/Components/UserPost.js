import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, Button } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
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
  deleteDoc
} from 'firebase/firestore';
import { storage, db, auth } from '../firebase_config';
import { FontAwesome5 } from '@expo/vector-icons';



const UserPost = ({ navigation, userDataIn, refreshProfile }) => {
  const [profileImage, setProfileImage] = useState('');
  const [userName, setUserName] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0); 
  const [newComment, setNewComment] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [liked, setLiked] = useState(false); 
  const [showConfirmation, setShowConfirmation] = useState(false);

  console.log(userDataIn);
  const currentUserID = auth.currentUser.uid;
  const userUploadsCollectionRef = collection(db, "userUploads");
  const userDocumentRef = doc(userUploadsCollectionRef, `${currentUserID}`);
  const uploadsSubcollectionRef = collection(userDocumentRef, "Uploads");
  const postDocumentRef = doc(uploadsSubcollectionRef, `${userDataIn.id}`);
  

  const numberOfComments = comments.length;
  navigation = useNavigation();


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
    fetchUserData();
    fetchPosts();
    fetchLikedStatus();
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
        if (likedData.liked.includes(currentUserID))
        {
          const updatedLikedList = likedData.liked.filter(id => id !== currentUserID);
          await updateDoc(postDocumentRef, { liked: updatedLikedList });
          setLiked(false);
          setLikes(likes - 1);
        }
        else {
          const updatedLikedList = (likedData && likedData.liked) || [];
          updatedLikedList.push(currentUserID);
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

      if (likedData.liked && likedData.liked.includes(currentUserID)){
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
      const id = currentUser.uid;
      const userDocumentRef = doc(db, 'userProfilePics', id);

      try {
        const docSnapshot = await getDoc(userDocumentRef);
        if (docSnapshot.exists()) {
          const image = docSnapshot.data();
         // console.log(image)

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
    const currentUser = auth.currentUser;
    const userRefDoc = doc(db, 'User Profiles', currentUser.uid);

    try {
      const userDocSnapshot = await getDoc(userRefDoc);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserName(userData.firstName);
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

  const deleteUserPost = async () => {
    try {
      await deleteDoc(postDocumentRef);
      console.log('Document successfully deleted!');
      refreshProfile()
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
    setShowConfirmation(false);
  }
  const cancelDelete = () => {
    setShowConfirmation(false);
  };
  const confirmDelete = () => {
    setShowConfirmation(true);
  };



  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.userPfpContainer} disabled={true}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.userPfp} />
          ) : (
            <Image source={require('wanderwise-frontend/icons/profile.webp')} style={styles.userPfp} />
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity disabled={true}>
            <Text style={styles.userName}>{userName}</Text>
          </TouchableOpacity>
          {userDataIn.location ? (
            <TouchableOpacity
              style={styles.locationContainer}
              onPress={()=>navigation.navigate('MapScreen', { location: userDataIn.location })}
            >
              <Text style={styles.locationTextBlue}>{userDataIn.location}</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.postTime}>{timeSincePost(userDataIn.Date)}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={confirmDelete}
        >
          <Image source={require('wanderwise-frontend/icons/x.png')} style={{ height: 12, width: 12 }} />
        </TouchableOpacity>

        <Modal visible={showConfirmation} transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{ backgroundColor: 'white', 
              padding: 20, borderRadius: 10, elevation: 5, borderColor:'#ddd', 
              borderWidth:1, alignItems:'center', width:'85%', elevation: 5,
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,}}>
              <Text style={{textAlign:'center'}}>Are you sure you want to delete this post?</Text>
              <TouchableOpacity onPress={deleteUserPost} style={{backgroundColor:'#D11A2A', padding:5, borderRadius:5, marginTop:10, width: '80%'}}>
                <Text style={{textAlign:'center', color:'black'}}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity title="Cancel" onPress={cancelDelete} style={{backgroundColor:'#ddd', padding:5, borderRadius:5, marginTop:10, width: '80%'}}>
                <Text style={{textAlign:'center'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

export default UserPost;

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 8, 
    right: 8, 
    padding: 5, 
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
      
   likeCommentSection: {
     flexDirection: 'row',
     justifyContent: 'space-between',
    //  padding: 10,
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
    postContainer: {
      backgroundColor: '#fff',
      borderRadius: 10,
      margin: 5,
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
    marginTop: 0, // comment this out 
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

});