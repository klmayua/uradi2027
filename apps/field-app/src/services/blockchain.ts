import { ethers } from 'ethers';
import { create as ipfsCreate } from 'ipfs-http-client';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';

// IPFS Configuration
const IPFS_CONFIG = {
  host: process.env.EXPO_PUBLIC_IPFS_HOST || 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from(
      `${process.env.EXPO_PUBLIC_IPFS_PROJECT_ID}:${process.env.EXPO_PUBLIC_IPFS_SECRET}`
    ).toString('base64'),
  },
};

// Blockchain Configuration
const BLOCKCHAIN_CONFIG = {
  rpcUrl: process.env.EXPO_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
  contractAddress: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '',
  privateKey: process.env.EXPO_PUBLIC_WALLET_PRIVATE_KEY || '',
};

// Evidence Anchor Contract ABI (simplified)
const CONTRACT_ABI = [
  'function anchorEvidence(bytes32 imageHash, string memory metadataHash) public returns (bool)',
  'function getEvidence(bytes32 imageHash) public view returns (string memory, uint256)',
  'event EvidenceAnchored(bytes32 indexed imageHash, string metadataHash, uint256 timestamp)',
];

export interface BlockchainEvidence {
  imageHash: string;
  metadataHash: string;
  ipfsHash: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  verificationUrl: string;
}

export interface EvidenceMetadata {
  imageHash: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
  };
  timestamp: number;
  deviceFingerprint: string;
  pollingUnitCode: string;
  evidenceType: string;
}

class BlockchainService {
  private ipfsClient: any;
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  constructor() {
    // Initialize IPFS client
    this.ipfsClient = ipfsCreate(IPFS_CONFIG);
  }

  // Initialize blockchain connection
  async initialize(): Promise<void> {
    if (!BLOCKCHAIN_CONFIG.privateKey || !BLOCKCHAIN_CONFIG.contractAddress) {
      console.warn('Blockchain not configured');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);
    this.wallet = new ethers.Wallet(BLOCKCHAIN_CONFIG.privateKey, this.provider);
    this.contract = new ethers.Contract(
      BLOCKCHAIN_CONFIG.contractAddress,
      CONTRACT_ABI,
      this.wallet
    );
  }

  // Calculate SHA-256 hash of image
  async calculateImageHash(imageUri: string): Promise<string> {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Calculate SHA-256 hash
      const hash = CryptoJS.SHA256(base64).toString();
      return hash;
    } catch (error) {
      console.error('Error calculating image hash:', error);
      throw error;
    }
  }

  // Upload to IPFS
  async uploadToIPFS(imageUri: string, metadata: EvidenceMetadata): Promise<{ imageHash: string; metadataHash: string }> {
    try {
      // Read image file
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to buffer
      const buffer = Buffer.from(base64, 'base64');

      // Upload image to IPFS
      const imageResult = await this.ipfsClient.add(buffer);
      const imageHash = imageResult.cid.toString();

      // Create metadata JSON
      const metadataJson = {
        ...metadata,
        ipfsImageUrl: `ipfs://${imageHash}`,
      };

      // Upload metadata to IPFS
      const metadataResult = await this.ipfsClient.add(JSON.stringify(metadataJson));
      const metadataHash = metadataResult.cid.toString();

      return { imageHash, metadataHash };
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  // Anchor evidence to blockchain
  async anchorToBlockchain(imageHash: string, metadataHash: string): Promise<BlockchainEvidence> {
    if (!this.contract || !this.wallet) {
      throw new Error('Blockchain not initialized');
    }

    try {
      // Convert imageHash to bytes32
      const imageHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(imageHash));

      // Send transaction
      const tx = await this.contract.anchorEvidence(imageHashBytes32, metadataHash);

      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        imageHash,
        metadataHash,
        ipfsHash: metadataHash,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        verificationUrl: `https://polygonscan.com/tx/${receipt.hash}`,
      };
    } catch (error) {
      console.error('Error anchoring to blockchain:', error);
      throw error;
    }
  }

  // Full evidence anchoring pipeline
  async anchorEvidence(
    imageUri: string,
    metadata: EvidenceMetadata
  ): Promise<BlockchainEvidence> {
    try {
      // 1. Calculate image hash
      const imageHash = await this.calculateImageHash(imageUri);

      // 2. Upload to IPFS
      const { metadataHash } = await this.uploadToIPFS(imageUri, {
        ...metadata,
        imageHash,
      });

      // 3. Anchor to blockchain
      const blockchainResult = await this.anchorToBlockchain(imageHash, metadataHash);

      return blockchainResult;
    } catch (error) {
      console.error('Error in anchor evidence pipeline:', error);
      throw error;
    }
  }

  // Verify evidence on blockchain
  async verifyEvidence(imageHash: string): Promise<{
    exists: boolean;
    metadataHash?: string;
    timestamp?: number;
  }> {
    if (!this.contract) {
      throw new Error('Blockchain not initialized');
    }

    try {
      const imageHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(imageHash));
      const result = await this.contract.getEvidence(imageHashBytes32);

      return {
        exists: result[1] > 0, // timestamp > 0 means exists
        metadataHash: result[0],
        timestamp: Number(result[1]),
      };
    } catch (error) {
      console.error('Error verifying evidence:', error);
      return { exists: false };
    }
  }

  // Get IPFS gateway URL
  getIPFSUrl(ipfsHash: string, gateway: string = 'https://ipfs.io'): string {
    return `${gateway}/ipfs/${ipfsHash}`;
  }

  // Estimate gas for anchoring
  async estimateGas(imageHash: string, metadataHash: string): Promise<ethers.BigNumber> {
    if (!this.contract) {
      throw new Error('Blockchain not initialized');
    }

    const imageHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(imageHash));
    const gasEstimate = await this.contract.anchorEvidence.estimateGas(
      imageHashBytes32,
      metadataHash
    );

    return gasEstimate;
  }
}

// Create singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
