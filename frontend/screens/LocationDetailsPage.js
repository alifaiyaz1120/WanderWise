import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from '../firebase_config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

const GOOGLE_PLACES_API_KEY = '...';

const LocationDetailsPage = ({ route }) => {
  const { location } = route.params;
  const navigation = useNavigation();
  const [photos, setPhotos] = useState([]);
  const [details, setDetails] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLocationOpen, setIsLocationOpen] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const scrollViewRef = useRef();
  

  const scrollDown = () => {
    const scrollPosition = 800; 
    scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
  };
  const goBackToSavedSearch = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (location) {
      console.log(location)
      fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${location.place_id}&key=${GOOGLE_PLACES_API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.result && data.result.photos) {
            setPhotos(data.result.photos);
          }

          if (data.result) {
            setDetails({
              name: data.result.name,
              address: data.result.formatted_address,
              openingHours: data.result.opening_hours,
              phoneNumber: data.result.formatted_phone_number,
              weekdayText: data.result.opening_hours?.weekday_text,
              reviews: data.result.reviews,
              rating: data.result.rating,
              website: data.result.website,
              types: data.result.types
            });
          }

          checkFavorited(data.result.name);

          if (data.result && data.result.opening_hours) {
            const now = new Date();
            const currentDay = now.getDay();
            const currentTime = now.getHours() * 100 + now.getMinutes();
            const todayHours = data.result.opening_hours.weekday_text[currentDay];

            if (todayHours.includes('Closed')) {
              setIsLocationOpen(false);
            } else {
              const match = todayHours.match(/(\d+:\d+ [APM]+) – (\d+:\d+ [APM]+)/);
              if (match) {
                const startTime = parseTime(match[1]);
                const endTime = parseTime(match[2]);

                if (startTime <= currentTime && currentTime <= endTime) {
                  setIsLocationOpen(true);
                } else {
                  setIsLocationOpen(false);
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching location details:', error);
        });
    }
  }, [location]);

  const checkFavorited = async (locationName) => {
    const currentUserID = auth.currentUser.uid;
    const userRef = doc(db, 'User Profiles', currentUserID);
    try {
      const userDoc = await getDoc(userRef);
      let favoritedLocations = [];

      if (userDoc.exists()) {
        const userData = userDoc.data();
        favoritedLocations = userData.favoritedLocations || [];
      } 

      const favoriteExists = favoritedLocations.some(obj => obj.name === locationName);
      if (favoriteExists) {
        setIsFavorited(true);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  const parseTime = (timeStr) => {
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0]);
    const minute = parseInt(parts[1].split(' ')[0]);
    const ampm = parts[1].split(' ')[1];

    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    }

    return hour * 100 + minute;
  };

  const renderRatingStars = (rating) => {
    const filledStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < filledStars; i++) {
      stars.push(<FontAwesome5 key={i} name="star" size={16} solid color="#FFD700" />);
    }

    if (halfStar) {
      stars.push(<FontAwesome5 key="half" name="star-half" size={16} solid color="#FFD700" /> );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesome5 key={i + filledStars} name="star" size={16} solid color="#D3D3D3" /> );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
        <Text style={{ marginLeft: 8, fontSize: 16 }}>{rating}</Text>
      </View>
    );
  };

  const CustomMapMarkerIcon = () => (
    <View>
      <FontAwesome5 name="map-marker" size={25} color="#8C9EA6" style={{ position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: 10,
            height: 10,
            borderRadius: 5,
            top: 7,
            left: 7,
          }}
        />
      </FontAwesome5>
    </View>
  );

  const goToPreviousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const favoriteLocation =  async () => {
    const currentUserID = auth.currentUser.uid;
    const userRef = doc(db, 'User Profiles', currentUserID);

    if (isFavorited) {
      Alert.alert('Location already favorited!');
    }
    else {
      try {
        const userDoc = await getDoc(userRef);
        let favoritedLocations = [];
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          favoritedLocations = userData.favoritedLocations || [];
        } 
  
        const locationInfo = {
          name: location.name,
          place_id: location.place_id,
          image: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
          address: location.vicinity,
        }
  
        favoritedLocations.push(locationInfo);
  
        await updateDoc(userRef, {
          favoritedLocations: favoritedLocations,
        });
  
        setIsFavorited(true);
  
        Alert.alert('Location Favorited!');
      } catch (error) {
        console.log(error);
      }
    }
    console.log('favorite button pressed');
  }

  const goToNextImage = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const renderWeekdayHours = () => {
    if (details.weekdayText && details.weekdayText.length > 0) {
      return (
        <View style={styles.infoRow}>
        <FontAwesome5 name="clock" size={20} color="#428288" style={{ marginLeft: 0 }} />
          <View style={{ marginLeft: 1}}>
            {details.weekdayText.map((hours, index) => (
              <Text key={index} style={styles.infoText}>{hours}</Text>
            ))}
          </View>
        </View>
      );
    }
  
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} ref={scrollViewRef}>
        {photos.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[currentIndex].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
              }}
              style={styles.image}
            />
        
       <View style={styles.statusIndicator}>
       {
           location.opening_hours?.open_now ? (
                 <TouchableOpacity style={{backgroundColor:'green',borderRadius:40, marginTop: 5, marginBottom: 5}} activeOpacity={1}>
                    <Text style={{ color: 'white', padding: 5, borderRadius:50}}>Open</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={{backgroundColor:'red',borderRadius:40, marginTop: 5, marginBottom: 5}} activeOpacity={1}>
                  <Text style={{ color: 'white', padding: 5, borderRadius:50}}>Closed</Text>
                </TouchableOpacity>
                )
              }
          </View>
            <TouchableOpacity onPress={goBackToSavedSearch} style={styles.iconButtonLeft}>
              <FontAwesome5 name="chevron-left" size={24} color="#06B2BE" />
            </TouchableOpacity>
            <TouchableOpacity onPress={favoriteLocation} style={styles.iconButtonRight}>
              {isFavorited ? (
                <FontAwesome5 name="check" size={24} color="#fff" />
              ) : (
                <FontAwesome5 name="heartbeat" size={24} color="#fff" /> 
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.button} onPress={goToPreviousImage}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <View style={styles.pageCounterContainer}>
            <Text style={styles.pageCounterText}>{currentIndex + 1}</Text>
            <Text style={styles.pageCounterText}>/</Text>
            <Text style={styles.pageCounterText}>{photos.length}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={goToNextImage}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationInfoContainer}>
          <Text style={styles.locationName}>{details.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            {renderRatingStars(details.rating)}
          </View>
          {details.types && details.types.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {details.types.map((type, index) => {  // Add the "key" prop here
                    words = type.split('_');
                    words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    return (
                        <TouchableOpacity key={index} style={{ marginRight: 5, marginTop: 5, backgroundColor: 'lightgreen', borderRadius: 40 }} activeOpacity={1}>
                        <Text style={{ padding: 5, fontSize: 11 }}>{words}</Text>
                        </TouchableOpacity>
                    )
                    })}
                </View>
                )} 
          <View style={styles.infoRow}>
            <FontAwesome5 name="map-pin" size={20} color="#428288" />
            <Text style={styles.infoText}>{details.address}</Text>
          </View>
          {details.phoneNumber && (
              <View style={styles.infoRow}>
                <FontAwesome5 name="phone" size={20} color="#428288" />
                <Text style={styles.infoText}>{details.phoneNumber}</Text>
              </View>
            )}


          {details.website && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="globe" size={20} color="#428288" />
              <Text style={styles.infoText}>{details.website}</Text>
            </View>
          )}
          {details.weekdayText && details.weekdayText.length > 0 && (
           
             renderWeekdayHours()
            
          )}
          
          <TouchableOpacity style={styles.scrollDownIconContainer} onPress={scrollDown}>
          <FontAwesome5 name="chevron-down" size={24} color="#06B2BE" />
        </TouchableOpacity>  
          {details.reviews && details.reviews.length > 0 && (
            <View style={styles.reviewsContainer}>
                <Text style={styles.reviewsTitle}>Reviews:</Text>
                {details.reviews.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author_name}:</Text>
                    <Text style={styles.reviewRating}>
                        {renderRatingStars(review.rating)}
                    </Text>
                    </View>
                    <Text style={styles.reviewText}>{review.text}</Text>
                    <Text style={styles.reviewTime}>{review.relative_time_description}</Text>
                </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollDownIconContainer: {
    alignSelf: 'center',
    marginTop: 10, 
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    right: 2,
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 1,
  },
    scrollDownButtonContainer: {
      position: 'relative',
      alignItems: 'center',
      marginTop: -20,
      right: -130, 
    },
    scrollDownButton: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
  
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    padding: 22,
  },

  imageContainer: {
    marginTop: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  iconButtonLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  iconButtonRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#06B2BE',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pageCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageCounterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationInfoContainer: {
    flex: 1,
    padding: 10,
  },
  locationName: {
    color: '#428288',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    fontSize: 15,
    marginLeft: 10,
  },
  reviewsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd', 
  },
  reviewsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    left: 5,
    marginBottom: 10,
    color: '#428288',
    borderBottomColor: '#428288',
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  reviewItem: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  
  reviewAuthor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewTime: {
    fontSize: 16,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  openIndicator: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 20,
  },
  openIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closedIndicator: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 20,
  },
  closedIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewsContainer: {
    marginTop: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: 18,
    color: 'gold',
  },
  reviewText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#444',
  },
  reviewTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default LocationDetailsPage;
