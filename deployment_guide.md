# Deployment Guide: CertChain Secure System

Follow these steps to deploy your application to production.

## 1. Backend Deployment (Render / Railway / DigitalOcean)

The backend is a Node.js Express server. We recommend **Render.com** for simplicity.

### Instructions:
1. Connect your GitHub repository to Render.
2. Select **Web Service**.
3. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install` (in the `server` directory)
   - **Start Command**: `node index.js`
4. **Environment Variables**:
   - `PORT`: `3001`
   - `VITE_SUPABASE_URL`: (Copy from your `.env`)
   - `SUPABASE_SERVICE_ROLE_KEY`: (Copy from your `.env`)
   - `JWT_SECRET`: (Copy from your `.env`)
   - `SUPABASE_JWT_SECRET`: (Found in Supabase Project Settings > API)
   - `FRONTEND_URL`: `https://your-frontend-domain.vercel.app`

## 2. Frontend Deployment (Vercel)

The frontend is a Vite + React application.

### Instructions:
1. Connect your repository to **Vercel**.
2. Vercel will auto-detect Vite. Ensure the **Root Directory** is the project root.
3. **Environment Variables**: Configure the following in the Vercel Dashboard:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com`
   - `VITE_SUPABASE_URL`: (Copy from your `.env`)
   - `VITE_SUPABASE_ANON_KEY`: (Copy from your `.env`)
   - `VITE_POLYGON_AMOY_RPC_URL`: `https://rpc-amoy.polygon.technology`
   - `VITE_CERT_REGISTRY_ADDRESS`: `0x7945b932B02687119ae7278eE7df8eA2E0b845a5`
   - `VITE_CERT_SBT_ADDRESS`: `0x2c155dEea9a69B1AC012282cB8a63C3057f759Fb`
   - `VITE_GEMINI_API_KEY`: (Copy from your `.env`)

## 3. Post-Deployment Verification
1. Log in to the **Admin Portal** using your Supabase credentials.
2. Issue a test certificate.
3. Verify the certificate using the **Public Verification Portal**.
4. Cross-reference the transaction on **PolygonScan**.
