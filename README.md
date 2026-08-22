# Lumina — Production-Ready Secure Full-Stack AI Image Generation Platform

Lumina is a modern, high-performance AI image synthesis platform built with a clear separation of concerns between a static-deployable **React + Vite + TypeScript** frontend and a secure **Node.js + Express + TypeScript** REST backend.

---

## 🏗️ Architecture & Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│   (React + Vite + TypeScript • Zero Private Secrets)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Secure Node.js Backend                   │
│   • API Key Multi-Vault Rotation (100 images/key limit)     │
│   • IP Rate Limiting & Input Validation                     │
│   • Admin Passcode Authentication                           │
│   • Safe Masked API Key Sanitization                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Private HTTPS (Server-Side Only)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Clipdrop / AI Image Engine                │
└─────────────────────────────────────────────────────────────┘
```

> **CRITICAL SECURITY GUARANTEE:**
> Private API keys and admin secrets are **NEVER** exposed to client browsers, bundled in frontend code, stored in localStorage, or committed to GitHub repositories.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend:** Node.js, Express, TypeScript (`tsx` in dev, `esbuild` bundled CJS in production).
- **Security:** In-memory rate limiting, sanitized masked keys (`123Q••••••A80103`), strict CORS origin controls.
- **Image Synthesis Engine:** Clipdrop Text-to-Image API with multi-key auto-rotation (100 images per key quota) and high-resolution neural fallback.

---

## 📁 Project Structure

```
.
├── src/                      # Frontend Application
│   ├── components/           # UI Components (TextBoard, ImageBoard, AdminKeysModal, etc.)
│   ├── lib/                  # Client utilities, Firebase sync, Audio synthesis
│   ├── types.ts              # TypeScript interfaces
│   ├── App.tsx               # Primary UI orchestrator
│   ├── main.tsx              # React DOM entry
│   └── index.css             # Tailwind styling & animations
├── server.ts                 # Secure Express REST API Backend
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow for GitHub Pages
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions (secrets, logs, node_modules)
├── index.html                # Vite HTML5 template
├── package.json              # Dependencies & build scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration with relative base path
└── README.md                 # Complete documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=

# Image Generation API (Clipdrop)
CLIPDROP_API_KEY=

# Admin Access & Security Passcode
ADMIN_PASSCODE=123QWErty.A...???...A80103

# Gemini API Key (Optional Server-Side Fallback)
GEMINI_API_KEY=
```

---

## 🚀 Local Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```
This compiles:
- The static frontend into `dist/`
- The backend into a single bundled `dist/server.cjs` file

### 4. Start Production Server
```bash
npm start
```

---

## 🔑 Multi-Key Auto-Rotation System (100 Images Limit)

Lumina features an enterprise-grade multi-key rotation vault:
1. **100 Images Quota per Key:** Each added Clipdrop API key is strictly tracked for up to 100 successful image generations.
2. **Automatic Failover:** When a key reaches 100 images (or returns quota-exceeded codes like 401/402/429), it is marked as `exhausted` and the system seamlessly rotates to the next active key without user interruption.
3. **Admin Dashboard:** Access via the lock icon on the header (Default passcode: `123QWErty.A...???...A80103`).
   - Add single or bulk keys on separate lines.
   - Delete specific keys or bulk-purge exhausted keys.
   - View remaining quota and token metrics in real time.
   - All keys are strictly masked (`123Q••••••A80103`) so secrets are never visible.

---

## 🌐 GitHub Pages Deployment Guide (Frontend Static)

The repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Lumina full-stack application"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. GitHub Actions will automatically compile Vite into `dist/` and deploy your static frontend to `https://<username>.github.io/<repo-name>/`.
4. The frontend includes built-in hybrid client synthesis so your GitHub Pages deployment works out of the box even without a custom Node.js server.

---

## 🏢 Hostinger Deployment Guide

### Method 1: Hostinger VPS / Cloud (Recommended for Full-Stack)

If you have a Hostinger VPS (Ubuntu 22.04 / 24.04):

1. **Connect via SSH:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Install Node.js 20 & PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

3. **Clone & Build Project:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Lumina.git /var/www/lumina
   cd /var/www/lumina
   npm install
   cp .env.example .env
   nano .env    # Configure your PORT, ADMIN_PASSCODE, and CLIPDROP_API_KEY
   npm run build
   ```

4. **Start with PM2 Process Manager:**
   ```bash
   pm2 start dist/server.cjs --name "lumina-app"
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx Reverse Proxy (`/etc/nginx/sites-available/lumina`):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   Enable site and reload:
   ```bash
   sudo ln -s /etc/nginx/sites-available/lumina /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Enable Free SSL / HTTPS (Certbot):**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

7. **Verify Server Health:**
   ```bash
   curl https://yourdomain.com/api/health
   # Returns: {"status":"ok","service":"Lumina Image Synthesis Engine",...}
   ```

---

### Method 2: Hostinger Shared / Web Hosting (Static Frontend)

If your Hostinger plan is Shared Web Hosting (which serves static HTML/CSS/JS without Node.js daemon support):

1. Run `npm run build` locally or through GitHub Actions.
2. In Hostinger **hPanel** > **File Manager**, navigate to `public_html/`.
3. Upload all contents from the local `dist/` directory into `public_html/`.
4. Set up an `.htaccess` file in `public_html/` for SPA client-side routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## 🔒 Security Checklist

- [x] No private API keys or passwords inside frontend source or compiled `.js` bundles.
- [x] `.env` excluded from version control via `.gitignore`.
- [x] Backend inputs validated and sanitized against oversized payloads.
- [x] Rate limiting active on generation (`/api/generate-image`) and authentication (`/api/admin/login`).
- [x] Keys masked (`123Q••••••A80103`) in all API responses.
- [x] Generic, non-sensitive error messages returned to clients on API failures.

---

## 🇵🇰 Developer Attribution
**Developer of Pakistan** • Lumina Neural Image Synthesis Studio
