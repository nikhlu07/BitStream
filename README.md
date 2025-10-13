# BitStream ⚡

> Bitcoin-native micropayment streaming platform for exclusive content creators

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-sBTC-5546FF)](https://stacks.co)
[![Turnkey](https://img.shields.io/badge/Wallets-Turnkey-00D4AA)](https://turnkey.com)

BitStream enables creators to monetize *exclusive content* in real-time through frictionless Bitcoin micropayments. Users stream tiny sBTC payments per second/minute of content consumed with *complete anonymity and privacy—no crypto knowledge required. Creators receive **instant payments* with every second of content consumed.

## 🎯 Problem Statement

Traditional content monetization platforms suffer from:
- High payment processing fees (3-5%)
- Delayed payouts (weeks/months)
- Geographic restrictions
- Complex onboarding for creators and consumers
- No granular pay-per-second models
- *Privacy concerns*: Viewers' identities and viewing habits exposed
- *Security risks*: Payment data vulnerable to breaches
- *Creator safety*: Payment information tied to personal identity
- *Limited exclusive content*: No anonymous, secure payment infrastructure

## 💡 Solution

BitStream leverages *sBTC* on Stacks and *Turnkey's embedded wallets* to create a *privacy-first, secure micropayment experience* for exclusive content where:
- *Anonymous viewing*: Users consume content without revealing identity
- *Instant creator payments*: Real-time sBTC settlements per second of content
- *Pseudonymous accounts*: No KYC, no personal data collection
- *Secure payments*: Bitcoin-level security with smart contract automation
- Users pay only for what they consume (per-second streaming)
- Zero crypto complexity—sign up with email/passkey
- Perfect for exclusive content creators who value privacy and safety

## ✨ Key Features

### For Users
- *Anonymous Access*: Watch exclusive content without revealing identity
- *Email/Passkey Signup*: No seed phrases, no wallet downloads, no KYC
- *Auto-Generated Wallets*: Turnkey-powered embedded wallets created on signup
- *Pre-Loaded Testnet sBTC*: Ready to start consuming content immediately
- *Privacy-Protected Payments*: Transactions pseudonymous via Bitcoin
- *Automatic Micropayments*: Set-and-forget streaming payments while consuming content
- *One-Click Tipping*: Boost creators during live streams with instant sBTC tips
- *No Payment Data Storage*: Zero credit card or banking information required

### For Creators
- *Instant Payments*: Receive sBTC in real-time as content is consumed—no waiting periods
- *Protected Identity*: Create under pseudonym without exposing personal payment details
- *Flexible Rate Setting*: Configure per-minute or per-second rates
- *Real-Time Analytics*: Track earnings, viewer count, and engagement live (without viewer identities)
- *Instant Withdrawals*: Access your sBTC earnings immediately to any Bitcoin wallet
- *Multi-Content Support*: Podcasts, live streams, written content, video, exclusive material
- *No Chargebacks*: Bitcoin finality ensures payments are irreversible
- *Geographic Freedom*: Accept payments from anywhere without restrictions

### Technical Highlights
- *Smart Contract Streaming*: Clarity contracts handle automated micropayment releases
- *sBTC Programmability*: Demonstrates novel Bitcoin Layer 2 use cases
- *Embedded Wallet UX*: Showcase superior non-custodial wallet experience
- *Full Transaction Lifecycle*: End-to-end sBTC minting, streaming, and settlement

## 🏗 Architecture


┌─────────────────┐
│  React Client   │
│  Email/Passkey  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Turnkey SDK    │
│ Embedded Wallet │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Node.js API   │◄────►│  Stacks Network  │
│    (Express)    │      │  (Clarity Smart  │
└────────┬────────┘      │   Contracts)     │
         │               └──────────────────┘
         ▼
┌─────────────────┐
│   PostgreSQL    │
│  (User/Content) │
└─────────────────┘


## 🛠 Tech Stack

*Frontend*
- React 18
- TypeScript
- Tailwind CSS
- React Query
- React Router

*Backend*
- Node.js + Express
- Turnkey SDK (Wallet Infrastructure)
- @stacks/transactions (sBTC interactions)
- Clarity Smart Contracts

*Database*
- PostgreSQL (User profiles, content metadata)

*Blockchain*
- Stacks Testnet
- sBTC (Bitcoin L2)

## 🚀 Getting Started

### Prerequisites

bash
node >= 18.x
npm >= 9.x
postgresql >= 14.x


### Installation

1. *Clone the repository*
bash
git clone https://github.com/yourusername/bitstream.git
cd bitstream


2. *Install dependencies*

Frontend:
bash
cd client
npm install


Backend:
bash
cd ../server
npm install


3. *Environment Setup*

Frontend (client/.env):
bash
cp .env.example .env


env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_TURNKEY_API_PUBLIC_KEY=your_public_key
REACT_APP_STACKS_NETWORK=testnet
REACT_APP_SBTC_CONTRACT_ADDRESS=your_contract_address


Backend (server/.env):
bash
cp .env.example .env


env
# Turnkey API Credentials
TURNKEY_API_PRIVATE_KEY=your_private_key
TURNKEY_ORGANIZATION_ID=your_org_id

# Stacks Network
STACKS_NETWORK=testnet
SBTC_CONTRACT_ADDRESS=your_contract_address

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bitstream

# Server Config
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret


4. *Database Setup*
bash
cd server
npm run db:migrate
npm run db:seed


5. *Deploy Smart Contracts*
bash
npm run contracts:deploy


6. *Start Development Servers*

Backend:
bash
cd server
npm run dev


Frontend (in new terminal):
bash
cd client
npm start


Visit http://localhost:3000

## 📁 Project Structure


bitstream/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── creator/    # Creator dashboard components
│   │   │   ├── consumer/   # Content consumption UI
│   │   │   └── common/     # Shared components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   │   ├── api.js      # Axios instance
│   │   │   ├── turnkey.js  # Turnkey wallet utilities
│   │   │   └── stacks.js   # Stacks/sBTC helpers
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Helper functions
│   │   └── App.js          # Root component
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   │   ├── auth.js     # Authentication
│   │   │   ├── content.js  # Content management
│   │   │   ├── streaming.js # Payment streaming
│   │   │   └── wallet.js   # Wallet operations
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.js     # JWT verification
│   │   │   └── validation.js # Input validation
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── turnkey.js  # Turnkey integration
│   │   │   ├── stacks.js   # Stacks blockchain
│   │   │   └── streaming.js # Payment logic
│   │   ├── config/         # Configuration
│   │   │   ├── database.js # DB connection
│   │   │   └── stacks.js   # Stacks config
│   │   └── server.js       # Express app entry
│   └── package.json
│
└── contracts/              # Clarity smart contracts
    ├── streaming.clar      # Micropayment streaming logic
    └── tipping.clar        # One-click tipping contract


## 🎮 Usage

### As a Consumer

1. *Sign Up*: Create account with email or passkey
2. *Browse Content*: Discover creators and content
3. *Start Streaming*: Click play—micropayments stream automatically
4. *Tip Creators*: Send one-click sBTC boosts during live content

### As a Creator

1. *Create Profile*: Set up your creator account
2. *Upload Content*: Add podcasts, videos, or livestream
3. *Set Your Rate*: Configure per-minute sBTC pricing
4. *Go Live*: Start earning as users consume your content
5. *Withdraw*: Instant sBTC withdrawal to your Bitcoin wallet

## 📝 Smart Contract Interfaces

### Streaming Contract

clarity
;; Start streaming payment
(define-public (start-stream 
    (creator principal) 
    (rate-per-minute uint))
    ;; Implementation
)

;; Stop streaming and settle payment
(define-public (stop-stream 
    (stream-id uint))
    ;; Implementation
)


### Tipping Contract

clarity
;; Send tip to creator
(define-public (send-tip 
    (creator principal) 
    (amount uint))
    ;; Implementation
)


## 🔐 Security Considerations

*Privacy & Anonymity*
- *No KYC Required*: Users and creators can remain pseudonymous
- *Minimal Data Collection*: Only essential information (email/passkey) stored
- *Pseudonymous Transactions*: Payments via Bitcoin addresses, not personal identities
- *No Viewing History Tracking*: Content consumption data not linked to real identities
- *Encrypted Communications*: All data in transit protected via HTTPS/TLS

*Payment Security*
- *Embedded Wallets*: Non-custodial—users control keys via Turnkey's secure enclave
- *Smart Contract Automation*: Reduces human error and fraud vectors
- *No Credit Card Storage*: Zero traditional payment data collected
- *Instant Settlement*: Bitcoin finality prevents chargebacks and disputes
- *Multi-Signature Options*: Available for high-value creator accounts

*Platform Security*
- *Smart Contract Audits*: (Pending for production)
- *Rate Limiting*: API protection against abuse and DDoS
- *Input Validation*: All user inputs sanitized to prevent injection attacks
- *HTTPS Only*: All production traffic encrypted
- *Secure Key Management*: Turnkey's institutional-grade key infrastructure
- *Regular Security Updates*: Dependencies monitored and patched

*Creator Safety*
- *Payout Anonymity*: Withdraw to any Bitcoin address—no personal banking details
- *Content Access Control*: Smart contract-enforced payment verification
- *Anti-Piracy*: Streaming verification prevents unauthorized redistribution
- *Dispute Resolution*: Transparent on-chain transaction records

## 🧪 Testing

bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
npm test

# Smart contract tests
npm run test:contracts

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e


## 🗺 Roadmap

*MVP (Current)*
- [x] Turnkey embedded wallet integration
- [x] Basic streaming payment contract
- [x] Creator dashboard
- [x] Consumer content player
- [x] Testnet sBTC integration

*Phase 2*
- [ ] Mainnet launch
- [ ] Mobile responsive optimization
- [ ] Advanced analytics for creators
- [ ] Multi-tier subscription options
- [ ] Content recommendation engine

*Phase 3*
- [ ] Mobile apps (iOS/Android)
- [ ] Creator NFT badges
- [ ] Decentralized content storage (IPFS)
- [ ] Cross-chain support
- [ ] Advertising marketplace

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stacks Foundation](https://stacks.org) for sBTC infrastructure
- [Turnkey](https://turnkey.com) for embedded wallet technology
- Bitcoin community for continuous innovation

*Built with ⚡ at [Hackathon Name]*
