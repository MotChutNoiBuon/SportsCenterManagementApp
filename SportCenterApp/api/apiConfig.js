import { Platform } from 'react-native';
import axios from "axios"

export const DEV_MODE = false;

let BASE_URL = 'http://192.168.152.183:8000/'

export const OAUTH2_CONFIG = {
  client_id: '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI',
  client_secret: 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP',
};

export const API_ENDPOINTS = {
  'register': '/users/',
  'login': '/o/token/',
  "profile": '/user/profile/',
  "users": '/users/',
  'current-user': '/users/current-user/',
  "classes": '/classes/',
  "enrollments": '/enrollments/',
  "progress": '/progress/',
  "appointments": '/appointments/',
  "payments": '/payments/',
  "notifications": '/notifications/',
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL, 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});