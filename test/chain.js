import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("CertificateChain — Hash Chain Linking", function () {
  let certChain;
  let admin, instA, instB, unauthorized;

  // Mock certificate identifiers (e.g., UUID hashes)
  const certId1 = ethers.id("uuid-cert-1");
  const certId2 = ethers.id("uuid-cert-2");
  const certId3 = ethers.id("uuid-cert-3");
  const certId4 = ethers.id("uuid-cert-4");

  // Mock certificate payloads (what IPFS would hash)
  const payloadHash1 = ethers.id("payload-data-1");
  const payloadHash2 = ethers.id("payload-data-2");
  const payloadHash3 = ethers.id("payload-data-3");
  const payloadHash4 = ethers.id("payload-data-4");

  beforeEach(async function () {
    // 1. Get test accounts
    [admin, instA, instB, unauthorized] = await ethers.getSigners();

    // 2. Deploy the CertificateChain contract
    const CertificateChain = await ethers.getContractFactory("CertificateChain");
    certChain = await CertificateChain.deploy();
    await certChain.waitForDeployment();

    // 3. Authorize the institutions
    await certChain.authorizeIssuer(instA.address);
    await certChain.authorizeIssuer(instB.address);
  });

  describe("Core Hashing & Chaining Logic", function () {
    it("Should issue 3 certificates sequentially and prove chain dependence", async function () {
      // 1. Issue Certificate 1 (Chained to bytes32(0))
      await certChain.connect(instA).issueCertificate(certId1, payloadHash1);
      const cert1 = await certChain.verifyCertificate(certId1);
      
      const expectedHash1 = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [payloadHash1, ethers.ZeroHash]
      );
      expect(cert1.chainedHash).to.equal(expectedHash1);

      // 2. Issue Certificate 2 (Chained to Certificate 1)
      await certChain.connect(instA).issueCertificate(certId2, payloadHash2);
      const cert2 = await certChain.verifyCertificate(certId2);
      
      const expectedHash2 = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [payloadHash2, cert1.chainedHash]
      );
      expect(cert2.chainedHash).to.equal(expectedHash2);

      // 3. Issue Certificate 3 (Chained to Certificate 2)
      await certChain.connect(instA).issueCertificate(certId3, payloadHash3);
      const cert3 = await certChain.verifyCertificate(certId3);
      
      // THE CRUCIAL MATHEMATICAL PROOF:
      // If we recompute the hash using payload 3 + Cert 2's hash, it MUST match Cert 3's hash
      const expectedHash3 = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [payloadHash3, cert2.chainedHash]
      );
      expect(cert3.chainedHash).to.equal(expectedHash3);
      expect(cert3.exists).to.be.true;
    });

    it("Should keep Institution B's chain isolated from Institution A's chain", async function () {
      // Inst A issues cert 1
      await certChain.connect(instA).issueCertificate(certId1, payloadHash1);
      
      // Inst B issues cert 2 (should chain to ZeroHash, not Inst A's cert)
      await certChain.connect(instB).issueCertificate(certId2, payloadHash2);
      const cert2 = await certChain.verifyCertificate(certId2);
      
      const expectedHashB = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [payloadHash2, ethers.ZeroHash]
      );
      expect(cert2.chainedHash).to.equal(expectedHashB);
      expect(cert2.issuer).to.equal(instB.address);
    });
  });

  describe("Security & Access Control", function () {
    it("Should reject duplicate certificate IDs", async function () {
      await certChain.connect(instA).issueCertificate(certId1, payloadHash1);
      
      await expect(
        certChain.connect(instA).issueCertificate(certId1, payloadHash2)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("Should reject issuance from unauthorized issuers", async function () {
      await expect(
        certChain.connect(unauthorized).issueCertificate(certId1, payloadHash1)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow the issuer to revoke a certificate", async function () {
      await certChain.connect(instA).issueCertificate(certId1, payloadHash1);
      
      await expect(certChain.connect(instA).revokeCertificate(certId1))
        .to.emit(certChain, "CertificateRevoked")
        .withArgs(certId1);

      const cert1 = await certChain.verifyCertificate(certId1);
      expect(cert1.isRevoked).to.be.true;
    });

    it("Should prevent unauthorized users from revoking someone else's certificate", async function () {
      await certChain.connect(instA).issueCertificate(certId1, payloadHash1);
      
      await expect(
        certChain.connect(unauthorized).revokeCertificate(certId1)
      ).to.be.revertedWith("Only issuer or admin can revoke");

      // Inst B also shouldn't be able to revoke Inst A's cert
      await expect(
        certChain.connect(instB).revokeCertificate(certId1)
      ).to.be.revertedWith("Only issuer or admin can revoke");
    });
  });
});
