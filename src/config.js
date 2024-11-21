export const CONFIG = {
    CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
    RPC_URL: import.meta.env.VITE_RPC_URL,
    CONTRACT_ABI: [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721IncorrectOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721InsufficientApproval",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOperator",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721NonexistentToken",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "wordIndex",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "author",
                    "type": "address"
                }
            ],
            "name": "WordUpdated",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_wordIndex",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_newWord",
                    "type": "string"
                }
            ],
            "name": "contribute",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_tribe",
                    "type": "uint256"
                }
            ],
            "name": "register",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "contractURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "generateSVG",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_wordIndex",
                    "type": "uint256"
                }
            ],
            "name": "getLastWord",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getWordFromTokenId",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MAX_CHAR_PER_WORD",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MAX_TRIBES",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MAX_WORD",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "nameToAddress",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "tokenToWord",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "wordIndex",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "wordIteration",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "TRIBE_COLORS",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "users",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "tribe",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "words",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "author",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    SPEND_PERMISSION_MANAGER: {
        address: "0x6Bb91a81aa8C4edDBe04c774015279445fE68B5A",
        abi: [{
            inputs: [
                {
                    internalType: "contract PublicERC6492Validator",
                    name: "_publicERC6492Validator",
                    type: "address",
                },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            inputs: [
                { internalType: "uint48", name: "currentTimestamp", type: "uint48" },
                { internalType: "uint48", name: "end", type: "uint48" },
            ],
            name: "AfterSpendPermissionEnd",
            type: "error",
        },
        {
            inputs: [
                { internalType: "uint48", name: "currentTimestamp", type: "uint48" },
                { internalType: "uint48", name: "start", type: "uint48" },
            ],
            name: "BeforeSpendPermissionStart",
            type: "error",
        },
        { inputs: [], name: "EmptySpendPermissionBatch", type: "error" },
        {
            inputs: [
                { internalType: "uint256", name: "value", type: "uint256" },
                { internalType: "uint256", name: "allowance", type: "uint256" },
            ],
            name: "ExceededSpendPermission",
            type: "error",
        },
        {
            inputs: [
                { internalType: "address", name: "sender", type: "address" },
                { internalType: "address", name: "expected", type: "address" },
            ],
            name: "InvalidSender",
            type: "error",
        },
        { inputs: [], name: "InvalidSignature", type: "error" },
        {
            inputs: [
                { internalType: "uint48", name: "start", type: "uint48" },
                { internalType: "uint48", name: "end", type: "uint48" },
            ],
            name: "InvalidStartEnd",
            type: "error",
        },
        {
            inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
            name: "SpendValueOverflow",
            type: "error",
        },
        { inputs: [], name: "UnauthorizedSpendPermission", type: "error" },
        { inputs: [], name: "ZeroAllowance", type: "error" },
        { inputs: [], name: "ZeroPeriod", type: "error" },
        { inputs: [], name: "ZeroSpender", type: "error" },
        { inputs: [], name: "ZeroToken", type: "error" },
        { inputs: [], name: "ZeroValue", type: "error" },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "hash", type: "bytes32" },
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    indexed: false,
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "SpendPermissionApproved",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "hash", type: "bytes32" },
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    indexed: false,
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "SpendPermissionRevoked",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "hash", type: "bytes32" },
                {
                    indexed: true,
                    internalType: "address",
                    name: "account",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "spender",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "token",
                    type: "address",
                },
                {
                    components: [
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint160", name: "spend", type: "uint160" },
                    ],
                    indexed: false,
                    internalType: "struct SpendPermissionManager.PeriodSpend",
                    name: "periodSpend",
                    type: "tuple",
                },
            ],
            name: "SpendPermissionUsed",
            type: "event",
        },
        {
            inputs: [],
            name: "NATIVE_TOKEN",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "approve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        {
                            components: [
                                { internalType: "address", name: "spender", type: "address" },
                                { internalType: "address", name: "token", type: "address" },
                                { internalType: "uint160", name: "allowance", type: "uint160" },
                                { internalType: "uint256", name: "salt", type: "uint256" },
                                { internalType: "bytes", name: "extraData", type: "bytes" },
                            ],
                            internalType: "struct SpendPermissionManager.PermissionDetails[]",
                            name: "permissions",
                            type: "tuple[]",
                        },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermissionBatch",
                    name: "spendPermissionBatch",
                    type: "tuple",
                },
                { internalType: "bytes", name: "signature", type: "bytes" },
            ],
            name: "approveBatchWithSignature",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
                { internalType: "bytes", name: "signature", type: "bytes" },
            ],
            name: "approveWithSignature",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "eip712Domain",
            outputs: [
                { internalType: "bytes1", name: "fields", type: "bytes1" },
                { internalType: "string", name: "name", type: "string" },
                { internalType: "string", name: "version", type: "string" },
                { internalType: "uint256", name: "chainId", type: "uint256" },
                { internalType: "address", name: "verifyingContract", type: "address" },
                { internalType: "bytes32", name: "salt", type: "bytes32" },
                { internalType: "uint256[]", name: "extensions", type: "uint256[]" },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        {
                            components: [
                                { internalType: "address", name: "spender", type: "address" },
                                { internalType: "address", name: "token", type: "address" },
                                { internalType: "uint160", name: "allowance", type: "uint160" },
                                { internalType: "uint256", name: "salt", type: "uint256" },
                                { internalType: "bytes", name: "extraData", type: "bytes" },
                            ],
                            internalType: "struct SpendPermissionManager.PermissionDetails[]",
                            name: "permissions",
                            type: "tuple[]",
                        },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermissionBatch",
                    name: "spendPermissionBatch",
                    type: "tuple",
                },
            ],
            name: "getBatchHash",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "getCurrentPeriod",
            outputs: [
                {
                    components: [
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint160", name: "spend", type: "uint160" },
                    ],
                    internalType: "struct SpendPermissionManager.PeriodSpend",
                    name: "",
                    type: "tuple",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "getHash",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "isApproved",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "publicERC6492Validator",
            outputs: [
                {
                    internalType: "contract PublicERC6492Validator",
                    name: "",
                    type: "address",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
            ],
            name: "revoke",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    components: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "address", name: "spender", type: "address" },
                        { internalType: "address", name: "token", type: "address" },
                        { internalType: "uint160", name: "allowance", type: "uint160" },
                        { internalType: "uint48", name: "period", type: "uint48" },
                        { internalType: "uint48", name: "start", type: "uint48" },
                        { internalType: "uint48", name: "end", type: "uint48" },
                        { internalType: "uint256", name: "salt", type: "uint256" },
                        { internalType: "bytes", name: "extraData", type: "bytes" },
                    ],
                    internalType: "struct SpendPermissionManager.SpendPermission",
                    name: "spendPermission",
                    type: "tuple",
                },
                { internalType: "uint160", name: "value", type: "uint160" },
            ],
            name: "spend",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        }]
    }
};