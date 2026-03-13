// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CertSBT.sol";

contract CertRegistry {
    struct Certificate {
        bytes32  certHash;       // The final CHAINED hash: keccak256(payload, lastCertHash)
        string   ipfsCID;        // IPFS Content Identifier
        address  issuer;         // Institution wallet address
        uint256  timestamp;      // Block timestamp when issued
        bool     revoked;        // Revocation flag
    }

    uint256 public certCount;
    mapping(uint256 => Certificate) public certificates;
    mapping(bytes32 => uint256) public hashToId;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) public studentCerts;
    
    // THE NOVELTY: Hash Chain Linking
    // Maps an institution address to the hash of their most recently issued certificate
    mapping(address => bytes32) public lastCertHash;

    address public admin;
    CertSBT public sbtContract;

    event CertificateIssued(uint256 indexed id, bytes32 indexed certHash, string ipfsCID, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(uint256 indexed id);
    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function setSBTContract(address _sbtAddress) external onlyAdmin {
        sbtContract = CertSBT(_sbtAddress);
    }

    function authorizeIssuer(address _issuer) external onlyAdmin {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    function deauthorizeIssuer(address _issuer) external onlyAdmin {
        authorizedIssuers[_issuer] = false;
        emit IssuerDeauthorized(_issuer);
    }

    /**
     * @dev Issues a new certificate, cryptographically linking it to the issuer's previous certificate
     * @param _payloadHash The SHA-256 (or keccak256) hash of the certificate data payload
     */
    function issueCertificate(
        bytes32 _payloadHash,
        string calldata _ipfsCID,
        address _student,
        string calldata _metadataURI
    ) external onlyAuthorized returns (uint256) {
        // Calculate the chained hash: keccak256(payloadHash + lastCertHash)
        bytes32 chainedHash = keccak256(abi.encodePacked(_payloadHash, lastCertHash[msg.sender]));
        require(hashToId[chainedHash] == 0, "Cert hash collision/duplicate");
        
        certCount++;
        certificates[certCount] = Certificate({
            certHash: chainedHash,
            ipfsCID: _ipfsCID,
            issuer: msg.sender,
            timestamp: block.timestamp,
            revoked: false
        });
        
        hashToId[chainedHash] = certCount;
        studentCerts[_student].push(certCount);
        
        // Update the chain head for this issuer
        lastCertHash[msg.sender] = chainedHash;
        
        // Mint the Soulbound Token
        if (address(sbtContract) != address(0)) {
            sbtContract.mint(_student, _metadataURI);
        }

        emit CertificateIssued(certCount, chainedHash, _ipfsCID, msg.sender, block.timestamp);
        return certCount;
    }

    function verifyCertificate(bytes32 _certHash) external view returns (
        bool exists,
        uint256 id,
        string memory ipfsCID,
        address issuer,
        uint256 timestamp,
        bool revoked
    ) {
        id = hashToId[_certHash];
        if (id == 0) {
            return (false, 0, "", address(0), 0, false);
        }
        Certificate memory c = certificates[id];
        return (true, id, c.ipfsCID, c.issuer, c.timestamp, c.revoked);
    }

    function revokeCertificate(uint256 _id) external {
        require(_id > 0 && _id <= certCount, "Invalid certificate ID");
        require(
            msg.sender == certificates[_id].issuer || msg.sender == admin,
            "Not authorized to revoke"
        );
        require(!certificates[_id].revoked, "Already revoked");

        certificates[_id].revoked = true;
        emit CertificateRevoked(_id);
    }

    function getStudentCerts(address _student) external view returns (uint256[] memory) {
        return studentCerts[_student];
    }
}
