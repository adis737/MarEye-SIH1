# 🚀 MarEye Setup Guide

## Quick Setup Instructions

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev:direct
```

### 3. Open in Browser
Go to: http://localhost:3000

---

## 🔧 For ML Model Integration (Optional)

### Python Environment Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Environment Variables
Create `.env.local` file:
```env
GROK_API_KEY=your_api_key_here
```

---

## 📱 Features Available

✅ **Working Features:**
- Beautiful marine-themed UI
- User authentication (login/register)
- Contact form
- User profile management
- Responsive design
- CNN and Detection page layouts

🔄 **Ready for Integration:**
- CNN image processing
- YOLO object detection
- Real-time analysis
- ML model endpoints

---

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
npx kill-port 3000
# Then run again
npm run dev:direct
```

**Node modules issues?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Python issues?**
```bash
# Update pip
python -m pip install --upgrade pip
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

---

## 📞 Support

- Email: aochuba52@gmail.com
- Phone: 8900007125

**Happy coding! 🌊**
