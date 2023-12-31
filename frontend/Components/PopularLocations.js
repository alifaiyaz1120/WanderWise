import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, Button, Dimensions } from 'react-native';
import ProfilePicture from './ProfilePicture';
import { addDoc, collection, onSnapshot, doc, getDocs, updateDoc,  getDoc, setDoc, arrayRemove} from 'firebase/firestore';
import { storage, db, auth } from '../firebase_config';
import { FontAwesome5 } from '@expo/vector-icons';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import TextGradient from './TextGradient';


const PopularLocations = (favLocData) => {
    const currentUserID = auth.currentUser.uid;
    const [favLocations, setFavLocations] = useState(favLocData.userDataIn);
    const [showDeleteConfirm, setDeleteConfirm] = useState(false)
    const [index, setIndex] = useState('')
    navigation = useNavigation();
    const [activeDotIndex, setActiveDotIndex] = useState(0)
    const _carousel = useRef()

    const renderPopLocations = ({item}) => {
        return (<View style={{}}>
                <TouchableOpacity key={index} style={styles.postContainer} onPress={()=>navigation.navigate('MapScreen', { location: item.name })}>
                    <Image source={{ uri: item.image}} style={{height: 120, width:120, borderRadius: 10}}></Image>
                    <View style={{width: '100%', flex: 1, justifyContent: 'center',}}>
                        <Text style={{marginLeft: 10, fontWeight: 'bold', fontSize: 20, paddingBottom: 5, textAlign:'center'}}>{item.name}</Text>
                        <View style={{flexDirection: 'row', alignItems:'center', marginLeft: 10,}}>
                            <Image 
                                source={require('wanderwise-frontend/icons/gold-medal.png')} 
                                resizeMode='contain'
                                style={{
                                    width:18,
                                    height:18,
                                    marginRight: 5
                                }}
                            />
                            <Text style={{fontSize: 13, flex:1, flexWrap: 'wrap'}}>{item.rating}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
        </View>)
    }

  return (
    <View style={{ width: '100%', alignSelf: 'center'}}>
        <View style={{justifyContent: 'center', alignItems:'center'}}>
            <Text style={{fontSize:20, color: 'black', paddingBottom:5}}>Popular Locations ⭐</Text>
        </View>
        <View style={{width:'100%', justifyContent: 'center', alignItems:'center'}}>
            <Carousel
                ref = {_carousel}
                data={favLocations}
                renderItem={renderPopLocations}
                sliderWidth={Dimensions.get('window').width * 0.9}
                itemWidth={Dimensions.get('window').width * 0.8}   
                onSnapToItem={index=>setActiveDotIndex(index)} 
            />
        </View>
        <View>
            <Pagination activeDotIndex={activeDotIndex} dotsLength={5} carouselRef={_carousel}></Pagination>
        </View>
    </View>
  );
};

export default PopularLocations;

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#FFF',
    width: '100%',
    borderColor: '#ddd',
    borderRadius: 30,
    padding: 15,
    margin: 5,
    flexDirection: 'row',
    shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
  },
});