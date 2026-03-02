# NFSkills - Complete Local Setup Guide

This guide covers setting up both the **Backend** (`exam-back`) and **Frontend** (`exam-front`) on your local machine.

---

## Prerequisites

Install the following before starting:

1. **Node.js** (v18 or higher) - https://nodejs.org/
2. **MongoDB** (v6 or higher) - https://www.mongodb.com/try/download/community

   Alternatively, use **MongoDB Atlas** (free cloud database): https://www.mongodb.com/atlas

Verify installations:
```bash
node --version     # Should show v18.x.x or higher
npm --version      # Should show 9.x.x or higher
mongosh --version  # Should show 2.x.x or higher (if using local MongoDB)
```

---

## Step 1: Setup MongoDB

### Option A: Local MongoDB

Make sure MongoDB is running:
```bash
# On Windows: MongoDB runs as a service automatically
# On Mac: brew services start mongodb-community
# On Linux: sudo systemctl start mongod
```

No need to create a database manually — MongoDB creates it automatically when the app connects.

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a free cluster (M0 - Free tier)
3. Create a database user (username & password)
4. Click "Connect" → "Drivers" → Copy the connection string
5. It will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nfskills`

---

## Step 2: Setup the Backend (exam-back)

Open a terminal and navigate to the `exam-back` folder:

```bash
cd exam-back
```

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Configure Environment Variables

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file:

**For local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/nfskills
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**For MongoDB Atlas:**
```
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/nfskills
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 2.3 Start the Backend Server

```bash
npm run dev
```

The backend will start on `http://localhost:5000`.

On first run, demo accounts and sample data are automatically created.

---

## Step 3: Setup the Frontend (exam-front)

Open a **new terminal** and navigate to the `exam-front` folder:

```bash
cd exam-front
```

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Configure Environment Variables

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

The default `.env` should contain:

```
VITE_API_URL=http://localhost:5000
```

This tells the frontend where the backend is running. If you changed the backend port, update this value.

### 3.3 Start the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## Step 4: Open the Application

Open your browser and go to:

```
http://localhost:5173
```

---

## Default Login Credentials

| Role    | Email                    | Password        |
|---------|--------------------------|-----------------|
| Admin   | abdullah@nfskills.com    | NFskills@1234   |
| Teacher | teacher1@nfskills.com    | teacher123      |
| Teacher | teacher2@nfskills.com    | teacher123      |
| Student | student1@nfskills.com    | student123      |

---

## Quick Start Summary

```bash
# Terminal 1 - Backend
cd exam-back
npm install
cp .env.example .env        # Edit with your MongoDB URI
npm run dev

# Terminal 2 - Frontend
cd exam-front
npm install
cp .env.example .env
npm run dev

# Open browser: http://localhost:5173
```

---

## Running in Production

### Build the Frontend

```bash
cd exam-front
npm run build
```

This creates a `dist/` folder with static files.

### Run the Backend in Production

```bash
cd exam-back
npm run dev   # Or use PM2: pm2 start src/index.ts --interpreter tsx
```

### Serve with nginx (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend - serve the built static files
    location / {
        root /path/to/exam-front/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - proxy to the Express server
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

When using nginx to proxy both on the same domain, update `exam-front/.env`:
```
VITE_API_URL=
```
Then rebuild: `npm run build`

---

## Troubleshooting

### "MONGO_URI must be set"
- Make sure the `.env` file exists in the `exam-back` folder
- The file must be named exactly `.env` (with the dot)

### "MongoServerError: bad auth"
- Double-check your MongoDB username and password
- For Atlas: make sure your IP is whitelisted (Network Access → Add Current IP)

### "Connection refused" errors
- Make sure MongoDB is running locally, or your Atlas connection string is correct
- For local: run `mongosh` to verify MongoDB is accessible

### Backend starts but frontend shows network errors
- Make sure both terminals are running (backend on 5000, frontend on 5173)
- Check `VITE_API_URL` in `exam-front/.env` matches the backend URL
- Check `CORS_ORIGIN` in `exam-back/.env` matches the frontend URL

### "Port already in use"
- Change PORT in `exam-back/.env` (e.g., 3001)
- Update `VITE_API_URL` in `exam-front/.env`: `http://localhost:3001`

### npm install fails
- Make sure Node.js v18+ is installed
- Try: `rm -rf node_modules package-lock.json && npm install`

### Data not showing after login
- Check the backend terminal for errors
- The seed runs on first start — if you see "Seeding database..." the data was created
- If you cleared the database, restart the backend to re-seed
