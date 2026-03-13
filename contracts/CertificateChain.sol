// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateChain
 * @dev Implements a cryptographically linked Hash Chain for certificate issuance.
 * Each certificate issued by an institution is chained to their previously
 * issued certificate to prevent retroactive forgery or insertion.
 */
contract CertificateChain {
    
    // ==========================================
    // DATA STRUCTURES
    // ==========================================

    struct Certificate {
        bytes32 chainedHash;   // keccak256(payloadHash, lastCertHash[issuer])
        address issuer;        // Institution wallet address
        uint256 timestamp;     // Block timestamp when issued
        bool    isRevoked;     // Revocation flag
    }

    // ==========================================
    // STATE VARIABLES
    // ==========================================

    address public admin;

    // Maps an institution address to the hash of their most recently issued certificate
    mapping(address => bytes32) public lastCertHash;

    // Maps a unique certificate ID (e.g., UUID hash or predictable sequential ID) to its data
    mapping(bytes32 => Certificate) public certificates;

    // Whitelist of authorized institutions
    mapping(address => bool) public authorizedIssuers;

    // ==========================================
    // EVENTS
    // ==========================================

    event CertificateIssued(bytes32 indexed certId, bytes32 chainedHash, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed certId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);

    // ==========================================
    // MODIFIERS
    // ==========================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "Not authorized");
        _;
    }

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor() {
        admin = msg.sender;
        // For testing/demo purposes, we auto-authorize the deployer
        authorizedIssuers[msg.sender] = true;
    }

    // ==========================================
    // Core Chain Logic Implementation
    // ==========================================

    /**
     * @dev Authorize a new institution to issue certificates
     */
    function authorizeIssuer(address _issuer) external onlyAdmin {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    /**
     * @dev Revoke issuance rights from an institution
     */
    function deauthorizeIssuer(address _issuer) external onlyAdmin {
        authorizedIssuers[_issuer] = false;
        emit IssuerDeauthorized(_issuer);
    }

    /**
     * @dev Issues a new certificate, cryptographically linking it to the issuer's previous certificate
     * @param certId A unique identifier for the certificate (e.g., UUID hash)
     * @param payloadHash The SHA-256 hash of the certificate data payload
     */
    function issueCertificate(bytes32 certId, bytes32 payloadHash) external onlyAuthorized {
        require(certificates[certId].timestamp == 0, "Certificate ID already exists");

        // 1. Calculate the chained hash: keccak256(payloadHash + lastCertHash)
        // If this is the issuer's first cert, lastCertHash[msg.sender] will naturally be bytes32(0).
        bytes32 newChainedHash = keccak256(abi.encodePacked(payloadHash, lastCertHash[msg.sender]));

        // 2. Store the certificate data
        certificates[certId] = Certificate({
            chainedHash: newChainedHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isRevoked: false
        });

        // 3. Update the chain head for this issuer
        lastCertHash[msg.sender] = newChainedHash;

        // 4. Emit the event
        emit CertificateIssued(certId, newChainedHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifies a certificate and retrieves its data
     * @param certId The unique identifier of the certificate
     * @return exists Boolean indicating if the cert was issued
     * @return chainedHash The cryptographically chained hash
     * @return issuer The address of the institution that issued it
     * @return timestamp The block timestamp of issuance
     * @return isRevoked Boolean indicating if the certificate has been revoked
     */
    function verifyCertificate(bytes32 certId) external view returns (
        bool exists,
        bytes32 chainedHash,
        address issuer,
        uint256 timestamp,
        bool isRevoked
    ) {
        Certificate memory cert = certificates[certId];
        
        if (cert.timestamp == 0) {
            return (false, bytes32(0), address(0), 0, false);
        }

        return (true, cert.chainedHash, cert.issuer, cert.timestamp, cert.isRevoked);
    }

    /**
     * @dev Revokes a certificate by marking its state as revoked
     * @param certId The unique identifier of the certificate
     */
    function revokeCertificate(bytes32 certId) external {
        Certificate storage cert = certificates[certId];
        require(cert.timestamp != 0, "Certificate does not exist");
        require(
            msg.sender == cert.issuer || msg.sender == admin,
            "Only issuer or admin can revoke"
        );
        require(!cert.isRevoked, "Certificate already revoked");

        cert.isRevoked = true;
        emit CertificateRevoked(certId);
    }

}
