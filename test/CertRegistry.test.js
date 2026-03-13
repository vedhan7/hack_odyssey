import { expect } from "chai";
import { ethers } from "hardhat";

describe("CertRegistry and CertSBT", function () {
  let certRegistry;
  let certSBT;
  let admin, institution, student, unauthorized;

  const mockHash = ethers.id("test-certificate-hash");
  const mockIpfsCID = "QmTest123CID456";

  beforeEach(async function () {
    [admin, institution, student, unauthorized] = await ethers.getSigners();

    // 1. Deploy SBT Contract
    const CertSBT = await ethers.getContractFactory("CertSBT");
    certSBT = await CertSBT.deploy();
    await certSBT.waitForDeployment();

    // 2. Deploy Registry Contract
    const CertRegistry = await ethers.getContractFactory("CertRegistry");
    certRegistry = await CertRegistry.deploy();
    await certRegistry.waitForDeployment();

    // 3. Link them
    await certRegistry.setSBTContract(await certSBT.getAddress());
    await certSBT.setRegistry(await certRegistry.getAddress());

    // 4. Authorize institution
    await certRegistry.authorizeIssuer(institution.address);
  });

  describe("Issuance and Verification", function () {
    it("Should allow an authorized institution to issue a certificate", async function () {
      await expect(
        certRegistry.connect(institution).issueCertificate(
          mockHash,
          mockIpfsCID,
          student.address,
          "ipfs://metadata.json"
        )
      ).to.emit(certRegistry, "CertificateIssued")
        .withArgs(1, mockHash, mockIpfsCID, institution.address, (val) => val > 0);

      // Verify data on-chain
      const result = await certRegistry.verifyCertificate(mockHash);
      expect(result.exists).to.be.true;
      expect(result.ipfsCID).to.equal(mockIpfsCID);
      expect(result.issuer).to.equal(institution.address);
      expect(result.revoked).to.be.false;

      // Verify SBT was minted
      expect(await certSBT.ownerOf(1)).to.equal(student.address);
      expect(await certSBT.tokenURI(1)).to.equal("ipfs://metadata.json");
    });

    it("Should reject issuance from unauthorized wallets", async function () {
      await expect(
        certRegistry.connect(unauthorized).issueCertificate(
          mockHash,
          mockIpfsCID,
          student.address,
          "ipfs://metadata.json"
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should reject duplicate certificates (same hash)", async function () {
      await certRegistry.connect(institution).issueCertificate(mockHash, mockIpfsCID, student.address, "uri1");
      
      await expect(
        certRegistry.connect(institution).issueCertificate(mockHash, mockIpfsCID, student.address, "uri2")
      ).to.be.revertedWith("Cert already exists");
    });

    it("SBT should be non-transferable (soulbound)", async function () {
      await certRegistry.connect(institution).issueCertificate(mockHash, mockIpfsCID, student.address, "uri1");
      
      await expect(
        certSBT.connect(student).transferFrom(student.address, unauthorized.address, 1)
      ).to.be.revertedWith("Soulbound: non-transferable");
    });
  });

  describe("Revocation", function () {
    it("Should allow the institution to revoke its own certificate", async function () {
      await certRegistry.connect(institution).issueCertificate(mockHash, mockIpfsCID, student.address, "uri1");
      
      await expect(certRegistry.connect(institution).revokeCertificate(1))
        .to.emit(certRegistry, "CertificateRevoked")
        .withArgs(1);

      const result = await certRegistry.verifyCertificate(mockHash);
      expect(result.revoked).to.be.true;
    });

    it("Should prevent others from revoking", async function () {
      await certRegistry.connect(institution).issueCertificate(mockHash, mockIpfsCID, student.address, "uri1");
      
      await expect(certRegistry.connect(unauthorized).revokeCertificate(1))
        .to.be.revertedWith("Not authorized to revoke");
    });
  });
});
