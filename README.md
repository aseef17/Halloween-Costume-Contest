# 🎃 Halloween Costume Contest App

A spooktacular web application for hosting Halloween costume contests with real-time voting, admin controls, and beautiful animations. Built with React, Firebase, and modern web technologies.

![Halloween Costume Contest](https://img.shields.io/badge/Halloween-Contest-orange?style=for-the-badge&logo=halloween)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Real--time-orange?style=for-the-badge&logo=firebase)
![Vite](https://img.shields.io/badge/Vite-Fast%20Build-purple?style=for-the-badge&logo=vite)

## ✨ Features

### 🎭 **Costume Management**

- **Submit Costumes** - Upload images with descriptions
- **Real-time Updates** - See new submissions instantly
- **Image Upload** - Drag & drop or click to upload
- **Costume Editing** - Edit your own submissions

### 🗳️ **Voting System**

- **Real-time Voting** - Vote for your favorite costumes
- **Vote Tracking** - See who voted for what
- **Self-vote Control** - Admin can enable/disable self-voting
- **Vote Count Display** - Live vote counts and rankings

### 👑 **Admin Controls**

- **Voting Toggle** - Enable/disable voting system
- **Results Visibility** - Show/hide contest results
- **Self-vote Settings** - Control self-voting permissions
- **Contest Reset** - Reset entire contest data
- **User Management** - View contest statistics

### 🎨 **User Experience**

- **Responsive Design** - Works on all devices
- **Dark Theme** - Spooky Halloween aesthetic
- **Smooth Animations** - Framer Motion animations
- **Loading States** - Beautiful skeleton loaders
- **Error Handling** - Graceful error management
- **Accessibility** - WCAG compliant

### 🔐 **Authentication**

- **Firebase Auth** - Secure user authentication
- **User Profiles** - Display names and roles
- **Admin Roles** - Special admin privileges
- **Session Management** - Persistent login

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd halloween-costume-contest
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config

4. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase configuration and admin emails
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── features/        # Feature-specific components
│   │   ├── Admin.jsx    # Admin dashboard
│   │   ├── Dashboard.jsx # Main user dashboard
│   │   ├── CostumeCard.jsx # Costume display card
│   │   └── ...
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx   # Custom button component
│   │   ├── Input.jsx    # Form input component
│   │   └── ...
│   └── layout/          # Layout components
├── contexts/            # React contexts
│   ├── AuthContext.jsx  # Authentication context
│   ├── CostumeContext.jsx # Costume data context
│   └── AppSettingsContext.jsx # App settings context
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication hooks
│   ├── useCommon.js     # Common utility hooks
│   └── useAsyncOperations.js # Async operation hooks
├── services/            # API services
│   ├── CostumeService.js # Costume CRUD operations
│   └── AdminService.js  # Admin operations
├── utils/               # Utility functions
│   ├── responsive.js    # Responsive design utilities
│   ├── accessibility.js # Accessibility helpers
│   └── animations.js    # Animation utilities
└── assets/              # Static assets
    ├── images/          # Image files
    └── icons/           # Icon files
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password authentication
   - Set up admin users in Firestore

2. **Firestore Database**
   - Create collections: `costumes`, `votes`, `users`, `settings`
   - Set up security rules

3. **Storage**
   - Enable Firebase Storage for costume images
   - Configure storage rules

4. **Firebase Configuration Files**
   ```bash
   cp firebase.json.example firebase.json
   cp .firebaserc.example .firebaserc
   # Update the project ID in .firebaserc
   ```

### Environment Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Configuration
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com

# App Configuration
VITE_APP_ENV=development
VITE_APP_NAME=Halloween Costume Contest
```

### Admin Configuration

The app uses environment variables to configure admin users. Set the `VITE_ADMIN_EMAILS` variable with a comma-separated list of admin email addresses:

```env
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

**Note:** If no admin emails are set in the environment variables, no admin users will be available. Make sure to set your own admin emails in production!

### Environment Files

The app supports multiple environment files for different deployment scenarios:

- **`.env.local`** - Local development (ignored by git)
- **`.env.development`** - Development-specific settings
- **`.env.production.example`** - Production template
- **`.env.example`** - General template

**Priority order:** `.env.local` > `.env.development` > `.env.production` > `.env`

## 📱 Usage

### For Contest Participants

1. **Register/Login** - Create an account or sign in
2. **Submit Costume** - Upload your Halloween costume photo
3. **Vote** - Vote for your favorite costumes (when enabled)
4. **View Results** - See contest results (when revealed)

### For Administrators

1. **Access Admin Panel** - Click "Admin Panel" button
2. **Control Voting** - Enable/disable voting system
3. **Manage Results** - Show/hide contest results
4. **Reset Contest** - Clear all data for new contest
5. **Monitor Activity** - View contest statistics

## 🎨 Customization

### Themes

- Modify `src/index.css` for color schemes
- Update Halloween icons in `src/assets/`
- Customize animations in `src/utils/animations.js`

### Features

- Add new costume categories
- Implement different voting systems
- Add costume rating system
- Create costume galleries

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
# Make sure firebase.json and .firebaserc are configured
firebase deploy
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server (development mode)
- `npm run dev:prod` - Start development server (production mode)
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run build:prod` - Build for production
- `npm run preview` - Preview production build
- `npm run preview:prod` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Code Quality

- ESLint configuration for code quality
- Prettier for code formatting
- Custom hooks for reusable logic
- Context providers for state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎃 Halloween Fun

This app was built with love for Halloween enthusiasts! Perfect for:

- 🏠 **House parties** - Host costume contests at home
- 🏢 **Office events** - Company Halloween celebrations
- 🎓 **School events** - Student costume competitions
- 🎪 **Community events** - Neighborhood Halloween contests

## 🆘 Support

If you encounter any issues or have questions:

- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed information
- Contact the development team

---

**Happy Halloween! 🎃👻🦇**

Built with ❤️ for the Halloween community
