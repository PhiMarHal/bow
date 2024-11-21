// spendPermissions.js
import { ethers } from 'ethers';

export class SpendPermissionManager {
    constructor(smartWalletManager, config) {
        this.smartWalletManager = smartWalletManager;
        this.config = config;
        this.contract = null;
        this.spenderAddress = null;
        this.spenderSigner = null;
        this.spenderContract = null; // Add this
    }

    async initialize() {
        try {
            // Start with read-only provider
            const provider = new ethers.providers.JsonRpcProvider(this.config.RPC_URL);
            this.contract = new ethers.Contract(
                this.config.SPEND_PERMISSION_MANAGER.address,
                this.config.SPEND_PERMISSION_MANAGER.abi,
                provider
            );

            // Load spender configuration
            this.spenderAddress = import.meta.env.VITE_SPENDER_ADDRESS;
            const spenderPrivateKey = import.meta.env.VITE_SPENDER_PRIVATE_KEY;
            if (!this.spenderAddress || !spenderPrivateKey) {
                throw new Error('Spender configuration missing');
            }

            // Create spender signer and contract
            this.spenderSigner = new ethers.Wallet(spenderPrivateKey, provider);
            this.spenderContract = this.contract.connect(this.spenderSigner);

        } catch (error) {
            console.error('Error initializing spend permissions:', error);
            throw error;
        }
    }

    // Update contract connection when wallet connects
    async updateConnection() {
        if (this.smartWalletManager.ethersProvider) {  // Changed from provider to ethersProvider
            this.contract = new ethers.Contract(
                this.config.SPEND_PERMISSION_MANAGER.address,
                this.config.SPEND_PERMISSION_MANAGER.abi,
                this.smartWalletManager.ethersProvider  // Use ethersProvider
            );
        }
    }


    createPermission(userAddress) {
        console.log('Creating permission with user address:', userAddress);

        const permission = {
            account: userAddress,
            spender: this.spenderAddress,
            token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
            allowance: ethers.utils.parseEther("0.01"), // Allow spending 0.01 ETH
            period: ethers.BigNumber.from(86400), // Convert to BigNumber
            start: ethers.BigNumber.from(0),      // Convert to BigNumber
            end: ethers.BigNumber.from(281474976710655), // Convert to BigNumber
            salt: ethers.BigNumber.from(0),       // Convert to BigNumber
            extraData: "0x"
        };

        console.log('Created permission object:', permission);
        return permission;
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