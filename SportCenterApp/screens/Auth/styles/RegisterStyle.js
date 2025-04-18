// screens/Auth/styles/RegisterStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  loginLink:{
    textAlign: 'center',
    color: '#007bff',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialText: {
    fontWeight: 'bold',
  },
  registerLink: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginVertical: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#666',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
