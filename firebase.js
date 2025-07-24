import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyD5wb_i2inqHsE3LpVrATUbT7-JElOVjo0",
  authDomain: "aura-calculator-abaa9.firebaseapp.com",
  databaseURL: "https://aura-calculator-abaa9-default-rtdb.firebaseio.com",
  projectId: "aura-calculator-abaa9",
  storageBucket: "aura-calculator-abaa9.appspot.com",
  messagingSenderId: "969727913312",
  appId: "1:969727913312:web:500b876add15269e024205",
  measurementId: "G-W7MZ77YNCY"
};

let app;
let auth;
let database;
let storage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  database = getDatabase(app);
  storage = getStorage(app);
} else {
  app = getApp();
  auth = getAuth(app);
  database = getDatabase(app);
  storage = getStorage(app);
}



export { auth, database, storage };