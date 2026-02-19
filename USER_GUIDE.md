# Crafty Rachel - User Guide

## 🎉 Congratulations! Your App is Complete!

All user-side pages have been implemented with your brand colors (pink shades & orange) and fonts (Fredoka & Sniglet).

## ✅ What's Been Built

### Public Pages
- **Landing Page** (`/`) - Logo placeholder, features, Login/SignUp buttons
- **Login Page** (`/login`) - Test credentials: user@test.com / user123
- **Signup Page** (`/signup`) - Create new accounts

### Protected Pages (Requires Login)
- **Dashboard** (`/dashboard`) - Statistics & recent calculations
- **Calculator** (`/calculator`) - Calculate costs, profit, suggested pricing
- **History** (`/history`) - View & manage past calculations
- **Inventory** (`/inventory`) - Manage materials (CRUD operations)
- **Profile** (`/profile`) - Edit user information
- **Subscription** (`/subscription`) - View & change plans (Free/Basic/Pro)

## 🚀 How to Run

1. **If not running, start the server:**
   \`\`\`
   npm start
   \`\`\`

2. **Open browser:**
   \`\`\`
   http://localhost:4200
   \`\`\`

3. **Login with test account:**
   - Email: user@test.com
   - Password: user123

## 🎨 Design Features

- ✅ Brand colors applied (Pink shades + Orange)
- ✅ Custom fonts (Fredoka + Sniglet)
- ✅ Logo placeholder (ready for your logo)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light mode toggle
- ✅ Bootstrap Icons integrated

## 💾 Data Storage

- All data stored in browser's localStorage
- Sample materials and calculations pre-loaded
- No backend required
- Data persists across sessions

## 🔍 Testing the App

1. **Dashboard** - View your statistics
2. **Inventory** - Click "Add Material" to add new materials
3. **Calculator** - Select materials, set quantities, adjust profit margin, save
4. **History** - See saved calculations, search, filter, sort
5. **Profile** - Edit your name/email
6. **Subscription** - Try changing plans (simulated)

## 📱 Features

- Real-time cost calculations
- Automatic profit margin calculations
- Material inventory management
- Calculation history with search & filters
- User profile management
- Subscription plan comparison
- Dark/Light theme toggle

## 🎯 Next Steps

To add your actual logo:
1. Place your logo image in \`public/\` folder
2. Update logo placeholders in components
3. Replace the circular gradients with \`<img>\` tags

## 📦 File Structure

```
src/app/
├── components/        # All page components
├── models/           # Data models
├── services/         # Business logic
├── guards/           # Route protection
└── styles.css        # Global styles with brand colors
```

## 💡 Tips

- Theme preference is saved automatically
- Each user has separate data in localStorage
- Materials can be reused across calculations
- History is sorted newest first by default
- Profit margin is customizable per calculation

## 🎊 Ready to Use!

Your Crafty Rachel CR Calculator is fully functional and ready for use or demonstration!

**Made to sell, made with love. ❤️**
