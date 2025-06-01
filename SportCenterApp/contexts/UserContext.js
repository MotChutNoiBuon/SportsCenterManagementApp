// contexts/UserContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();

export const MyUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user from storage:', e);
      }
    };
    loadUser();
  }, []);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={setUser}>
        {children}
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
};

// Hooks để dùng user và setUser
export const useUser = () => {
  const context = useContext(MyUserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a MyUserContext.Provider');
  }
  return context;
};

export const useDispatch = () => {
  const context = useContext(MyDispatchContext);
  if (context === undefined) {
    throw new Error('useDispatch must be used within a MyDispatchContext.Provider');
  }
  return context;
};
