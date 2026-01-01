# 🎵 Spotify MVP Clone - Setup Guide

A full-stack music streaming application with offline support, encrypted downloads, and donation-based premium features.

## 📋 Features

- 🎧 Stream music instantly
- 🔍 Search songs, artists, albums
- 📥 Download encrypted songs for offline playback
- 🔐 Secure authentication
- 💰 Donation-based premium (Cashfree integration)
- 👨‍💼 Admin dashboard for song management
- 📱 Responsive design (mobile & desktop)
- 🔒 AES-256 encryption for downloaded music

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (Atlas)
- JWT Authentication
- Multer (file uploads)
- Crypto (encryption)

**Frontend:**
- React 18
- Vite
- IndexedDB (offline storage)
- Web Audio API
- Axios

## 📦 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Cashfree account (for donations)
- Cloud storage (Cloudinary/AWS S3) OR local storage

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend (.env):**
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spotify-mvp

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Encryption (32-byte hex string)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Cloudinary (or use local storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Cashfree
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=TEST

# CORS
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your IP (or use 0.0.0.0/0 for testing)
5. Get connection string → paste in `MONGODB_URI`

### 4. Cashfree Setup

1. Sign up at [Cashfree](https://www.cashfree.com/)
2. Get test credentials from dashboard
3. Add to backend `.env`

### 5. Generate Encryption Key

```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output → use for both backend and frontend `ENCRYPTION_KEY`

### 6. Create Admin User

After starting backend, register a user, then manually update MongoDB:

```javascript
// In MongoDB Atlas → Collections → users
// Find your user and update:
{
  "isAdmin": true
}
```

## 🎬 Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access at: `http://localhost:5173`

## 📁 File Storage Options

### Option A: Cloudinary (Recommended)
- Free tier: 25GB storage, 25GB bandwidth/month
- Setup in backend `.env`
- Automatic handling in `backend/src/utils/fileHandler.js`

### Option B: Local Storage
- Songs stored in `backend/uploads/`
- Remove Cloudinary config from `.env`
- Backend will serve files directly

### Option C: AWS S3
- Modify `fileHandler.js` to use AWS SDK
- More scalable for production

## 🎵 Adding Songs (Admin)

1. Login with admin account
2. Navigate to `/admin`
3. Fill upload form:
   - Title, Artist, Album
   - Upload MP3 file (max 20MB)
4. Song encrypts → uploads → metadata saves to MongoDB
5. Users can now stream/download

## 🔒 How Encryption Works

1. **Upload:** Admin uploads MP3 → backend encrypts with AES-256 → stores encrypted file
2. **Stream:** User plays → backend serves encrypted file → frontend decrypts in memory → plays
3. **Download:** Encrypted file stored in IndexedDB → decrypts during playback
4. **Security:** Encryption key in environment variables (never in client code publicly)

## 📱 Offline Mode

1. User clicks "Download" on song
2. Encrypted file saves to IndexedDB (browser database)
3. When offline, app reads from IndexedDB
4. Decrypts and plays without internet

**IndexedDB Structure:**
```
Database: spotify-offline-music
Store: songs
  - Key: songId
  - Value: { id, title, artist, album, encryptedData, artwork, downloadedAt }
```

## 💰 Donation System

1. User clicks "Support Us"
2. Modal opens with donation amounts
3. Cashfree payment gateway integration
4. On success → user marked as "premium supporter"
5. Badge displayed on profile

**Donation Tiers:**
- ₹99 - Coffee Supporter
- ₹299 - Music Lover
- ₹999 - Super Fan
- Custom amount

## 🛠️ Project Scripts

**Backend:**
```bash
npm run dev      # Development with nodemon
npm start        # Production
npm run seed     # Seed sample data (optional)
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📊 Database Schema

**Users:**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  username: String,
  isAdmin: Boolean,
  isPremium: Boolean,
  donations: [{ amount, date }],
  createdAt: Date
}
```

**Songs:**
```javascript
{
  _id: ObjectId,
  title: String,
  artist: String,
  album: String,
  duration: Number,
  fileUrl: String,
  artworkUrl: String,
  uploadedBy: ObjectId (admin user),
  createdAt: Date
}
```

**Donations:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  orderId: String,
  status: String (pending/success/failed),
  gateway: String (cashfree),
  createdAt: Date
}
```

## 🔧 Troubleshooting

**Songs not playing:**
- Check browser console for errors
- Verify encryption key matches in backend/frontend
- Check file URL accessibility

**Download not working:**
- Check IndexedDB in browser DevTools
- Ensure HTTPS in production (IndexedDB requires secure context)

**MongoDB connection failed:**
- Verify connection string
- Check IP whitelist
- Ensure database user has read/write permissions

**Cashfree payment fails:**
- Use test mode credentials
- Check webhook URL configuration
- Verify CORS settings

## 🚀 Production Deployment

### Backend (Railway/Render/Heroku):
```bash
npm run build
npm start
```

### Frontend (Vercel/Netlify):
```bash
npm run build
# Upload dist/ folder
```

### Environment Variables:
- Set all `.env` variables in hosting platform
- Use production MongoDB cluster
- Switch Cashfree to PRODUCTION mode
- Enable HTTPS (required for IndexedDB)

## 📝 API Endpoints

**Auth:**
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

**Songs:**
- GET `/api/songs` - List all songs
- GET `/api/songs/:id` - Get song details
- GET `/api/songs/:id/stream` - Stream song

**Admin:**
- POST `/api/admin/songs` - Upload song (admin only)
- DELETE `/api/admin/songs/:id` - Delete song (admin only)

**Donations:**
- POST `/api/donations/create` - Create donation order
- POST `/api/donations/verify` - Verify payment

## 🤝 Contributing

This is an MVP. Potential enhancements:
- Playlists
- Social features (sharing, following)
- Recommendations algorithm
- Lyrics display
- Podcast support
- Progressive Web App (PWA)
- Desktop app (Electron)

## 📄 License

MIT License - feel free to use for learning/commercial projects

## 🆘 Support

For issues:
1. Check this README
2. Review console errors
3. Check MongoDB/Cloudinary dashboards
4. Verify environment variables

---

Built with ❤️ for music lovers