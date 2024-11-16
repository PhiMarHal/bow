import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import { CONFIG } from './config';

class SmartWalletManager {
    constructor() {
        this.sdk = new CoinbaseWalletSDK({
            appName: "Based On What?",
            appChainIds: [8453],  // Base mainnet
        });

        this.provider = null;
        this.ethersProvider = null;
        this.signer = null;
        this.userAddress = null;
        this.contract = null;
    }

    async initialize() {
        try {
            // Create Web3 provider forcing smart wallet usage
            this.provider = this.sdk.makeWeb3Provider({
                options: 'smartWalletOnly'
            });

            // Create ethers provider wrapping the Web3 provider
            this.ethersProvider = new ethers.providers.Web3Provider(this.provider);

            // Get signer
            this.signer = this.ethersProvider.getSigner();

            // Initialize contract
            this.contract = new ethers.Contract(
                CONFIG.CONTRACT_ADDRESS,
                CONFIG.CONTRACT_ABI,
                this.signer
            );

            return true;
        } catch (error) {
            console.error('Error initializing smart wallet:', error);
            throw error;
        }
    }

    async connect() {
        try {
            // Request account access
            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });

            this.userAddress = accounts[0];
            return this.userAddress;
        } catch (error) {
            console.error('Error connecting smart wallet:', error);
            throw error;
        }
    }

    async getContractFunction() {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        return this.contract;
    }

    async disconnect() {
        try {
            // Clear local state
            this.userAddress = null;
            this.signer = null;

            // Close provider connection
            if (this.provider && this.provider.close) {
                await this.provider.close();
            }

            return true;
        } catch (error) {
            console.error('Error disconnecting smart wallet:', error);
            throw error;
        }
    }

    isConnected() {
        return !!this.userAddress;
    }
}

export const smartWalletManager = new SmartWalletManager();