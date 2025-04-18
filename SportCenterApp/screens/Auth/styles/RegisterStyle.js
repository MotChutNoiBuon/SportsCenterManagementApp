import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1, // Quan trọng để ScrollView hoạt động đúng
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 40, // Đảm bảo nút không bị che
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
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
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
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
});
