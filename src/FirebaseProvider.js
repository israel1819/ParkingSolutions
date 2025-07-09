import React, { useState, useEffect, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [userProfile, setUserProfile] = useState(undefined);

    useEffect(() => {
        const firebaseConfig = {
  apiKey: "AIzaSyAUaFpN1jg7QMR9ijxZuiwQVYeWXXrepVk",
  authDomain: "parkluxe-eed0d.firebaseapp.com",
  projectId: "parkluxe-eed0d",
  storageBucket: "parkluxe-eed0d.firebasestorage.app",
  messagingSenderId: "1038485808891",
  appId: "1:1038485808891:web:94222225baddee049e725e",
  measurementId: "G-XKHW70JTMW"
};

        try {
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);

            setDb(firestoreDb);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    const appIdForFirestore = '1:1038485808891:web:94222225baddee049e725e';
                    const userDocRef = doc(firestoreDb, `artifacts/${appIdForFirestore}/users/${user.uid}/userData`, user.uid);
                    try {
                        const docSnap = await getDoc(userDocRef);
                        if (docSnap.exists()) {
                            setUserProfile(docSnap.data());
                        } else {
                            setUserProfile(null);
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                        setUserProfile(null);
                    }
                } else {
                    setUserId(null);
                    setUserProfile(null);
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Error initializing Firebase:", error);
        }
    }, []);

    return (
        <FirebaseContext.Provider value={{ db, auth, userId, isAuthReady, userProfile }}>
            {children}
        </FirebaseContext.Provider>
    );
};
