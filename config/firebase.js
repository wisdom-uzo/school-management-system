// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyCGfJAN2oa3GDlT_wXlgwvDqAMaZwlcp4k",
  authDomain: "evergreen-13cc3.firebaseapp.com",
  projectId: "evergreen-13cc3",
  storageBucket: "evergreen-13cc3.appspot.com",
  messagingSenderId: "148868094123",
  appId: "1:148868094123:web:1a80e71e00e01edba3bfee",
  measurementId: "G-D14K1MV0BV"
};



// const firebaseConfig = {
//   apiKey: "AIzaSyCu9gPFfd-PvRFC1avDUwYBjqLQgiI58UQ",
//   authDomain: "best-project-46c88.firebaseapp.com",
//   projectId: "best-project-46c88",
//   storageBucket: "best-project-46c88.appspot.com",
//   messagingSenderId: "785930164390",
//   appId: "1:785930164390:web:b2b50ac32cbc199741bc67"
// };



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app)
//export default app