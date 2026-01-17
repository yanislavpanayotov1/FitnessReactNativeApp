# FitAI - AI-Powered Fitness App

A modern fitness application that generates personalized workout plans using AI, built with React Native (Expo) and Node.js.

## 🌟 Features

### 💪 AI-Powered Workouts
- **Personalized Training Plans** - AI generates custom workout routines based on your goals, experience level, and preferences
- **Progressive Overload** - Automatic weight calculations based on your 1RM data
- **Multiple Training Splits** - Choose from various workout programs or let AI optimize for you

### 🎨 Modern UI/UX
- **Dark & Light Modes** - Beautiful themes with custom color schemes
  - Dark Mode: Deep forest green (#28443f) with lime accents (#F2FD7D)
  - Light Mode: Clean, modern design with subtle colors
- **Auto Theme Detection** - Follows device theme or set manually
- **Smooth Animations** - Polished user experience with loading states and transitions

### 📊 Smart Features
- **1RM Tracking** - Input your one-rep max for key exercises
- **Weight Estimation** - Automatically calculates appropriate weights for all exercises
- **Weekly Schedules** - Organized workout plans with day-by-day breakdowns
- **Exercise Details** - Sets, reps, rest periods, and form notes

### 🔐 User Management
- **Secure Authentication** - Email/password login with bcrypt encryption
- **Session Persistence** - Stay logged in with AsyncStorage
- **Onboarding Flow** - Guided questionnaire to understand your fitness goals

## 🛠️ Tech Stack

### Frontend (Mobile)
- **React Native** - Cross-platform mobile development
- **Expo** - Development framework and tooling
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type-safe code
- **React Context API** - State management (User, Session, Theme)
- **AsyncStorage** - Local data persistence

### Backend (Server)
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **AI Integration** - Workout plan generation

## 📁 Project Structure

```
FitnessApp2/
├── client/                 # React Native mobile app
│   ├── app/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── data/          # Static data (questions, etc.)
│   │   ├── utils/         # Helper functions
│   │   ├── index.tsx      # Home screen
│   │   ├── loginScreen.tsx
│   │   ├── paywallScreen.tsx
│   │   ├── questionnaire.tsx
│   │   ├── dashboard.tsx
│   │   └── settingsScreen.tsx
│   └── package.json
│
└── server/                # Node.js backend
    ├── lib/               # Database configuration
    ├── ai.js             # AI workout generation
    ├── progressiveOverload.js
    ├── workoutTemplates.js
    ├── server.js         # Main server file
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/FitnessApp2.git
cd FitnessApp2
```

2. **Set up the backend**
```bash
cd server
npm install

# Configure your database connection in lib/db.js
# Create the required database tables (see Database Schema below)

npm run dev
```

3. **Set up the mobile app**
```bash
cd ../client
npm install
npx expo start
```

4. **Run the app**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 🗄️ Database Schema

The app uses MySQL with the following main tables:

- `users` - User accounts
- `onboarding_sessions` - Questionnaire sessions
- `user_answers` - User questionnaire responses
- `workout_plans` - Generated workout plans
- `ai_requests` - AI generation tracking

## 🎯 User Flow

1. **Onboarding**
   - Answer questionnaire about fitness goals
   - Input 1RM data for key exercises
   - Select workout split preference

2. **Subscription**
   - View premium features
   - Choose subscription plan
   - Start free trial

3. **Dashboard**
   - View personalized workout plan
   - Navigate through weekly schedule
   - See exercise details with calculated weights

4. **Settings**
   - Switch between light/dark/auto themes
   - Manage account preferences

## 🎨 Theme System

The app features a sophisticated theme system:

- **Auto Mode**: Follows device theme settings
- **Light Mode**: Clean, professional design
- **Dark Mode**: Custom dark green (#28443f) with lime accents (#F2FD7D)
- **Persistent**: Theme preference saved locally

## 🔑 Key Features Explained

### Progressive Overload
The app automatically calculates training weights using:
- User's 1RM data for compound lifts
- Exercise difficulty ratios
- Weekly progression (70% → 75% → 80% → 65% deload)
- Automatic weight rounding to practical increments

### AI Workout Generation
When users select "AI-optimized" split:
- Analyzes questionnaire responses
- Generates custom workout plan
- Includes exercise selection, sets, reps, and rest periods
- Stores plan for future reference

## 🔒 Security

- Passwords hashed with bcrypt
- Session-based authentication
- Secure API endpoints
- Input validation and sanitization

## 📱 Supported Platforms

- iOS (iPhone & iPad)
- Android (Phone & Tablet)
- Web (via Expo web support)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Yanislav Panayotov

## 🙏 Acknowledgments

- AI workout generation powered by custom algorithms
- UI design inspired by modern fitness apps
- Progressive overload methodology based on proven training principles

---

**Note**: This is a demonstration project. For production use, additional security measures, error handling, and testing should be implemented.
