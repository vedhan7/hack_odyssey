export const uploadFileToIPFS = async (file) => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Pinata API keys not found in environment variables.");
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `CertChain_${file.name}`,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
      body: formData,
    });
    const resData = await res.json();
    if (resData.error) {
       throw new Error(resData.error.details || resData.error);
    }
    return resData.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error uploading to IPFS via Pinata:", error);
    throw error;
  }
};

export const uploadJSONToIPFS = async (jsonData) => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Pinata API keys not found in environment variables.");
  }

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
      body: JSON.stringify({
        pinataOptions: { cidVersion: 0 },
        pinataMetadata: { name: `CertChain_SBT_Metadata` },
        pinataContent: jsonData
      }),
    });
    const resData = await res.json();
    if (resData.error) {
       throw new Error(resData.error.details || resData.error);
    }
    return `ipfs://${resData.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading JSON to IPFS via Pinata:", error);
    throw error;
  }
};
