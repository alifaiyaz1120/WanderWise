import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, Image, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import EventModal from '../Components/EventModal';
import EventComponent from '../Components/EventComponent';
import { auth } from '../firebase_config';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

function BudgetTracker() {
    const [hasBudget, setHasBudget] = useState(false);
    const [maxBudgetString, setMaxBudgetString] = useState('');
    const [maxBudget, setMaxBudget] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [displayedDate, setDisplayedDate] = useState(`${getMonthName(selectedMonth)} ${selectedYear}`);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [isBudgetInputVisible, setIsBudgetInputVisible] = useState(false);

    const navigation = useNavigation();
   
    const updateDisplayedDate = () => {
        setDisplayedDate(`${getMonthName(selectedMonth)} ${selectedYear}`);
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
            Alert.alert('Please enter a valid number.');
            console.log('Not a valid number!');
        }
    };
    

    const addEvent = async (eventData) => {
        if (eventData.event_name === '' || eventData.event_description === '' || eventData.event_location === '' || eventData.event_budget === ''){
            Alert.alert('Please fill out all fields.');
        }
        else if (isNaN(eventData.event_budget) === true) {
            Alert.alert('Please enter a valid budget.');
        }
        else {
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
        }
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

    const deleteEvent = async (firebaseUserID, itemID) => {
        try{
            // const url = `http://${Platform.OS === "ios" ? "localhost" : "10.0.2.2"}:8000/delete_event/${firebaseUserID}/${itemID}/`;
            const url = `https://${LinkID}.pythonanywhere.com/delete_event/${firebaseUserID}/${itemID}/`;
            const response = await axios.delete(url);
            setEventsList(auth.currentUser.uid);
            console.log(response.data);
        }
        catch (error) {
            console.error('Error deleting event: ', error);
        }
    }
    const calculateTotalExpenses = () => {
        return events.reduce((total, event) => total + parseFloat(event.event_budget || 0), 0);
      };
    
    
    useEffect(() => {
        checkHasBudget(auth.currentUser.uid);
        setEventsList(auth.currentUser.uid);
        updateDisplayedDate(); 
     }, [selectedMonth, selectedYear]);


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            {/* Back Arrow */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
            <Image
            source={require('wanderwise-frontend/icons/back.png')}
            resizeMode='contain'
            style={styles.backButtonIcon}
          />
            </TouchableOpacity>

            <Text style={styles.title}>Expenses</Text>
            {isPickerVisible && (
                    <View style={styles.selectedDateContainer}>
                        <Text style={styles.selectedDateText}>
                            {displayedDate}
                        </Text>
                    </View>
                )}
                <View style={styles.dateContainer}>
                  
                        <Text style={styles.dateTextContainer}>
                            <Text style={styles.dateText}>
                                {displayedDate}
                            </Text>
                          
                        </Text>
                    
                </View>

            {/* Plus Sign */}
            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.headerRight}>
                <FontAwesome name="plus" size={20} color="black" />
            </TouchableOpacity>
            <View style={styles.totalExpensesContainer}>
                <Text style={styles.totalExpensesTitle}>Total Spent:</Text>
                <Text style={styles.totalExpensesAmount}>${calculateTotalExpenses()}</Text>
            </View>

            </View>
            
            
            <View style={styles.budgetBox}>
            <View style={styles.budgetContainer}>
            <View style={styles.leftToSpend}>
                <Text style={styles.leftToSpendText}>Left to Spend:</Text>
                <Text style={styles.amountText}>${calculateLeftToSpend()}</Text>
            </View>
            
   
        <View style={styles.currentBudget}>
                <Text style={styles.currentBudgetText}>Current Budget:</Text>
                        <Text style={styles.amountText}>${maxBudget}</Text>
                        
                </View>
        </View>
                
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${calculateProgress()}%` }]} />
                </View>
           <View style={styles.changeBudgetButtonContainer}>
                {!isBudgetInputVisible ? (
                    <TouchableOpacity 
                        onPress={() => setIsBudgetInputVisible(true)} 
                        style={styles.changeBudgetButton}
                    >
                        <Text style={styles.changeBudgetButtonText}>Change Budget</Text>
                    </TouchableOpacity>
        ) : (
            <View style={styles.budgetInput}>
                <TextInput
                    placeholder="Max Budget"
                    onChangeText={setMaxBudgetString}
                    value={maxBudgetString}
                    style={styles.input}
                    keyboardType="numeric"
                    onBlur={() => {
                        setIsBudgetInputVisible(false);
                        createOrUpdateMaxBudget(); 
                    }}
                />
                <TouchableOpacity onPress={() => createOrUpdateMaxBudget()} style={styles.changeBudgetButton}>
                    <Text style={styles.changeBudgetButtonText}>Save Budget</Text>
                </TouchableOpacity>
            </View>
        )}


        </View>
            </View>
            
            <View style={styles.buttonsContainer}>
            </View>
          

            {showModal && (
                <EventModal
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={addEvent}
                />
            )}

            <EventComponent
                events={events}
                onDelete={deleteEvent}
                budgetLimit={maxBudget} 

            />
        </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const getMonthName = (month) => {
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return monthNames[month - 1];
};

const styles = StyleSheet.create({
    changeBudgetButton: {
        backgroundColor: '#2ecc71',  
        borderRadius: 15, 
        alignSelf: 'center',
        marginVertical: 10,  
        paddingVertical: 8,  
        paddingHorizontal: 25,  
        width: 180,  
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
    changeBudgetButtonText: {
        textAlign: 'center',
        fontSize: 14,  
        color: 'white',
    },
    totalExpensesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#f2f2f2', 
        borderRadius: 8,
        padding: 10,
      },
      totalExpensesTitle: {
        fontSize: 20, 
        fontWeight: 'bold',
        color: 'black', 
        marginRight: 10,
      },
      totalExpensesAmount: {
        fontSize: 22, 
        fontWeight: 'bold',
        color: '#e74c3c',  
      },
    budgetBox: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginVertical: -10,
        width: '90%', 
        alignSelf: 'center', 
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    
    progressBarContainer: {
        marginBottom: 20,  
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
    backButtonIcon: {
        width: 25, 
        height: 25,  
        tintColor: 'black',  
      },
    
    headerLeft: {
        position: 'absolute',
        left: 20, 
    },
    headerRight: {
        position: 'absolute',
        right: 20, 
    },
    
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    
    title: {
        fontSize: 26,
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
    
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -5, 
      },
      
      dateText: {
        fontSize: 20,
        color: 'black', 
        fontWeight: 'bold', 
      },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    picker: {
        width: 100,
    },
    arrowIcon: {
        marginLeft: 10, 
    },
    selectedDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      },
      selectedDateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', 
        backgroundColor: '#3498db', 
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    
    budgetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'center', 
    },
    leftToSpend: {
        flex: 1,
        marginRight: 5,
        padding: 15,
        borderRadius: 10,
        alignItems: 'flex-start',
    },
    currentBudget: {
        flex: 1,
        marginRight: 5,
        fontSize: 16,
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

export default BudgetTracker;