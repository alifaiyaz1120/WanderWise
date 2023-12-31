import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase_config';
import axios from 'axios';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const checkExistingUsername = async (username) => {
    try {
      // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/check_username/${username}/`;
      const url = `https://${LinkName}.pythonanywhere.com/check_username/${username}/`;
      const response = await axios.get(url);
      const existing_username = response.data.username;
      console.log(existing_username);

      if (existing_username === null) {
        return false;
      }
      else {
        return true;
      }
    }
    catch (e) {
      console.log(e);
    }
  };

  const createUserInDjango = async (username, email) => {
    try {
      // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/api/users/`;
      const url = `https://${LinkName}.pythonanywhere.com/api/users/`;
      const newUser = {
        username: username,
        email: email,
      }
      const response = await axios.post(url, newUser);
      console.log('User added to Django');
      console.log(response.data);
    }
    catch (e) {
      console.log(e);
    }
  }

  const handleRegister = async () => {
    if (password !== reenterPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    else if (email == '' || username == '' || password == '' || reenterPassword == '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    else if (await checkExistingUsername(username) === true) {
      Alert.alert('Error', 'Username already exists');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
      const user = userCredential.user;
      const userID = user.uid;
      setDoc(doc(db, "User Profiles", userID), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        followers: [],
        followings: [],
        favLocations:[]
      }).catch((error) => {
        console.log(error);
      })

      const usernameDocRef = doc(db, "Usernames", "All Users");
      const usernameDocSnapshot = await getDoc(usernameDocRef);
      const existingUsernameObj = usernameDocSnapshot.data().userNameToId || {};

      const usernameUpperCase = username.toLocaleUpperCase()
      console.log(usernameUpperCase)
      existingUsernameObj[usernameUpperCase] = userID
      try{
        await setDoc(usernameDocRef, {
          userNameToId: existingUsernameObj
        })
      }catch(e){
        consolel.log("userNameToId not updated: ", e)
      }

      await createUserInDjango(username, email);

      console.log('User: ' + user + ' created successfully');
      navigation.navigate('Login');
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('Error: ' + errorMessage);
      Alert.alert('Error creating account!');
    })
  }

  return (
    <ImageBackground
      source={require('wanderwise-frontend/images/travel5.jpg')}
      style={styles.backgroundImage}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Create an Account</Text>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          style={styles.input}
        />
        <TextInput
          placeholder="Re-enter Password"
          value={reenterPassword}
          onChangeText={setReenterPassword}
          secureTextEntry={true}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
  registerButton: {
    backgroundColor: '#50c878',
    borderRadius: 8,
    width: '100%',
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
