# Halloween Costume Contest

A real-time web application for hosting Halloween costume contests with voting, live results, and comprehensive admin controls.

## Features

### User Features

- **Authentication**: Secure email/password and Google sign-in via Firebase Auth
- **Costume Submission**: Upload costume images with optional descriptions
  - Camera capture support for mobile devices
  - Gallery selection for existing photos
- **Real-time Voting**: Vote for favorite costumes when voting is enabled
  - Change votes before voting closes
  - Visual feedback for current vote selection
- **Live Results**: View rankings and vote counts when results are visible
  - Automatic tie detection with "(Tied)" indicator
  - Trophy indicators for top 3 positions

### Admin Features

- **Quick Admin Controls**: Convenient panel on Dashboard for common actions
  - Toggle voting on/off
  - Toggle results visibility
  - Start/end revote for ties
  - Link to full admin panel
- **Full Admin Panel**:
  - View all submissions with costume details
  - Monitor vote counts and participation
  - Enable/disable self-voting
  - Manage contest state (active/inactive)
- **Tie Resolution**: Automatic revote system for first-place ties
  - Clears existing votes
  - Restricts voting to only tied costumes
  - Maintains fair voting process
- **Contest Reset**: One-click reset functionality
  - Deletes all costumes, votes, and user data
  - Clears Firebase Storage images
  - Resets app settings to defaults
  - Automatically logs out all active users when reset occurs

## Tech Stack

- **Frontend**: React 19 with hooks and context-based state management
- **Build Tool**: Vite with Rolldown bundler
- **Styling**: Tailwind CSS v4 with custom design system
- **Animations**: Motion (Framer Motion) for smooth transitions
- **Backend**: Firebase
  - Authentication (Email/Password + Google OAuth)
  - Firestore (real-time database)
  - Storage (image hosting)
- **UI Components**: Radix UI primitives with custom styling
- **Notifications**: Sonner toast library

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled

## Setup

1. **Clone the repository**

   ```bash
   cd my-app
   npm install
   ```

2. **Configure Firebase**

   Create two environment files in the root directory:

   **`.env.development`** (for local development):

   ```env
   VITE_FIREBASE_API_KEY=your_dev_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_dev_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_dev_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_dev_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
   VITE_FIREBASE_APP_ID=your_dev_app_id
   VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ```

   **`.env.production`** (for production builds):

   ```env
   VITE_FIREBASE_API_KEY=your_prod_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_prod_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_prod_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_prod_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
   VITE_FIREBASE_APP_ID=your_prod_app_id
   VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ```

3. **Firebase Security Rules**

   Configure Firestore rules to allow authenticated users to read/write:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   Configure Storage rules:

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /costume-images/{imageId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
         allow delete: if request.auth != null;
       }
     }
   }
   ```

## Development

```bash
# Start development server (uses .env.development)
npm run dev

# Start development server with production config
npm run dev:prod

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

Development server runs at `http://localhost:5173`

## Production Build

```bash
# Build for production (uses .env.production)
npm run build:prod

# Build for development
npm run build:dev

# Preview production build
npm run preview:prod
```

## Environment Variable Priority

The application uses a clear hierarchy for environment configuration:

1. **`.env.development`** - Used during `npm run dev`
2. **`.env.production`** - Used during `npm run build:prod`
3. Mode-specific commands override the default Vite behavior

## Admin Access

Admin privileges are granted in two ways:

1. **Email-based**: Users whose email matches any entry in `VITE_ADMIN_EMAILS`
2. **Role-based**: Users with `role: "admin"` in their Firestore document

New users are automatically assigned admin role if their email is in the admin list.

## Application Workflow

### Contest Setup (Admin)

1. Admin enables costume submissions (default: enabled)
2. Users submit costumes with images and descriptions
3. Admin monitors submissions via admin panel

### Voting Phase (Admin)

1. Admin clicks "Open Voting" when ready
2. Users can vote for their favorite costume
3. Users can change their vote before voting closes
4. Admin monitors vote counts in real-time

### Results Phase (Admin)

1. Admin clicks "Close Voting" to stop accepting votes
2. Admin clicks "Show Results" to reveal rankings
3. If first place has a tie, admin can initiate a revote:
   - Clears all existing votes
   - Users vote only among tied costumes
   - Process repeats until tie is broken or admin ends revote

### Contest Reset (Admin)

1. Admin clicks "Reset Contest" with confirmation
2. System performs complete cleanup:
   - Deletes all costumes and votes
   - Removes all images from storage
   - Deletes all user documents
   - Resets app settings
   - Logs out all active users immediately
3. Fresh contest ready for next event

## Technical Highlights

### Real-time Synchronization

Uses Firestore `onSnapshot` listeners for instant updates across all clients. All users see vote counts and rankings update live without manual refresh.

### Automatic Logout on Reset

When an admin resets the contest, all logged-in users are immediately signed out via a real-time listener on their Firestore user document. When the document is deleted during reset, the listener fires and triggers `signOut()`, preventing orphaned authentication states.

**Implementation** (AppContext.jsx:119-143):

```javascript
useEffect(() => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const unsubscribe = onSnapshot(userRef, async (snapshot) => {
    if (!snapshot.exists()) {
      // User document deleted - force immediate logout
      await signOut(auth);
    }
  });

  return () => unsubscribe();
}, [user]);
```

### Performance Optimizations

- `useMemo` for expensive calculations (vote counting, rankings)
- Efficient vote count map using O(1) lookups instead of O(n) filtering
- Memoized context values to prevent unnecessary re-renders
- Lazy-loaded admin services to reduce initial bundle size

### Tie Detection Algorithm

The ranking system detects ties by comparing vote counts:

- Costumes with equal votes receive the same rank
- Next rank skips positions (e.g., if two tied at #1, next is #3)
- Displays "(Tied)" indicator for all tied positions
- Enables revote functionality for first-place ties only

### Environment-Aware Logging

Custom logger utility (`src/utils/logger.js`) silences debug logs in production:

- `logger.log()`, `logger.warn()`, `logger.info()` only output in development mode
- `logger.error()` always outputs for debugging purposes
- Improves production performance and reduces console noise

### Image Upload

- Supports both camera capture and gallery selection
- Mobile devices can use native camera via HTML5 `capture="environment"` attribute
- Images stored in Firebase Storage under `costume-images/` path
- Automatic cleanup during contest reset

## Project Structure

```
src/
├── components/
│   ├── features/         # Main feature components (Dashboard, Admin, etc.)
│   ├── layout/          # Layout components (Header, Footer)
│   └── ui/              # Reusable UI components (Button, Card, etc.)
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication hook
│   ├── useAsyncOperations.js # Async operation handlers
│   └── useImageUpload.js # Image upload logic
├── services/            # Firebase service modules
│   ├── AdminService.js  # Admin operations (reset, revote, settings)
│   └── CostumeService.js # Costume CRUD operations
├── utils/               # Utility functions
│   ├── logger.js        # Environment-aware logging
│   ├── toastUtils.js    # Toast notification helpers
│   └── index.js         # Common utilities
├── AppContext.jsx       # Global state management
├── firebaseConfig.js    # Firebase initialization
└── App.jsx             # Root component
```

## Firestore Collections

### `users`

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: "admin" | "user",
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

### `costumes`

```javascript
{
  userId: string,
  userName: string,
  imageUrl: string,
  description: string,
  submittedAt: Timestamp,
  updatedAt: Timestamp
}
```

### `votes`

```javascript
{
  voterId: string,
  costumeId: string,
  timestamp: Timestamp
}
```

### `appSettings`

```javascript
{
  votingEnabled: boolean,
  resultsVisible: boolean,
  contestActive: boolean,
  allowSelfVote: boolean,
  revoteMode: boolean,
  revoteCostumeIds: string[],
  lastReset: Timestamp,
  lastUpdated: Timestamp
}
```

## State Management

The application uses React Context for global state management via `AppContext.jsx`:

- **Authentication State**: User data, admin status, loading states
- **Costume Data**: All costumes with real-time updates
- **Vote Data**: All votes with real-time updates
- **App Settings**: Contest configuration (voting enabled, results visible, etc.)
- **Computed Values**: Rankings, tie detection, vote counts (memoized)

All data syncs in real-time using Firestore `onSnapshot` listeners.

## License

MIT
