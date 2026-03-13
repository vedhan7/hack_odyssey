import { ethers } from 'ethers';
import CertRegistryABI from '../data/abi/contracts/CertRegistry.sol/CertRegistry.json';
import CertSBTABI from '../data/abi/contracts/CertSBT.sol/CertSBT.json';

const getRegistryContract = (signerOrProvider) => {
  const address = import.meta.env.VITE_CERT_REGISTRY_ADDRESS;
  if (!address) throw new Error("Registry address not found in env");
  return new ethers.Contract(address, CertRegistryABI.abi, signerOrProvider);
};

const getSBTContract = (signerOrProvider) => {
  const address = import.meta.env.VITE_CERT_SBT_ADDRESS;
  if (!address) throw new Error("SBT address not found in env");
  return new ethers.Contract(address, CertSBTABI.abi, signerOrProvider);
};

export const issueCertificateOnChain = async (signer, hash, ipfsCID, studentWallet, metadataURI) => {
  const registry = getRegistryContract(signer);
  const tx = await registry.issueCertificate(hash, ipfsCID, studentWallet, metadataURI);
  const receipt = await tx.wait();
  
  // Find the CertificateIssued event
  const event = receipt.logs
    .map(log => {
      try { return registry.interface.parseLog(log) } catch (e) { return null }
    })
    .find(e => e && e.name === 'CertificateIssued');
    
  return {
    certId: event ? Number(event.args[0]) : null,
    txHash: receipt.hash
  };
};

export const verifyCertificateOnChain = async (provider, hash) => {
  const registry = getRegistryContract(provider);
  const result = await registry.verifyCertificate(hash);
  return {
    exists: result.exists,
    id: Number(result.id),
    ipfsCID: result.ipfsCID,
    issuer: result.issuer,
    timestamp: Number(result.timestamp),
    revoked: result.revoked
  };
};

export const revokeCertificateOnChain = async (signer, certId) => {
  const registry = getRegistryContract(signer);
  const tx = await registry.revokeCertificate(certId);
  await tx.wait();
  return tx.hash;
};

export const getStudentCertificates = async (providerOrSigner, studentAddress) => {
  const registry = getRegistryContract(providerOrSigner);
  return await registry.getStudentCerts(studentAddress);
};

export const authorizeIssuerOnChain = async (signer, issuerAddress) => {
  const registry = getRegistryContract(signer);
  const tx = await registry.authorizeIssuer(issuerAddress);
  await tx.wait();
  return tx.hash;
};
