// paymasterService.js
export class PaymasterService {
    constructor(config) {
        this.baseUrl = 'https://api.developer.coinbase.com/rpc/v1/base/';
        this.apiKey = import.meta.env.VITE_COINBASE_API_KEY;
        this.entryPoint = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';

        console.log('API Key loaded:', this.apiKey); // Will show undefined if not loaded
    }

    // In paymasterService.js
    async estimateGas(userOp) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_estimateUserOperationGas',
                    params: [
                        userOp,
                        this.entryPoint
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.result;
        } catch (error) {
            console.error('Error estimating gas:', error);
            throw error;
        }
    }

    async getPaymasterData(userOp) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'pm_getPaymasterStubData',
                    params: [
                        userOp,
                        this.entryPoint,
                        '0x2105', // Base mainnet chainId
                        {} // No policy needed
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.result;
        } catch (error) {
            console.error('Error getting paymaster data:', error);
            throw error;
        }
    }

    // In PaymasterService class
    // In paymasterService.js, modify getPaymasterStubData:
    async getPaymasterStubData(userOp) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'pm_getPaymasterStubData',
                    params: [
                        userOp,
                        this.entryPoint,
                        "0x2105",  // Base mainnet chainId
                        {}  // Empty policy object
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.result;
        } catch (error) {
            console.error('Error getting paymaster stub data:', error);
            throw error;
        }
    }

    async getPaymasterData(userOp) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'pm_getPaymasterData',
                    params: [
                        userOp,
                        this.entryPoint,
                        "0x2105",  // Base mainnet chainId
                        {}  // Empty policy object
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.result;
        } catch (error) {
            console.error('Error getting paymaster data:', error);
            throw error;
        }
    }

    async makeRequest(method, userOp) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: method,
                    params: [
                        userOp,
                        this.entryPoint,
                        "0x2105",  // Base chainId in hex
                        {}
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.result;
        } catch (error) {
            console.error(`Error in ${method}:`, error);
            throw error;
        }
    }
}