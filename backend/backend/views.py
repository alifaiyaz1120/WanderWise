import pyrebase
import os

config = {
    "apiKey": "...",
    "authDomain": "...",
    "projectId": "...",
    "storageBucket": "...",
    "messagingSenderId": "...",
    "appId": "...",
    "measurementId": "G-...",
}

firebase = pyrebase.initialize_app(config)
db = firebase.storage()

data = db.child('your_path').get().val()

print("Data from Firebase Database:")
print(data)