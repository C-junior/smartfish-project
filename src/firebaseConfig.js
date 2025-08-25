// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBge9DUGttm4OMVWKLSzHMKmQzc1oYxchs",
  authDomain: "smartfish-c4ac7.firebaseapp.com",
  databaseURL: "https://smartfish-c4ac7-default-rtdb.firebaseio.com",
  projectId: "smartfish-c4ac7",
  storageBucket: "smartfish-c4ac7.appspot.com",
  messagingSenderId: "260869781807",
  appId: "1:260869781807:web:ef105a272181166b7349da",
  measurementId: "G-R0CHPDN105"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };