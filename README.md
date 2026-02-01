# 🌙 Midnight Muse - Backend API

Serverless API for Midnight Muse, deployed on Vercel.

## Architecture

- **Runtime**: Node.js
- **Framework**: Vercel Serverless Functions
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## Folder Structure

```
backend/
├── api/
│   ├── auth/
│   │   └── login.js          # POST /api/auth/login
│   └── shayaris/
│       ├── public.js          # GET /api/shayaris/public
│       ├── all.js             # GET /api/shayaris/all (protected)
│       ├── [id].js            # GET /api/shayaris/[id]
│       ├── reaction.js        # POST /api/shayaris/:id/reaction
│       └── crud.js            # POST/PUT/DELETE (protected)
├── _lib/
│   ├── db.js                 # MongoDB connection
│   ├── auth.js               # JWT utilities
│   └── models/
│       ├── User.js           # User schema
│       └── Shayari.js        # Shayari schema
├── package.json
├── vercel.json
└── .env.example
```

## Environment Variables

Create `.env` file (or set in Vercel):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/midnight-muse
JWT_SECRET=your-super-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials

### Shayaris (Public)
- `GET /api/shayaris/public` - Get all public shayaris
- `GET /api/shayaris/[id]` - Get single shayari
- `POST /api/shayaris/reaction` - Add emoji reaction

### Shayaris (Protected)
- `GET /api/shayaris/all` - Get all shayaris (public + private)
- `POST /api/shayaris/crud` - Create shayari
- `PUT /api/shayaris/crud?id=...` - Update shayari
- `DELETE /api/shayaris/crud?id=...` - Delete shayari

## Deployment

### Step 1: Create Vercel Project

```bash
# From backend folder
cd backend
vercel
```

### Step 2: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI = [your-mongodb-connection-string]
JWT_SECRET = [your-secret-key]
```

### Step 3: Deploy

```bash
vercel --prod
```

Your backend API will be available at: `https://your-backend-project.vercel.app`

## Local Development

```bash
# Install dependencies (optional, Vercel handles it)
npm install

# Test endpoints with curl or Postman
curl https://your-backend-project.vercel.app/api/shayaris/public
```

## Testing Endpoints

### Login
```bash
curl -X POST https://your-backend-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"voldermort","password":"your-password"}'
```

### Get Public Shayaris
```bash
curl https://your-backend-project.vercel.app/api/shayaris/public
```

### Add Reaction
```bash
curl -X POST https://your-backend-project.vercel.app/api/shayaris/reaction \
  -H "Content-Type: application/json" \
  -d '{"emoji":"❤️"}'
```

## Notes

- Each Vercel function is independent and scales automatically
- MongoDB connection is reused across requests
- JWT tokens expire in 7 days
- Passwords are hashed with bcryptjs
- All data stored in MongoDB Atlas
