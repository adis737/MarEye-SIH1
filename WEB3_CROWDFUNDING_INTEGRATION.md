# 🌊 Web3 Crowdfunding Integration with Oceanova

## Overview

This integration connects Oceanova's marine conservation platform with a Web3 crowdfunding system, allowing users to create and fund conservation projects using blockchain technology.

## 🚀 Quick Start

### Start All Services
```bash
npm run dev:all
```

This will start:
- **Oceanova Main App**: http://localhost:3000
- **Web3 Crowdfunding**: http://localhost:3002

### Individual Services
```bash
# Start only Oceanova
npm run dev

# Start only crowdfunding
npm run crowdfunding

# Start with Flask backend
npm run dev:concurrent
```

## 🔗 Integration Points

### 1. Conservation Insights Page
- **Location**: `/app/solutions/conservation-insights/page.tsx`
- **Feature**: "Start Conservation Project" button redirects to crowdfunding platform
- **URL**: Opens http://localhost:3002 in new tab

### 2. Web3 Crowdfunding Platform
- **Location**: `/web3-crowdfunding/`
- **Features**:
  - Create conservation campaigns
  - Fund projects with ETH
  - Manage campaign tiers
  - Admin panel for campaign management

## 📁 Project Structure

```
Oceanova/
├── app/
│   └── solutions/
│       └── conservation-insights/
│           └── page.tsx          # Main integration point
├── web3-crowdfunding/            # Web3 crowdfunding platform
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Campaign listing
│   │   │   ├── admin/            # Admin panel
│   │   │   ├── campaign/         # Individual campaigns
│   │   │   └── dashboard/        # User dashboard
│   │   └── components/
│   │       ├── CampaignCard.tsx
│   │       ├── TierCard.tsx
│   │       └── MyCampaignCard.tsx
│   └── crowdfundingcontracts/    # Smart contracts
├── scripts/
│   ├── start-all.js             # Start both servers
│   └── start-crowdfunding.js    # Start crowdfunding only
└── package.json                 # Updated with new scripts
```

## 🛠️ Technical Details

### Dependencies Added
- `thirdweb@^5` - Web3 SDK for blockchain interactions

### Scripts Added
- `dev:all` - Start both Oceanova and crowdfunding servers
- `crowdfunding` - Start only crowdfunding server
- `dev:concurrent` - Start all services concurrently

### Smart Contracts
- **Crowdfunding.sol** - Individual campaign contracts
- **CrowdfundingFactory.sol** - Factory for creating campaigns
- **CrowdfundingFactoryWithAdmin.sol** - Admin-enabled factory

## 🌐 Network Configuration

### Blockchain Network
- **Network**: Ethereum Sepolia Testnet
- **Factory Contract**: `0x5aE4527588fF07B7C239d20A96e82E861BeFFEE6`

### Ports
- **Oceanova**: 3000
- **Crowdfunding**: 3002

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
# Main project
npm install

# Web3 crowdfunding
cd web3-crowdfunding
npm install
cd ..
```

### 2. Environment Setup
Create `.env.local` in the web3-crowdfunding directory:
```env
CLIENT_ID=your_thirdweb_client_id
```

### 3. Start Development
```bash
npm run dev:all
```

## 🎯 User Flow

1. **User visits Conservation Insights page**
2. **Clicks "Start Conservation Project"**
3. **Redirects to crowdfunding platform** (new tab at localhost:3002)
4. **Creates campaign** with project details
5. **Adds funding tiers** for different contribution levels
6. **Shares campaign** for community funding
7. **Manages campaign** through dashboard

## 🔐 Admin Features

### Admin Panel Access
- **URL**: http://localhost:3000/admin
- **Password**: `admin123`
- **Features**:
  - View all campaigns
  - Remove inappropriate campaigns
  - Monitor system status

### Campaign Management
- **Campaign Owners** can:
  - Add/remove funding tiers
  - Pause/unpause campaigns
  - Withdraw funds (if successful)
  - Extend deadlines

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 3000 and 3001 are available
   - Check if other services are running

2. **Dependencies**
   - Run `npm install` in both directories
   - Clear node_modules if issues persist

3. **Blockchain Connection**
   - Ensure MetaMask is installed
   - Connect to Sepolia testnet
   - Get test ETH from faucets

4. **Thirdweb Configuration**
   - Verify CLIENT_ID in environment
   - Check network configuration

### Debug Commands
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Features

### Oceanova Integration
- ✅ Seamless redirect to crowdfunding
- ✅ Conservation-focused campaign creation
- ✅ Marine ecosystem project funding

### Web3 Crowdfunding
- ✅ Smart contract-based campaigns
- ✅ Tiered funding system
- ✅ Automatic state management
- ✅ Refund system for failed campaigns
- ✅ Admin panel for moderation
- ✅ Real-time progress tracking

## 🔮 Future Enhancements

- [ ] Direct integration without redirect
- [ ] Conservation-specific campaign templates
- [ ] Integration with marine data APIs
- [ ] Automated campaign suggestions
- [ ] Multi-token support
- [ ] Mobile app integration

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Verify network connectivity
4. Ensure all dependencies are installed

---

**Note**: This integration requires both servers to be running for full functionality. The crowdfunding platform is a separate Next.js application that communicates with the blockchain.
