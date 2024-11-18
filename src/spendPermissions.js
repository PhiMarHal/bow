// spendPermissions.js
import { ethers } from 'ethers';

export class SpendPermissionManager {
    constructor(smartWalletManager, config) {
        this.smartWalletManager = smartWalletManager;
        this.config = config;
        this.contract = null;
        this.spenderAddress = null;
        this.spenderSigner = null;
    }

    async initialize() {
        try {
            // Get contract instance
            this.contract = new ethers.Contract(
                this.config.SPEND_PERMISSION_MANAGER.address,
                this.config.SPEND_PERMISSION_MANAGER.abi,
                this.smartWalletManager.provider
            );

            // Load spender configuration
            this.spenderAddress = import.meta.env.VITE_SPENDER_ADDRESS;
            const spenderPrivateKey = import.meta.env.VITE_SPENDER_PRIVATE_KEY;
            if (!this.spenderAddress || !spenderPrivateKey) {
                throw new Error('Spender configuration missing');
            }

            // Create spender signer
            this.spenderSigner = new ethers.Wallet(
                spenderPrivateKey,
                this.smartWalletManager.provider
            );

            // Get contract with spender signer
            this.spenderContract = this.contract.connect(this.spenderSigner);

        } catch (error) {
            console.error('Error initializing spend permissions:', error);
            throw error;
        }
    }

    createPermission(userAddress) {
        // Create a spend permission object for the user to sign
        return {
            account: userAddress,
            spender: this.spenderAddress,
            token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
            allowance: ethers.utils.parseEther("0.01"), // Allow spending 0.01 ETH
            period: 86400, // 1 day in seconds
            start: 0, // Start immediately
            end: 281474976710655, // Max uint48
            salt: 0,
            extraData: "0x"
        };
    }

    async getPermissionSignature(spendPermission) {
        // Prepare the typed data for signing
        const domain = {
            name: "Spend Permission Manager",
            version: "1",
            chainId: await this.smartWalletManager.provider.getNetwork().then(n => n.chainId),
            verifyingContract: this.config.SPEND_PERMISSION_MANAGER.address
        };

        const types = {
            SpendPermission: [
                { name: "account", type: "address" },
                { name: "spender", type: "address" },
                { name: "token", type: "address" },
                { name: "allowance", type: "uint160" },
                { name: "period", type: "uint48" },
                { name: "start", type: "uint48" },
                { name: "end", type: "uint48" },
                { name: "salt", type: "uint256" },
                { name: "extraData", type: "bytes" }
            ]
        };

        // Get signature from user's wallet
        const signature = await this.smartWalletManager.signer._signTypedData(
            domain,
            types,
            spendPermission
        );

        return signature;
    }

    async approvePermission(spendPermission, signature) {
        try {
            // Call approveWithSignature with the spender's signer
            const tx = await this.spenderContract.approveWithSignature(
                spendPermission,
                signature
            );
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error approving spend permission:', error);
            throw error;
        }
    }

    async spend(spendPermission, amount) {
        try {
            // Convert amount to wei
            const value = ethers.utils.parseEther(amount.toString());

            // Call spend function with the spender's signer
            const tx = await this.spenderContract.spend(
                spendPermission,
                value
            );
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error('Error spending:', error);
            throw error;
        }
    }
}