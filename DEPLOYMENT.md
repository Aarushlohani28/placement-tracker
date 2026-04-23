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

## 2. Deploying the Backend (Render / Heroku)

Because our backend manages real-time `Socket.io` WebSockets and static File Uploads (`Multer`), it needs a dedicated, persisting Node server (unlike serverless functions). **Render** is excellent for this.

1. Sign up for [Render.com](https://render.com) and hook into your GitHub account natively.
2. Select **New Web Service** and map onto your `placement-tracker` repository explicitly.
3. Because the root repository holds both frontend/backend, you must override standard configurations:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. **Environment Variables**: Add your production keys exactly mapping your development values!
   - `MONGO_URI`: *(Paste the Atlas URL you procured from Step 1)*
   - `JWT_SECRET`: *(Generate a highly secure randomized long text string)*
   - `PORT`: `5000`
5. **Deploy**: Hit Create. It may take 3-5 minutes, but it will eventually yield a live address.

## 2.5 Cloud Storage Integration (Cloudinary)

Because platforms like Render/Heroku natively wipe your local `public/uploads` directories whenever the server spins down or restarts (unless you pay for persistent disks), you **must** migrate your file infrastructure securely over to a dedicated cloud storage provider before deploying in production. We highly recommend using **Cloudinary**:

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Pull your standard Cloudinary configuration variables from your dashboard (`Cloud Name`, `API Key`, and `API Secret`).
3. Add these identical variables directly into your Backend **Render Environment Variables** list alongside your Mongo URI:
   - `CLOUDINARY_CLOUD_NAME`: `your-cloud-name`
   - `CLOUDINARY_API_KEY`: `your-api-key`
   - `CLOUDINARY_API_SECRET`: `your-secret`
4. Update your backend code locally! Open a terminal in the backend folder and run `npm install cloudinary multer-storage-cloudinary`.
5. Rewrite your `multer` configurations (found inside `userRoutes.js` and `messageRoutes.js`). Replace `multer.diskStorage` with the `CloudinaryStorage` adapter targeting different cloud folders (`folder: 'profiles'`, `'resumes'`, `'chats'`).
6. Your router will subsequently start handing off absolute cloud URL strings (`https://res.cloudinary.com/...`) seamlessly natively persisting across all server wipes!

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
