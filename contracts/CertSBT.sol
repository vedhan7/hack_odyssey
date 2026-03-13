// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CertSBT is ERC721 {
    uint256 private _tokenIdCounter;
    address public registry; // Address of the CertRegistry contract

    mapping(uint256 => string) private _tokenURIs;

    event SBTMinted(address indexed student, uint256 tokenId, string uri);

    modifier onlyRegistry() {
        require(msg.sender == registry, "Only registry can mint");
        _;
    }

    constructor() ERC721("CertChain Credential", "CERT") {
        // Registry address will be set later to allow circular dependency resolution if needed,
        // or passed in. We'll add a setter or pass it in constructor. Let's pass it in constructor
        // or set it later. Let's use a setter for easier deployment.
    }

    function setRegistry(address _registry) external {
        require(registry == address(0), "Registry already set");
        registry = _registry;
    }

    function mint(address student, string calldata uri) external onlyRegistry returns (uint256) {
        _tokenIdCounter++;
        _mint(student, _tokenIdCounter);
        _tokenURIs[_tokenIdCounter] = uri;
        emit SBTMinted(student, _tokenIdCounter, uri);
        return _tokenIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // SOULBOUND: Block all transfers by reverting inside _update override
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // If from is not address 0, it means it's a transfer (not a mint). We revert.
        require(from == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }
}
