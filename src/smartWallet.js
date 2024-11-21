// smartWallet.js
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import { CONFIG } from './config';

class SmartWalletManager {
    constructor() {
        this.sdk = createCoinbaseWalletSDK({
            appName: "Based On What?",
            appChainIds: [8453],
            preference: {
                options: "smartWalletOnly",
                attribution: {
                    auto: true
                }
            }
        });

        this.provider = null;
        this.ethersProvider = null;
        this.signer = null;
        this.userAddress = null;
        this.contract = null;
    }

    async connect() {
        try {
            // Changed from makeWeb3Provider to getProvider
            this.provider = this.sdk.getProvider();

            // Rest stays the same
            this.ethersProvider = new ethers.providers.Web3Provider(this.provider);
            this.signer = this.ethersProvider.getSigner();

            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });

            this.userAddress = accounts[0];

            this.contract = new ethers.Contract(
                CONFIG.CONTRACT_ADDRESS,
                CONFIG.CONTRACT_ABI,
                this.signer
            );

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