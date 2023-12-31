import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  TouchableWithoutFeedback, 
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { Pressable } from "react-native";
import { Keyboard } from "react-native";

import { Linking } from "react-native";

import * as Location from "expo-location";
import axios from "axios";
import { Animated } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const av = new Animated.Value(0);
av.addListener(() => {
  return;
});

Geocoder.init("..."); 
const GOOGLE_PLACES_API_KEY = "..."; 

const LocationDetailsModal = ({ location, closeModal, userPostLocation }) => {
  const navigation = useNavigation();

  const navigateToDetailsPage = () => {
    navigation.navigate("LocationDetails", { location });
    closeModal();
  };
  const openInMaps = () => {
    if (location) {
      const { lat, lng } = location.geometry.location;

      const isAndroid = Platform.OS === "android";
      const isIOS = Platform.OS === "ios";

      if (isAndroid) {
        Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${location.name})`);
      } else if (isIOS) {
        Linking.openURL(
          `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&t=h`
        );
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true} 
      onRequestClose={() => closeModal()}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: "15%",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 10,
            width: "80%",
            maxHeight: "70%",
          }}
        >
          {location.types.length > 0 && (
            <View
              style={{
                paddingTop: location.types.length * 1,
                paddingBottom: location.types.length * 1,
              }}
            >
              <Text
                style={{
                  paddingTop: "5%",
                  paddingBottom: "1%",
                  fontWeight: "bold",
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                {location.name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {location.types.map((type, index) => {
                  words = type.split("_");
                  words = words
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{
                        marginRight: 5,
                        marginTop: 5,
                        backgroundColor: "lightgreen",
                        borderRadius: 40,
                      }}
                      activeOpacity={1}
                    >
                      <Text style={{ padding: 5, fontSize: 11 }}>{words}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <FontAwesome5 name="map-marker-alt" size={16} color="#428288" />
                <Text style={{ marginLeft: 7 }}>{location.vicinity}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <FontAwesome5 name="star" size={16} solid color="#FFD700" />
                <Text style={{ marginLeft: 5 }}>{location.rating}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignContent: "center",
                  marginTop: 5,
                }}
              >
                {location.opening_hours?.open_now ? (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "green",
                      borderRadius: 40,
                      marginTop: 5,
                      marginBottom: 5,
                    }}
                    activeOpacity={1}
                  >
                    <Text
                      style={{ color: "white", padding: 5, borderRadius: 50 }}
                    >
                      Open
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "red",
                      borderRadius: 40,
                      marginTop: 5,
                      marginBottom: 5,
                    }}
                    activeOpacity={1}
                  >
                    <Text
                      style={{ color: "white", padding: 5, borderRadius: 50 }}
                    >
                      Closed
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {location.photos &&
                location.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{
                      uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
                    }}
                    style={styles.modalImage}
                  />
                ))}
              <Button title="Open in Maps" onPress={openInMaps} />
              <Button title="View Details" onPress={navigateToDetailsPage} />
              <Button title="Close" onPress={() => closeModal()} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const MyMap = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [popularLocations, setPopularLocations] = useState([]);
  const [showFood, setShowFood] = useState(true);
  const [showShopping, setShowShopping] = useState(true);
  const [showExploring, setShowExploring] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0.02);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [userPostLocation, setUserPostLocation] = useState(null);
  const [originalRegion, setOriginalRegion] = useState(null);

  const navigation = useNavigation();

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const openLocationDetails = (location) => {
    setSelectedLocation(location);
    setUserPostLocation(location); 
    toggleModal();
  };

  const zoomIn = () => {
    const newZoomLevel = zoomLevel - 0.001;
    setZoomLevel(newZoomLevel);
    updateMapRegion(mapRegion.latitude, mapRegion.longitude, newZoomLevel);
  };

  const zoomOut = () => {
    const newZoomLevel = zoomLevel + 0.001;
    setZoomLevel(newZoomLevel);
    updateMapRegion(mapRegion.latitude, mapRegion.longitude, newZoomLevel);
  };

  const updateMapRegion = (latitude, longitude, delta) => {
    if (Platform.OS === "ios") {
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };

      if (!originalRegion) {
        setOriginalRegion(newRegion);
      }

      setMapRegion(newRegion);
    } else if (Platform.OS === "android") {
      const fixedZoomLevel = 0.008;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: fixedZoomLevel,
        longitudeDelta: fixedZoomLevel,
      };

      if (!originalRegion) {
        setOriginalRegion(newRegion);
      }

      setMapRegion(newRegion);
    }
  };

  const fetchPopularLocations = async (latitude, longitude) => {
    try {
      const radius = 100000;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`
      );

      if (response.data.results) {
        setPopularLocations(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching popular locations:", error);
      setPopularLocations([]);
    }
  };

  const filterLocations = (locations) => {
    return locations.filter((place) => {
      const placeTypes = place.types || [];

      const isFood =
        showFood &&
        (placeTypes.includes("restaurant") ||
          placeTypes.includes("food") ||
          placeTypes.includes("cafe") ||
          placeTypes.includes("bakery"));

      const isShopping =
        showShopping &&
        (placeTypes.includes("shopping_mall") ||
          placeTypes.includes("clothing_store") ||
          placeTypes.includes("jewelry_store") ||
          placeTypes.includes("shoe_store") ||
          placeTypes.includes("supermarket") ||
          placeTypes.includes("department_store") ||
          placeTypes.includes("drugstore") ||
          placeTypes.includes("electronics_store") ||
          placeTypes.includes("hardware_store") ||
          placeTypes.includes("home_goods_store") ||
          placeTypes.includes("pet_store") ||
          placeTypes.includes("pharmacy") ||
          placeTypes.includes("liquor_store") ||
          placeTypes.includes("supermarket") ||
          placeTypes.includes("store"));

      const isExploring =
        showExploring &&
        (placeTypes.includes("amusement_park") ||
          placeTypes.includes("aquarium") ||
          placeTypes.includes("art_gallery") ||
          placeTypes.includes("museum") ||
          placeTypes.includes("zoo") ||
          placeTypes.includes("tourist_attraction") ||
          placeTypes.includes("point_of_interest") ||
          placeTypes.includes("park") ||
          placeTypes.includes("stadium") ||
          placeTypes.includes("university") ||
          placeTypes.includes("beauty_salon") ||
          placeTypes.includes("church") ||
          placeTypes.includes("hindu_temple") ||
          placeTypes.includes("movie_theater") ||
          placeTypes.includes("night_club") ||
          placeTypes.includes("bowling_alley"));

      return isFood || isShopping || isExploring;
    });
  };
  const searchAirportByIATACode = async (iataCode) => {
    console.log(iataCode);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${iataCode} &key=${GOOGLE_PLACES_API_KEY}`
      );

      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0];
        const { lat, lng } = location.geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error searching airport:", error);
      return null;
    }
  };
  const searchLocationByName = async (locationName) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${locationName}&key=${GOOGLE_PLACES_API_KEY}`
      );

      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0];
        const { lat, lng } = location.geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error searching location:", error);
      return null;
    }
  };
  useEffect(() => {
    console.log(route?.params?.location);

    const searchUserPostLocation = async () => {
      if (route?.params?.location) {
        const postLocation = route.params.location;
        setSearchQuery(postLocation);
        const locationCoordinates = await searchLocationByName(postLocation);

        if (locationCoordinates) {
          const { latitude, longitude } = locationCoordinates;
          updateMapRegion(latitude, longitude);
          fetchPopularLocations(latitude, longitude);
          setError(null);
          setLocation(null);
          setUserPostLocation({
            latitude: latitude,
            longitude: longitude,
          });
        } else {
          setError("Location not found");
        }
      }
    };
    const searchFlightAirport = async () => {
      if (route?.params?.flightData) {
        const iataCode = route.params.flightData;
        setSearchQuery(iataCode);
        const airportCoordinates = await searchAirportByIATACode(iataCode);

        if (airportCoordinates) {
          const { latitude, longitude } = airportCoordinates;
          updateMapRegion(latitude, longitude);
          fetchPopularLocations(latitude, longitude);
          setError(null);
          setLocation(null); 
        } else {
          setError("Airport not found");
        }
      }
    };
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        setError("Permission denied");
        return;
      }
      try {
        let userLocation = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setLocation(userLocation);
        setMapRegion(initialRegion);
        setError(null);
        fetchPopularLocations(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        );
      } catch (error) {
        console.error("Error getting current location:", error);
        setError("Error getting current location");
      }
    })();
    searchFlightAirport(); 
    searchUserPostLocation(); 
  }, [route]);

  const renderLocationImage = (location) => {
    if (location.photos && location.photos.length > 0) {
      return (
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${location.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
          }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      );
    }
    return null;
  };
  const onRegionChange = (region) => {
    setMapRegion((prevRegion) => ({
      ...prevRegion,
      ...region,
    }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Enter location"
          minLength={2}
          autoFocus={false}
          returnKeyType={"search"}
          listViewDisplayed="auto"
          fetchDetails={true}
          renderDescription={(row) => row.description}
          onPress={(data, details = null) => {
            const { location } = details.geometry;
            updateMapRegion(location.lat, location.lng);
            fetchPopularLocations(location.lat, location.lng);
            setSearchedLocation({
              latitude: location.lat,
              longitude: location.lng,
            });
            Keyboard.dismiss();
            setModalVisible(false);
          }}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: "en",
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            description: styles.description,
            listView: styles.listView,
          }}
        />
      </View>
      <View style={styles.categoryFilters}>
        <Text>Categories:</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, styles.customLabel]}>Food</Text>
          <Switch
            value={showFood}
            onValueChange={() => setShowFood(!showFood)}
            style={styles.switch}
          />
          <Text style={[styles.switchLabel, styles.customLabel]}>Shopping</Text>
          <Switch
            value={showShopping}
            onValueChange={() => setShowShopping(!showShopping)}
            style={styles.switch}
          />
          <Text style={styles.switchLabel}>Exploring</Text>
          <Switch
            value={showExploring}
            onValueChange={() => setShowExploring(!showExploring)}
            style={styles.switch}
          />
        </View>
      </View>
      <View style={styles.mapContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text>{error}</Text>
          </View>
        ) : mapRegion ? (
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={onRegionChange}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title={"Your Location"}
                pinColor={"blue"}
              />
            )}
            {searchedLocation && (
              <Marker
                coordinate={{
                  latitude: searchedLocation.latitude,
                  longitude: searchedLocation.longitude,
                }}
                title={"Searched Location"}
                pinColor={"green"}
              />
            )}
            {filterLocations(popularLocations).map((place, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                pinColor={"red"}
                onPress={() => openLocationDetails(place)}
              >
                {renderLocationImage(place)}
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <Text>Loading location...</Text>
          </View>
        )}
      </View>

      <View style={styles.zoomButtons}>
        <Pressable style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </Pressable>
        <Pressable style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomButtonText}>-</Text>
        </Pressable>
      </View>

      {selectedLocation && (
        <LocationDetailsModal
          location={selectedLocation}
          closeModal={() => setSelectedLocation(null)}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    backgroundColor: "#f2f2f2",
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
  categoryFilters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "#f2f2f2",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  switch: {
    transform: [{ scaleX: 0.5 }, { scaleY: 0.5 }],
  },
  switchLabel: {
    fontSize: 14,
  },
  customLabel: {
    marginRight: -12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 10,
    borderRadius: 30,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
    padding: 20,
  },
  zoomButtons: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  zoomButton: {
    backgroundColor: "#428288",
    borderRadius: 20,
    margin: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollView: {
    backgroundColor: "white",
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // padding: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  locationModal: {
    flexDirection: "row",
    backgroundColor: "yellow",
  },
  modalContainer: {
    marginTop: 100,
    width: 300,
    backgroundColor: "white",
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: "white",
    alignSelf: "center",
  },
});

export default MyMap;
