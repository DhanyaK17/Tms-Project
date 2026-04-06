# Deployment Guide: Ticket Management System (TMS)

This guide provides step-by-step instructions for deploying your Full Stack (MERN) application. We will use **Render** for the Backend and **Vercel** for the Frontend.

---

## 🏗️ Stage 1: Prepare Your Code
Before proceeding, ensure your project is pushed to a **GitHub repository**.

1.  Create a new GitHub repository (e.g., `tms-project`).
2.  In your terminal, from the root (`TMS-PROJECT-FINAL`), run:
    ```bash
    git init
    git add .
    git commit -m "Prepare for deployment"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    git push -u origin main
    ```

---

## 🍃 Stage 2: MongoDB Atlas Setup
Ensure your database is accessible from the cloud.

1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Go to **Network Access** (under "Security").
3.  Click **Add IP Address**.
4.  Select **Allow Access From Anywhere** (or add `0.0.0.0/0`) and click **Confirm**.
5.  Go to **Database** → **Connect** → **Drivers** to get your connection string (keep it ready).

---

## 🚀 Stage 3: Backend Deployment (Render)
Render is an excellent platform for hosting Node.js services.

1.  Create an account on [Render.com](https://render.com/).
2.  Click **New +** → **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `tms-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  Add **Environment Variables**:
    *   `MONGODB_URI`: *Your Atlas Connection String*
    *   `JWT_SECRET`: *A strong secret key (e.g., `your_random_string_123`)*
    *   `PORT`: `5000`
    *   `JWT_EXPIRY`: `7d`
6.  Click **Create Web Service**.
7.  Once deployed, copy the **onrender.com** URL (e.g., `https://tms-backend.onrender.com`).

---

## 💻 Stage 4: Frontend Deployment (Vercel)
Vercel is optimized for React and is very easy to set up.

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** → **Project**.
3.  Import your GitHub repository.
4.  Configure the build:
    *   **Framework Preset**: `Create React App`
    *   **Root Directory**: `frontend` (Click "Edit" and select the `frontend` folder)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `build`
5.  Add **Environment Variables**:
    *   `REACT_APP_API_URL`: `https://YOUR_BACKEND_URL.onrender.com/api`
6.  Click **Deploy**.

---

## ✅ Stage 5: Final Check
1.  Visit your Vercel URL.
2.  Test the login and registration.
3.  Check the "Network" tab in your browser's Developer Tools (`F12`) to ensure requests are going to your Render URL.

---
Created by Antigravity AI coded assistant.
