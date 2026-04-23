# Campus Placement Tracker: Deployment Guide

Congratulations on finishing the development of the Campus Placement Tracker platform! Because the `backend` operates on Node/Express with MongoDB, and the `frontend` is a standard Vite React application, they technically run on different environments in production.

This guide details a standard deployment strategy mapping both ends to popular hosting interfaces (Render/Vercel) alongside fully configuring your database manually.

---

## 1. Hosting the Database (MongoDB Atlas)

Currently, your project is utilizing a local/offline MongoDB script. For production, the database needs to exist online natively.

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Construct a **New Cluster** (the free M0 tier is fully capable for this software).
3. Inside **Network Access**, explicitly click `Add IP Address`, and allow access from anywhere `0.0.0.0/0`.
4. Under **Database Access**, create a rigorous `Username` and `Password` combination. 
5. Finally, hit **Connect** > Connect your application. It will hand you a `MONGO_URI` formatted generally like this:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/PlacementDB?retryWrites=true&w=majority`
6. Save this URI; you'll absolutely need it shortly for the Backend setup!

---

## 2. Deploying the Backend (Railway)

Because our backend manages real-time `Socket.io` WebSockets, it needs a full, persistent Node.js server. **Railway** is the best free option — it supports WebSockets natively, never sleeps on inactivity, and deploys directly from GitHub with zero config changes.

1. Sign up at [Railway.app](https://railway.app) using your GitHub account.
2. Click **New Project → Deploy from GitHub repo** and select your `placement-tracker` repository.
3. Railway will auto-detect the root. Because the backend lives in a subfolder, click **Settings** on the service and set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Go to the **Variables** tab and add your environment variables:
   - `MONGO_URI`: *(Paste the Atlas URL from Step 1)*
   - `JWT_SECRET`: *(Any long, random secret string)*
   - `CLOUDINARY_CLOUD_NAME`: `dnlyszxne`
   - `CLOUDINARY_API_KEY`: `935121451771272`
   - `CLOUDINARY_API_SECRET`: *(your secret)*
   - `PORT`: `5000`
5. Click **Deploy**. Railway builds and launches the server in ~1 minute and provides a live URL like `https://placement-tracker-backend.up.railway.app`.

> **TIP**
> Railway gives $5 of free credit per month which comfortably covers a small Node.js backend. No credit card required to start.

## 2.5 Cloud Storage (Cloudinary — Already Integrated ✅)

Cloudinary is **already fully wired up** in this codebase. All profile photos, resumes, and chat images are stored in the cloud under the `dnlyszxne` account, organized into three folders:

| Upload Type | Cloudinary Folder |
|---|---|
| Profile pictures | `placement-tracker/profiles` |
| Student resumes | `placement-tracker/resumes` |
| Chat images | `placement-tracker/chats` |

The only thing you need to do before deploying is add the three `CLOUDINARY_*` environment variables in Railway's **Variables** tab (already listed in Step 2 above). No local disk storage is used — files persist permanently on Cloudinary regardless of server restarts.

---

## 3. Deploying the Frontend (Vercel)

Vercel acts natively as an excellent zero-config static hosting solution tailored heavily for Vite & React software logic.

1. **Pre-configuration locally:** 
   Open `frontend/src/api.js` (and `socket.js`). Currently, they point to `http://localhost:5000`. You must update this URL directly to reflect your newly spawned backend server address! (i.e. `https://placement-backend.onrender.com`).
2. Login to [Vercel](https://vercel.com) and map your GitHub authorization.
3. Import your `placement-tracker` repository explicitly.
4. **Configuration Settings:**
   - **Framework Preset**: Check that it inherently defaults to `Vite` explicitly!
   - **Root Directory:** Edit this string specifying `frontend` exclusively.
   - Click Deploy.
5. Vercel automatically runs the `npm run build` optimization command and subsequently generates a highly optimized distribution cache pointing to a live custom URL immediately. 

> **TIP**
> If your Vite router breaks upon manual refresh causing a `404 Error`, ensure a standard `vercel.json` rewrite file exists internally mapping `"rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ]`!

You now have a fully operational, universally accessible cloud-deployed infrastructure mirroring your local development exactness seamlessly!
