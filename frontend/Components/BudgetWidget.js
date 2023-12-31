import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, Button, Platform, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import EventModal from './EventModal';
import EventComponent from './EventComponent';
import { auth } from '../firebase_config';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';


function BudgetWidget() {
    const [hasBudget, setHasBudget] = useState(false);
    const [maxBudgetString, setMaxBudgetString] = useState('');
    const [maxBudget, setMaxBudget] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]); 
    const [isBudgetInputVisible, setIsBudgetInputVisible] = useState(false);
    const [isBudgetBarVisible, setIsBudgetBarVisible] = useState(false);


    const navigation = useNavigation();
    const handleClick = () => {
        navigation.navigate('BudgetTracker');
      };
   
    const calculateLeftToSpend = () => {
        return maxBudget - calculateTotalExpenses();
      };
    
    const calculateProgress = () => {
        const totalExpenses = calculateTotalExpenses();
        const percentage = (totalExpenses / maxBudget) * 100;
        return percentage > 100 ? 100 : percentage; 
    };
    const checkHasBudget = async (firebaseUserID) => {
        try {
            // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/check_max_budget/${firebaseUserID}/`; 
            const url = `https://${LinkID}.pythonanywhere.com/check_max_budget/${firebaseUserID}/`; 
            const response = await axios.get(url);
            const maxBudget = response.data.max_budget;

            if (maxBudget !== null){
                setHasBudget(true);
                setMaxBudget(maxBudget);
                console.log('User has a max budget:', maxBudget);
            }
            else {
                setHasBudget(false);
                console.log('User does not have a max budget');
            }
        }
        catch (error) {
            console.log('Error checking if user has budget:', error);
        }
    }

    const createOrUpdateMaxBudget = async () => {
        if (isNaN(maxBudgetString) === false) {
            try {
                const updatedMaxBudget = Number(maxBudgetString);
                const url = `https://${LinkID}.pythonanywhere.com/check_max_budget/${auth.currentUser.uid}/`;
                const response = await axios.get(url);
    
                if (response.data.max_budget !== null) {
                    // Update the existing budget for the user
                    const updateURL = `https://${LinkID}.pythonanywhere.com/update_max_budget/${auth.currentUser.uid}/`;
                    const updateResponse = await axios.put(updateURL, { new_max_budget: updatedMaxBudget });
                    setMaxBudget(updatedMaxBudget);
                    console.log('Budget updated:', updateResponse.data);
                } else {
                    // Create a new budget for the user
                    const createURL = `https://${LinkID}.pythonanywhere.com/api/budgets/`;
                    const createData = {
                        firebase_user_id: auth.currentUser.uid,
                        max_budget: updatedMaxBudget,
                    };
                    const createResponse = await axios.post(createURL, createData);
                    setHasBudget(true);
                    setMaxBudget(updatedMaxBudget);
                    console.log('New user, new budget created', createResponse.data);
                }
                setIsBudgetInputVisible(false);
            } catch (error) {
                console.error('Error creating or updating max budget:', error);
            }
        } else {
            console.log('Not a valid number!');
        }
    };

    const addEvent = async (eventData) => {
        try {
            // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/api/events/`
            const url = `https://${LinkID}.pythonanywhere.com/api/events/`;
            const response = await axios.post(url, eventData);
            setEventsList(auth.currentUser.uid);
            console.log('New event added:', response.data);
        }
        catch (error) {
            console.error('Error adding an event:', error);
        }
        setShowModal(false); 
    };

    const setEventsList = async (firebaseUserID) => {
        try {
            // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/get_events/${firebaseUserID}/`;
            const url = `https://${LinkID}.pythonanywhere.com/get_events/${firebaseUserID}/`;
            const response = await axios.get(url);
            setEvents(response.data.events);
        }
        catch (error) {
            console.error('Error fetching current events: ', error);
        }
    }


    const calculateTotalExpenses = () => {
        return events.reduce((total, event) => total + parseFloat(event.event_budget || 0), 0);
      };
    
    
    useEffect(() => {
        checkHasBudget(auth.currentUser.uid);
        setEventsList(auth.currentUser.uid); 
     }, []);


     return (
        <TouchableOpacity  onPress={handleClick}>
            <SafeAreaView style={styles.container}>
                <View style={styles.budgetBox}>
                    {/* Budget Information */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.budgetWidgetTitle}>Expense Tracker</Text>
                    </View>
                    <View style={styles.budgetContainer}>
                        <View style={styles.leftToSpend}>
                            <Text style={styles.leftToSpendText}>Left to Spend:</Text>
                            <Text style={styles.amountText}>${calculateLeftToSpend()}</Text>
                        </View>
                            <View style={styles.currentBudget}>
                                <Text style={styles.currentBudgetText}>Current Budget:</Text>
                                <Text style={styles.amountText}>${maxBudget}</Text>
                                {isBudgetBarVisible && <View style={styles.budgetBar} />}
                            </View>
                    </View>

                    
                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${calculateProgress()}%` }]} />
                    </View>
                </View>

                {showModal && (
                    <EventModal
                        visible={showModal}
                        onClose={() => setShowModal(false)}
                        onSubmit={addEvent}
                    />
                )}
            </SafeAreaView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: '#97D8C4', 
        borderRadius: 5, 
        paddingVertical: 8,
        paddingHorizontal: 12, 
        alignItems: 'center',
        alignSelf: 'center', 
        width: 140, 
        marginTop: 20, 
    },
    addButtonTextContainer: {
       
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#000', 
        fontWeight: 'bold',
        fontSize: 14,
    },
    titleContainer: {
        // marginBottom: 10,
    },
    budgetWidgetTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center'
      },
    budgetBox: {
        backgroundColor: '#ffffff', 
        padding: 15,
        borderRadius: 10,
        marginVertical: -10,
        width: '100%',
        alignSelf: 'center',
        elevation: 8, 
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6,
    },
    
    progressBarContainer: {
        // marginTop: 10,
        height: 20,
        backgroundColor: '#e0e0e0', 
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3498db', 
        borderRadius: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
  
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    
    totalExpenses: {
        fontSize: 28, 
        fontWeight: 'bold',
        marginVertical: 20, 
        color: '#333',
    },
    
    budgetInput: {
        marginBottom: 20,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        marginBottom: 10,
        width: '80%', 
    },
    currentBudget: {
        fontSize: 16,
    },
    budgetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    leftToSpend: {
        flex: 1,
        marginRight: 5,
        padding: 15,
        alignItems: 'flex-start', 
        borderRadius: 10,
    },
    currentBudget: {
        flex: 1,
        marginRight: 5, 
        padding: 15,
        alignItems: 'flex-end', 
        borderRadius: 10,
    },
    leftToSpendText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#777',
    },
    currentBudgetText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#777', 
    },
    amountText: {
        fontSize: 18,
    },
    budgetBar: {
        height: 5,
        backgroundColor: 'blue',
        marginTop: 5,
      },
});



export default BudgetWidget;