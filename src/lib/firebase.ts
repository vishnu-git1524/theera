// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBZX5wvv7YELXHi9NJ_5blgFfxLm96Jwr8",
//   authDomain: "theera-f1c53.firebaseapp.com",
//   projectId: "theera-f1c53",
//   storageBucket: "theera-f1c53.firebasestorage.app",
//   messagingSenderId: "941824991214",
//   appId: "1:941824991214:web:fbc52a1153acdfb42338ff"
// };


const firebaseConfig = {
  apiKey: "AIzaSyCXlugehAvvA7quQDfzfgxcvHmlxUJPsBo",
  authDomain: "carelink-14a40.firebaseapp.com",
  projectId: "carelink-14a40",
  storageBucket: "carelink-14a40.appspot.com",
  messagingSenderId: "691846870246",
  appId: "1:691846870246:web:c0717574aa2d70af4cb727"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);