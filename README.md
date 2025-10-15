# MarEye - Marine Security AI Platform

A modern Next.js frontend for marine security operations with AI-powered CNN image processing and object detection capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for future ML model integration)

### Installation

1. **Clone/Download the project**
   ```bash
   # If you have the zip file, extract it first
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file in the root directory
   # Add your API keys here (optional for basic frontend)
   GROK_API_KEY=your_grok_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev:direct
   # or
   yarn dev:direct
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

- `npm run dev:direct` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── contact/           # Contact page
│   ├── profile/           # User profile
│   └── try/               # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utility libraries
├── public/               # Static assets
└── hooks/                # Custom React hooks
```

## 🎯 Features

- **Modern UI/UX** - Beautiful marine-themed interface
- **Authentication** - User login/registration system
- **AI Solutions** - CNN and Detection modules (ready for integration)
- **Responsive Design** - Works on all devices
- **Contact System** - Built-in contact form
- **Profile Management** - User profile and settings

## 🔧 For ML Model Integration

When you're ready to add Python ML models:

1. **Create Python virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Add your models** to the `lib/` directory
4. **Update API routes** in `app/api/` to integrate with your models

## 🌊 Marine Security Features

- **CNN Image Processing** - Underwater image enhancement
- **Object Detection** - YOLO-based detection system
- **Real-time Analysis** - Live monitoring capabilities
- **Multi-class Recognition** - Submarines, mines, divers detection

## 📧 Contact

For questions or collaboration:
- Email: aochuba52@gmail.com
- Phone: 8900007125

## 📄 License

This project is part of the MarEye Marine Security Platform.

---

**Note**: This is a frontend-only version. ML models and Python dependencies need to be added separately for full functionality.
