# WanderWise ✈️

[DEMO Video 🎥](https://youtu.be/6CKu7ZFYMes)

‘WanderWise’ is meant to empower travelers with itineraries that change the way people plan and experience their journeys. Our goal is to simplify the travel planning process through a diverse and useful set of features aside from the travel planning aspect. 

Core features of the app include:
  1) User Profiles: Allows users to create and personalize their accounts. Customization options include profile pictures and bios. 
  2) Map Page: Enables users to explore locations either near their current location or by searching on the map. 
  3) Details Page: Offers comprehensive information about a selected location including - Reviews, Opening/Closing Hours, Address, Images, Contact Info, etc.
  4) Home Page: Displays posts from users that a person follows, creating a personalized feed, and allows the user to search for other users and view their profiles. 
  5) Widget Page: Aggregates useful widgets for quick access. Includes Calendar, Budget, and Flight Status Widgets for at-a-glance information.
  6) Calendar Widget: Enables users to plan and track upcoming events related to their travels.
  7) Budget Tracker: Allows users to set and manage budgets for their trips. Users are able to add and manage their expenses at ease. 
  8) Flight Status: Provides real-time status updates for flights.
  9) Post Page: Allows users to create and share posts with their followers. Users can share pictures with descriptions and locations attached for immersive user experiences.

## Technology Used

- React Native
- Django
- JavaScript
- Python
- Firebase
- PythonEverywhere
- Expo
- Xcode/Android Studio
- GitHub


WanderWise is built using **React Native** in the frontend. This allows us to serve users with an Android and IOS compatible application with a user friendly and modern user interface. **Expo** was used to deploy our frontend and publish it for the public to access. 


WanderWise uses **Firebase Authentication** to verify all users visiting our application. **Firebase Storage** is used to save all images uploaded to our application, including post images and profile images. **Firestore Database** is used to store user data consisting of personal information, post information, following/follower mappings, etc. 


Wanderwise also communicates with **Django's** REST framework to make all **API** calls and store data for out widget components. Data for the Calendar and Budget Tracker are stored within Django's Database. **PythonAnywhere** was used to host our Django Server. 


## Architecture Map
![Untitled Notebook-4](https://github.com/Wander-Wise/WanderWise/assets/71999538/6ad6205b-2e0c-4773-8503-db2a1d4d1a86)

## Run
Run Django Locally (Not hosted on PythonAnywhere):
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate (macOS) *Activating the virtual environment will depend on your OS*
pip install -r requirements.txt
python manage.py runserver
```
If any errors occur, you may need to run the commands:
  ```python manage.py makemigrations```
  ```python manage.py migrate```
before running the server again

Run Frontend Locally:
```bash
cd Frontend
npx expo start --offline
```
(Install XCode/Android Studio for IOS/Android Simulators)

## Deployment Process

**Django:** The process of deploying the backend involved moving the backend files into a separate repository that would be used on PythonAnywhere. Within PythonAnywhere, a virtual environment was made, the dependencies within the `requirements.txt` file were installed, and the app settings were configured. After all configurations were done, the routes used in Django were now accessible through the PythonAnywhere url's which are used throughout the React Native frontend.

**React Native:** The process of deploying the frontend involved using Expo, which is a set of tools built on top of React Native that makes it so the app can be built without the need for native code. Expo has a dashboard in a user's account where they can publish an app and make it viewable through a QR code or link to anyone else with the Expo Go app. To deploy on Expo, we assembled the frontend of our app and installed the necessary packages one at a time until the app was completely functioning on the dashboard and usable through both the iOS and Android platforms. 


## Contributors 
Ashok Surujdeo, Ali Faiyaz, Ashdeep Singh, Martin Mihaylov

Hunter College Capstone Project (09/12 - 12/23)
