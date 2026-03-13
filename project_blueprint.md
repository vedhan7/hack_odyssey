# 🏗️ CertChain — Blockchain-Based Certificate Verification
### Hack Odyssey 3.0 | Project Blueprint

---

## 🎯 The North Star

> **Eliminate fake certificates by building a tamper-proof, blockchain-powered verification platform — where institutions issue, students own, and employers verify credentials in seconds, all at zero cost.**

---

## 🧬 Architecture (Matching Team Specification)

```
┌──────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────┐
│   FRONTEND PORTALS   │  │    APPLICATION LAYER        │  │   STORAGE LAYER     │
│                      │  │    (Backend API & Services) │  │   (Off-Chain)       │
│ ┌──────────────────┐ │  │                             │  │                     │
│ │ Institution      │ │  │  ┌───────────────────────┐  │  │  ┌───────────────┐  │
│ │ Portal (Admin)   │ │  │  │    API Gateway        │  │  │  │    IPFS       │  │
│ │                  │ │  │  └───────────┬───────────┘  │  │  │ (File Storage)│  │
│ │ • Issue Cert     │─┼──┤             │              │──┼──│  Pinata Free  │  │
│ │ • Batch Upload   │ │  │  ┌──────────▼──────────┐   │  │  └───────────────┘  │
│ └──────────────────┘ │  │  │ Authentication      │   │  │         │           │
│                      │  │  │ Service (JWT)       │   │  │  ┌──────▼────────┐  │
│ ┌──────────────────┐ │  │  └──────────┬──────────┘   │  │  │  Metadata DB  │  │
│ │ Student Wallet   │ │  │             │              │  │  │  (PostgreSQL  │  │
│ │ Portal           │ │  │  ┌──────────▼──────────┐   │  │  │   Supabase)   │  │
│ │                  │─┼──┤  │ Hash Generator      │   │  │  └───────────────┘  │
│ │ • View Certs     │ │  │  │ (SHA-256)           │   │  │                     │
│ │ • Share Link     │ │  │  └──────────┬──────────┘   │  └─────────────────────┘
│ └──────────────────┘ │  │             │              │
│                      │  │  ┌──────────▼──────────┐   │  ┌─────────────────────┐
│ ┌──────────────────┐ │  │  │ Web3 Integration    │   │  │  CONSENSUS LAYER   │
│ │ Public           │ │  │  │ (Ethers.js)         │───┼──│  (On-Chain)        │
│ │ Verification     │─┼──┤  └─────────────────────┘   │  │                     │
│ │ Portal           │ │  │                             │  │  ┌───────────────┐  │
│ │                  │ │  │     Transaction & Call      │  │  │ Smart Contract│  │
│ │ • Verify by ID   │ │  │             →               │  │  │ (Solidity)    │  │
│ └──────────────────┘ │  │                             │  │  │               │  │
│                      │  │                             │  │  │ Functions:    │  │
└──────────────────────┘  └─────────────────────────────┘  │  │ • issueCert() │  │
                                                           │  │ • verifyCert()│  │
                                                           │  │ • revokeCert()│  │
                                                           │  │               │  │
                                                           │  │ Data Mapping: │  │
                                                           │  │ ID → Hash +   │  │
                                                           │  │ CID + Issuer  │  │
                                                           │  │ + Time        │  │
                                                           │  └───────────────┘  │
                                                           │                     │
                                                           │  Blockchain Network │
                                                           │  (Polygon Amoy)     │
                                                           └─────────────────────┘
```

---

## 💰 Zero-Cost Tech Stack

### Frontend Portals

| Tool | Purpose | Cost |
|:-----|:--------|:-----|
| **React 18 + Vite** | SPA framework + blazing-fast bundler | ₹0 |
| **Tailwind CSS v4** | Utility-first styling + dark mode | ₹0 |
| **GSAP** | Premium animations (verify results, card effects) | ₹0 |
| **Lucide React** | Clean SVG icon library | ₹0 |
| **React Router v6** | Client-side SPA routing | ₹0 |
| **React Hot Toast** | Toast notification feedback | ₹0 |

### Application Layer

| Tool | Purpose | Cost |
|:-----|:--------|:-----|
| **Supabase Edge Functions** | API Gateway + business logic (Deno runtime) | ₹0 |
| **Supabase Auth (JWT)** | Authentication service issuing JWTs | ₹0 |
| **crypto-js (SHA-256)** | SHA-256 hash generator (matching architecture) | ₹0 |
| **ethers.js v6** | Web3 integration — frontend ↔ blockchain | ₹0 |

### Storage Layer (Off-Chain)

| Tool | Purpose | Cost |
|:-----|:--------|:-----|
| **Pinata (IPFS)** | Decentralized file storage for certificate PDFs | ₹0 (1GB free) |
| **Supabase PostgreSQL** | Metadata DB — rich certificate details | ₹0 (500MB free) |

### Consensus Layer (On-Chain)

| Tool | Purpose | Cost |
|:-----|:--------|:-----|
| **Polygon Amoy Testnet** | Blockchain network — zero gas fees | ₹0 |
| **Solidity ^0.8.20** | Smart contract language | ₹0 |
| **Hardhat** | Contract compile, test, deploy | ₹0 |
| **OpenZeppelin** | Audited ERC-721 base for SBT | ₹0 |
| **MetaMask** | Wallet + transaction signing | ₹0 |

### Additional Services

| Tool | Purpose | Cost |
|:-----|:--------|:-----|
| **Gemini 1.5 Flash** | AI-powered PDF text extraction for verification | ₹0 |
| **qrcode.react** | QR code generation for shareable links | ₹0 |
| **html2canvas + jsPDF** | Certificate PDF export | ₹0 |
| **Vercel** | Frontend hosting | ₹0 |
| **Inter + JetBrains Mono** | Typography (Google Fonts) | ₹0 |

---

## 📜 Smart Contract (Matching Architecture Spec)

The architecture specifies: `ID → Hash + CID + Issuer + Time`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertRegistry {
    struct Certificate {
        bytes32  certHash;       // SHA-256 hash of certificate data
        string   ipfsCID;        // IPFS Content Identifier (PDF/metadata)
        address  issuer;         // Institution wallet address
        uint256  timestamp;      // Block timestamp when issued
        bool     revoked;        // Revocation flag
    }

    uint256 public certCount;
    mapping(uint256 => Certificate) public certificates;   // ID → cert data
    mapping(bytes32 => uint256) public hashToId;           // hash → ID lookup
    mapping(address => bool) public authorizedIssuers;     // authorized institutions
    mapping(address => uint256[]) public studentCerts;     // student → cert IDs

    address public admin;

    event CertificateIssued(uint256 indexed id, bytes32 certHash,
                            string ipfsCID, address issuer, uint256 timestamp);
    event CertificateRevoked(uint256 indexed id);
    event IssuerAuthorized(address issuer);

    modifier onlyAdmin()      { require(msg.sender == admin, "Not admin"); _; }
    modifier onlyAuthorized() { require(authorizedIssuers[msg.sender], "Not authorized"); _; }

    constructor() { admin = msg.sender; }

    function authorizeIssuer(address _issuer) external onlyAdmin {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    // Core function: issueCertificate()
    function issueCertificate(
        bytes32 _certHash,
        string  calldata _ipfsCID,
        address _student
    ) external onlyAuthorized returns (uint256) {
        require(hashToId[_certHash] == 0, "Cert already exists");
        certCount++;
        certificates[certCount] = Certificate({
            certHash:  _certHash,
            ipfsCID:   _ipfsCID,
            issuer:    msg.sender,
            timestamp: block.timestamp,
            revoked:   false
        });
        hashToId[_certHash] = certCount;
        studentCerts[_student].push(certCount);
        emit CertificateIssued(certCount, _certHash, _ipfsCID, msg.sender, block.timestamp);
        return certCount;
    }

    // Core function: verifyCertificate()
    function verifyCertificate(bytes32 _certHash) external view
        returns (bool exists, uint256 id, string memory ipfsCID,
                 address issuer, uint256 timestamp, bool revoked)
    {
        id = hashToId[_certHash];
        if (id == 0) return (false, 0, "", address(0), 0, false);
        Certificate memory c = certificates[id];
        return (true, id, c.ipfsCID, c.issuer, c.timestamp, c.revoked);
    }

    // Core function: revokeCertificate()
    function revokeCertificate(uint256 _id) external {
        require(msg.sender == certificates[_id].issuer || msg.sender == admin, "Not authorized");
        certificates[_id].revoked = true;
        emit CertificateRevoked(_id);
    }

    function getStudentCerts(address _student) external view returns (uint256[] memory) {
        return studentCerts[_student];
    }
}
```

**Data mapping matches architecture spec:** `ID → Hash + CID + Issuer + Time`

---

## 📂 Project Structure

```
Hack_Odyssey_3.0/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── hardhat.config.js
├── .env.example
│
├── contracts/
│   ├── CertRegistry.sol              # Main contract (issue/verify/revoke)
│   └── CertSBT.sol                   # Soulbound Token (ERC-721, non-transferable)
│
├── scripts/
│   └── deploy.js                      # Hardhat deployment to Polygon Amoy
│
├── test/
│   └── CertRegistry.test.js          # Smart contract unit tests
│
├── src/
│   ├── main.jsx                       # React entry
│   ├── App.jsx                        # Router + layout
│   ├── index.css                      # Tailwind directives + design tokens
│   │
│   ├── components/
│   │   ├── Navbar.jsx                 # Role-aware navigation
│   │   ├── ConnectWallet.jsx          # MetaMask button
│   │   ├── CertificateCard.jsx        # Holographic cert display
│   │   ├── VerificationBadge.jsx      # Animated ✅/❌ result
│   │   ├── QRGenerator.jsx            # QR code for verification
│   │   ├── CertPDFExport.jsx          # Download cert as PDF
│   │   ├── IssueCertForm.jsx          # Single certificate form
│   │   ├── BatchUpload.jsx            # CSV/Excel batch upload
│   │   └── StatsCard.jsx              # Glassmorphism KPI card
│   │
│   ├── pages/
│   │   ├── Landing.jsx                # Hero + how it works + stats
│   │   ├── Login.jsx                  # JWT auth + wallet connect
│   │   ├── InstitutionPortal.jsx      # Issue certs + batch upload + table
│   │   ├── StudentWallet.jsx          # View certs + share links
│   │   ├── VerifyPortal.jsx           # Public verification (no login)
│   │   ├── BlockExplorer.jsx          # On-chain audit
│   │   └── AdminPanel.jsx             # Authorize institutions
│   │
│   ├── lib/
│   │   ├── supabase.js                # Supabase client init
│   │   ├── blockchain.js              # ethers.js + contract ABIs
│   │   ├── ipfs.js                    # Pinata IPFS upload (returns CID)
│   │   ├── hashGenerator.js           # SHA-256 hash generation
│   │   └── certificates.js            # Cert helpers (hash, verify, format)
│   │
│   ├── hooks/
│   │   ├── useWallet.js               # MetaMask connection state
│   │   ├── useCertificates.js         # Fetch certs from chain + DB
│   │   └── useVerify.js               # Verification result hook
│   │
│   └── data/
│       └── abi/
│           ├── CertRegistry.json      # Contract ABI
│           └── CertSBT.json           # SBT ABI
│
└── supabase/
    ├── migrations/
    │   └── 001_init.sql               # Tables: institutions, certificates, students
    └── functions/
        └── api-gateway/
            └── index.ts               # Edge function as API gateway
```

---

## 🗄️ Database Schema (Supabase PostgreSQL — Metadata DB)

### `institutions`
| Column | Type | Description |
|:-------|:-----|:------------|
| `id` | `uuid` | Primary key |
| `name` | `text` | Institution name |
| `wallet_address` | `text` | Ethereum address |
| `logo_url` | `text` | Logo URL |
| `auth_user_id` | `uuid` | FK → auth.users |
| `is_authorized` | `boolean` | Admin-approved |
| `created_at` | `timestamptz` | Timestamp |

### `certificates`
| Column | Type | Description |
|:-------|:-----|:------------|
| `id` | `uuid` | Primary key |
| `chain_id` | `int4` | On-chain certificate ID |
| `cert_hash` | `text` | SHA-256 hash |
| `ipfs_cid` | `text` | IPFS Content Identifier |
| `tx_hash` | `text` | Polygon transaction hash |
| `student_name` | `text` | Full name |
| `student_email` | `text` | Email |
| `student_wallet` | `text` | Wallet address |
| `institution_id` | `uuid` | FK → institutions |
| `degree` | `text` | Degree name |
| `specialization` | `text` | Field of study |
| `cgpa` | `decimal` | Grade |
| `date_issued` | `date` | Issue date |
| `status` | `text` | active / revoked |
| `created_at` | `timestamptz` | Record creation |

### `students`
| Column | Type | Description |
|:-------|:-----|:------------|
| `id` | `uuid` | FK → auth.users |
| `name` | `text` | Display name |
| `email` | `text` | Email |
| `wallet_address` | `text` | Connected wallet |

---

## 🎨 Design System

| Token | Value | Usage |
|:------|:------|:------|
| `--c-bg` | `#0a0e1a` | Deep midnight background |
| `--c-surface` | `#111827` | Card surfaces |
| `--c-accent` | `#3b82f6` | Primary blue (trust) |
| `--c-accent-glow` | `#60a5fa` | Hover glow |
| `--c-success` | `#22c55e` | Verified |
| `--c-danger` | `#ef4444` | Forged / revoked |
| `--c-warning` | `#f59e0b` | Pending |
| `--c-text` | `#e2e8f0` | Primary text |
| `--c-muted` | `#94a3b8` | Secondary text |

**Typography:** Inter + JetBrains Mono  
**Effects:** Glassmorphism, GSAP stagger-in, holographic cert shimmer

---

## 📋 Execution Phases

### Phase 1: Foundation
- [ ] Init Vite + React 18
- [ ] Install deps (Tailwind, GSAP, ethers.js, Supabase, crypto-js, etc.)
- [ ] Configure Tailwind v4 + design tokens
- [ ] Create `.env.example`

### Phase 2: Blockchain
- [ ] Write `CertRegistry.sol` + `CertSBT.sol`
- [ ] Write Hardhat tests
- [ ] Deploy to Polygon Amoy
- [ ] Create `blockchain.js`, `hashGenerator.js` (SHA-256), `ipfs.js`

### Phase 3: Auth & Layout
- [ ] Supabase Auth (JWT) + DB tables
- [ ] `App.jsx` with routes, `Navbar.jsx`, `Login.jsx`
- [ ] `ConnectWallet.jsx` + `useWallet.js`

### Phase 4: Institution Portal
- [ ] `InstitutionPortal.jsx` — issue + batch upload + table
- [ ] `IssueCertForm.jsx` — single cert issuance flow
- [ ] `BatchUpload.jsx` — CSV/Excel multi-cert upload
- [ ] Issue flow: SHA-256 hash → IPFS upload → smart contract → Supabase → email

### Phase 5: Student Wallet Portal
- [ ] `StudentWallet.jsx` — view certs + SBT tokens
- [ ] `CertificateCard.jsx` with holographic effect
- [ ] Share link + QR + PDF export

### Phase 6: Public Verification Portal
- [ ] `VerifyPortal.jsx` — verify by ID/hash/QR/PDF upload
- [ ] `VerificationBadge.jsx` — animated ✅/❌/⚠️
- [ ] Gemini AI PDF extraction

### Phase 7: Explorer & Admin
- [ ] `BlockExplorer.jsx` + `AdminPanel.jsx`

### Phase 8: Polish & Deploy
- [ ] Animations, responsive, emails, PDF gen
- [ ] Browser verification + deploy

---

## ✅ Verification Plan

### Smart Contract Tests
```bash
npx hardhat test
```
- Test issueCertificate stores correct hash + CID + issuer + timestamp
- Test verifyCertificate returns correct data
- Test revokeCertificate marks cert as revoked
- Test unauthorized issuers are rejected
- Test duplicate hashes are rejected

### Build Tests
```bash
npm run build   # Zero errors
npm run dev     # Dev server starts on localhost:5173
```

### Browser Verification
1. Connect MetaMask to Polygon Amoy
2. Issue a certificate from Institution Portal
3. Verify cert hash appears on blockchain
4. Check student wallet shows the cert
5. Verify via public portal (by ID, hash, QR)
6. Revoke cert and verify it shows as revoked
7. Upload PDF and verify via Gemini AI extraction

---

*Blueprint v3 — Matching Team Architecture • 2026-03-13*
