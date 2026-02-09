# 🚀 AahaApps.com Deployment Guide (cPanel + Git)

This is the definitive guide to deploying your Laravel + React application to **`aahaapps.com`** (Main Domain) on cPanel shared hosting (MyGlobalHost).

---

## 📂 Phase 1: Local Preparation (Do This First!)
Since cPanel servers usually don't have Node.js/NPM, we must **build the frontend locally** and upload the finished assets.

### 1. Build the Frontend
1. Open your terminal in `AahaApps/AahaApps_Laravel`.
2. Navigate to the frontend source:
   ```bash
   cd frontend_src
   ```
3. Run the build command:
   ```bash
   npm run build
   ```
   *(This compiles your React code and copies it to `../public/` automatically)*.

### 2. Verify `.gitignore`
Ensure `public/assets` is **NOT** ignored.
- Open `AahaApps_Laravel/.gitignore`.
- Make sure there is **NO** line like `/public/assets` or `/public/index.html`.
- If `/public/build` is ignored, that is fine.

### 3. Push to GitHub
1. Create a repository on GitHub (e.g., `aahaapps-live`).
2. Initialize git in the root folder (`AahaApps/`) if not already done.
3. Add and commit all files:
   ```bash
   cd ..  # Go to AahaApps root
   git add .
   git commit -m "Deployment Build for aahaapps.com"
   git remote add origin https://github.com/YOUR_USERNAME/aahaapps-live.git
   git push -u origin main
   ```

---

## 🌍 Phase 2: cPanel Setup (Server Side)

### 1. Create a MySQL Database
1. Log in to cPanel.
2. Go to **MySQL® Databases**.
3. Create a **New Database** (e.g., `neelima_aaha_prod`).
4. Create a **New User** (e.g., `neelima_prod_user`) and set a strong password.
5. **Add User to Database**: Grant **ALL PRIVILEGES**.
   - Note down the database name, username, and password.

### 2. Set Up Git Version Control
1. Go to **Git™ Version Control** in cPanel.
2. Click **Create**.
3. **Clone URL**: Enter your GitHub HTTPS URL.
4. **Repository Path**: Enter `repositories/aahaapps` (This keeps your source code OUTSIDE `public_html` for security).
5. **Branch**: `main`.
6. Click **Create**.

---

## 🔗 Phase 3: Linking to Main Domain (public_html)

Since you are deploying to the main domain (`aahaapps.com`), the document root is likely fixed to `public_html`. We will replace `public_html` with a link to your project's `public` folder.

**CRITICAL STEP:**
1. Open **File Manager** in cPanel.
2. locate `public_html`.
3. **Rename** it to `public_html_backup` (just in case).
   *(If you can't rename, delete its contents - but make sure you have a backup!)*.

4. Open **Terminal** in cPanel (or SSH).
5. Run this command to create a symbolic link:
   ```bash
   ln -s /home/YOUR_CPANEL_USER/repositories/aahaapps/AahaApps_Laravel/public /home/YOUR_CPANEL_USER/public_html
   ```
   *(Replace `YOUR_CPANEL_USER` with your actual cPanel username - check the path in File Manager if unsure)*.

6. Now, `aahaapps.com` points directly to your Laravel application!

---

## ⚙️ Phase 4: Configuration & Install

### 1. Create .env File
1. Go to **File Manager** in cPanel.
2. Navigate to `repositories/aahaapps/AahaApps_Laravel`.
3. Create a new file named `.env`.
4. Paste the content from your local `.env`.
5. **Update these production values**:
   ```ini
   APP_NAME=AahaApps
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://aahaapps.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_cpanel_db_name
   DB_USERNAME=your_cpanel_db_user
   DB_PASSWORD=your_cpanel_db_pass
   ```

### 2. Install PHP Dependencies
1. Open **Terminal** in cPanel.
2. Navigate to the project folder:
   ```bash
   cd repositories/aahaapps/AahaApps_Laravel
   ```
3. Install dependencies (use the correct PHP version path, usually ea-php82 or similar):
   ```bash
   /usr/local/bin/ea-php82 /usr/local/bin/composer install --no-dev --optimize-autoloader
   ```

### 3. Final Setup
Still in the terminal:
1. **Generate App Key**:
   ```bash
   php artisan key:generate
   ```
2. **Run Migrations**:
   ```bash
   php artisan migrate --force
   ```
3. **Link Storage**:
   ```bash
   php artisan storage:link
   ```
   *(This ensures uploaded images/videos are accessible)*.
4. **Cache Config**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## ✅ Deployment Checklist

- [ ] Frontend moved to `public/` (via `npm run build`).
- [ ] Code pushed to GitHub.
- [ ] Repo cloned to `repositories/aahaapps`.
- [ ] `public_html` replaced with symlink to project `public`.
- [ ] Database created & `.env` configured.
- [ ] `composer install` finished.
- [ ] Migrations run.
- [ ] `storage:link` created.

🚀 **Your app is now live at https://aahaapps.com!**
