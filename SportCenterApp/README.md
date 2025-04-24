# Sport Center Management App

A comprehensive mobile application for managing sports center activities, built using React Native and Firebase.

## Features

- **Multi-role access**: Supports Customer, Coach, and Admin roles with role-specific dashboards
- **Class management**: Browse, book, and manage sports classes
- **User profiles**: View and edit personal information
- **Notifications**: Stay updated with center activities and notifications
- **Schedule management**: For coaches to manage their classes
- **Admin dashboard**: Complete center management with statistics and reports

## Screenshots

(Screenshots will be added here)

## Technologies Used

- React Native for cross-platform mobile development
- Firebase for authentication, database, and storage
- React Navigation for app navigation
- React Native Vector Icons for UI elements

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/SportCenterApp.git
```

2. Install dependencies:
```
cd SportCenterApp
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password), Firestore Database, and Storage
   - Update the Firebase configuration in `configs/Apis.js`

4. Start the development server:
```
npx expo start
```

## Project Structure

- `/screens`: Contains all the app screens organized by role
  - `/Auth`: Authentication screens (Login, Register, etc.)
  - `/Customer`: Customer-specific screens
  - `/Coach`: Coach-specific screens
  - `/Admin`: Admin-specific screens
  - `/Shared`: Screens shared across different roles
- `/components`: Reusable UI components
- `/configs`: Configuration files including Firebase setup
- `/assets`: Images, fonts, and other static assets
- `/styles`: Global styles and theme configuration

## User Roles

### Customer
- Browse available classes
- Book and manage class registrations
- View personal profile and attendance
- Get notifications about classes

### Coach
- Manage personal class schedule
- Track student attendance
- View class details and participants
- Create and manage workouts

### Admin
- Manage all center operations
- View analytics and reports
- Manage users, coaches, and classes
- Handle payments and memberships

## Development Roadmap

- [x] Project setup and structure
- [x] Authentication
- [x] Role-based dashboards
- [x] Class browsing and details
- [x] Profile management
- [x] Notifications
- [ ] Booking system with payments
- [ ] Coach scheduling tools
- [ ] Admin reporting dashboard
- [ ] Real-time attendance tracking

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/SportCenterApp](https://github.com/yourusername/SportCenterApp) 