// Firebase configuration and API setup

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyABC123DEF456GHI789JKL",
  authDomain: "sport-center-app.firebaseapp.com",
  projectId: "sport-center-app",
  storageBucket: "sport-center-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: "G-ABC123DEF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth functions
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user profile with the display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Create a user document in Firestore
    const userDoc = {
      uid: userCredential.user.uid,
      email,
      displayName: displayName || '',
      role: 'customer', // Default role
      createdAt: serverTimestamp(),
      photoURL: '',
    };
    
    await addDoc(collection(db, 'users'), userDoc);
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onUserAuthStateChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const getUserProfile = async (uid) => {
  try {
    const userQuery = query(collection(db, 'users'), where('uid', '==', uid));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return { data: null, error: 'User not found' };
    }
    
    return { data: userSnapshot.docs[0].data(), error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const userQuery = query(collection(db, 'users'), where('uid', '==', uid));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return { success: false, error: 'User not found' };
    }
    
    const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
    await updateDoc(userDocRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Lessons and Classes functions
export const getClasses = async (filters = {}) => {
  try {
    let classesQuery = collection(db, 'classes');
    
    // Apply filters
    if (filters.category) {
      classesQuery = query(classesQuery, where('category', '==', filters.category));
    }
    
    if (filters.level) {
      classesQuery = query(classesQuery, where('level', '==', filters.level));
    }
    
    if (filters.status) {
      classesQuery = query(classesQuery, where('status', '==', filters.status));
    }
    
    // Apply sorting
    if (filters.orderBy) {
      classesQuery = query(classesQuery, orderBy(filters.orderBy, filters.orderDirection || 'asc'));
    } else {
      classesQuery = query(classesQuery, orderBy('date', 'asc'));
    }
    
    // Apply limit
    if (filters.limit) {
      classesQuery = query(classesQuery, limit(filters.limit));
    }
    
    const classesSnapshot = await getDocs(classesQuery);
    const classes = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { data: classes, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getClassDetails = async (classId) => {
  try {
    const classDocRef = doc(db, 'classes', classId);
    const classDoc = await getDoc(classDocRef);
    
    if (!classDoc.exists()) {
      return { data: null, error: 'Class not found' };
    }
    
    return { data: { id: classDoc.id, ...classDoc.data() }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Bookings functions
export const bookClass = async (userId, classId, bookingData) => {
  try {
    // First, check if there are available spots
    const classDocRef = doc(db, 'classes', classId);
    const classDoc = await getDoc(classDocRef);
    
    if (!classDoc.exists()) {
      return { success: false, error: 'Class not found' };
    }
    
    const classData = classDoc.data();
    if (classData.spotsAvailable <= 0) {
      return { success: false, error: 'No spots available for this class' };
    }
    
    // Create booking document
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      userId,
      classId,
      className: classData.title,
      instructorName: classData.instructor,
      date: classData.date,
      time: classData.time,
      status: 'confirmed',
      createdAt: serverTimestamp(),
      ...bookingData,
    });
    
    // Update class spots available
    await updateDoc(classDocRef, {
      spotsAvailable: classData.spotsAvailable - 1,
    });
    
    return { success: true, bookingId: bookingRef.id, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserBookings = async (userId) => {
  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { data: bookings, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Storage functions
export const uploadUserProfileImage = async (uid, file) => {
  try {
    const storageRef = ref(storage, `users/${uid}/profile-image`);
    await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with the new image URL
    const userQuery = query(collection(db, 'users'), where('uid', '==', uid));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
        updatedAt: serverTimestamp(),
      });
    }
    
    return { downloadURL, error: null };
  } catch (error) {
    return { downloadURL: null, error: error.message };
  }
};

export default {
  auth,
  db,
  storage,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  getCurrentUser,
  onUserAuthStateChanged,
  getUserProfile,
  updateUserProfile,
  getClasses,
  getClassDetails,
  bookClass,
  getUserBookings,
  uploadUserProfileImage,
};
