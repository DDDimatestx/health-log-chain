import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { MedJournalABI } from '@/contracts/MedJournalABI';

// Replace this address with your deployed contract address
const CONTRACT_ADDRESS = "0xe322b1488dacac9a6f517f913f1a27fa1e52d9b9";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        setProvider(provider);
        
        // Check if we're on Sepolia testnet
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111n) {
          toast({
            title: "Wrong Network",
            description: "Please switch to Sepolia testnet",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const setupEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setProvider(null);
      } else {
        setAccount(accounts[0]);
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this application",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setProvider(provider);
      
      // Check and switch to Sepolia if needed
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Network not added to MetaMask
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
              }]
            });
          }
        }
      }
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const signAndSubmitHash = async (dataHash: string): Promise<string> => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedJournalABI, signer);
      
      // Convert hash string to bytes32
      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(dataHash));
      
      // Call recordEntry function in smart contract
      const tx = await contract.recordEntry(hashBytes32, ""); // empty IPFS hash for now
      
      toast({
        title: "Transaction Sent",
        description: "Waiting for blockchain confirmation...",
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast({
        title: "Entry Saved to Blockchain",
        description: `Transaction: ${receipt.hash}`,
      });
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Smart contract error:', error);
      throw new Error(`Failed to record on blockchain: ${error.message}`);
    }
  };

  // New function to verify entry on blockchain
  const verifyEntryOnChain = async (dataHash: string) => {
    if (!provider) {
      return { exists: false, message: "Wallet not connected" };
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedJournalABI, provider);
      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(dataHash));
      
      const [exists, user, timestamp, ipfsHash] = await contract.verifyEntry(hashBytes32);
      
      return {
        exists,
        user,
        timestamp: timestamp ? new Date(Number(timestamp) * 1000) : null,
        ipfsHash
      };
    } catch (error: any) {
      console.error('Verification error:', error);
      return { exists: false, error: error.message };
    }
  };

  return {
    account,
    isConnecting,
    provider,
    connectWallet,
    signAndSubmitHash,
    verifyEntryOnChain
  };
};