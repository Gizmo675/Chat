import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

var firebaseConfig = {
  apiKey: "AIzaSyDzxoBidWsbjvMGuvz3WpyfAqmXbgubEbk",
  authDomain: "chatbox-d0f4b.firebaseapp.com",
  databaseURL: "https://chatbox-d0f4b.firebaseio.com",
  projectId: "chatbox-d0f4b",
  storageBucket: "chatbox-d0f4b.appspot.com",
  messagingSenderId: "152131824957",
  appId: "1:152131824957:web:7756a0a41dd70722eea954",
  measurementId: "G-H4WER1NRQY"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;