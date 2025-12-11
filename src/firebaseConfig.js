import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDDeJpNXSjP2EvafoFAMoLprVy8rs1GnAk",
    authDomain: "bank-42dd1.firebaseapp.com",
    projectId: "bank-42dd1",
    storageBucket: "bank-42dd1.firebasestorage.app",
    messagingSenderId: "486540935530",
    appId: "1:486540935530:web:db2b11875fab36ded82513"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);