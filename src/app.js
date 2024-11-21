import { ethers } from 'ethers';
import { CONFIG } from './config';
import { smartWalletManager } from './smartWallet';
import { SpendPermissionManager } from './spendPermissions';
import { PaymasterService } from './paymasterService';
import './styles.css';


// Animation initialization
const runes = ['ᛚ', 'ᚮ', 'ᛁ', 'ᚤ', 'ᛆ', 'ᛆ'];

function initializeBackgroundControls() {
    const button = document.querySelector('.toggle-button');
    if (!button) {
        console.warn('Background toggle button not found');
        return;
    }

    const states = ['full', 'medium', 'off'];
    const opacities = { full: 1, medium: 0.1, off: 0 };
    let currentIndex = 0;

    // Set initial state and text
    button.dataset.state = states[currentIndex];
    button.textContent = 'ᛚᚮᛁᚤᛆᛆ';

    button.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % 3;
        const newState = states[currentIndex];
        button.dataset.state = newState;

        document.querySelectorAll('.column').forEach(col => {
            col.style.opacity = opacities[newState];
        });
    });
}

function createColumns() {
    const background = document.querySelector('.background');
    if (!background) {
        console.warn('Background element not found');
        return;
    }
    background.innerHTML = '';
    const columnWidth = 15;
    const numColumns = Math.ceil(window.innerWidth / columnWidth);

    const runeHeight = 15 * 0.7;
    const runeSequenceHeight = 6 * runeHeight;
    const sequencesNeeded = Math.ceil(window.innerHeight / runeSequenceHeight) + 3;

    for (let i = 0; i < numColumns; i++) {
        const column = document.createElement('div');
        column.className = 'column';
        column.style.left = `${i * columnWidth}px`;

        let columnContent = '';
        for (let j = 0; j < sequencesNeeded * 2; j++) {
            runes.forEach(rune => {
                columnContent += rune + '\n';
            });
        }

        column.textContent = columnContent;
        background.appendChild(column);
    }
}

// Initialize background animation
window.addEventListener('resize', createColumns);
createColumns();

// Cache structure initialization
let contract;
let userAddress;
let loadingAnimationInterval;

let spendPermissionManager;
let paymasterService;

// Cache structure initialization
const wordCache = {
    words: new Array(128),
    users: new Map(),
    lastFullUpdate: 0,
    version: 0,
    pendingUpdates: new Set(),
    processedTransactions: new Set(),
    isProcessingEvents: false,
    pendingTransactions: new Map()
};

function setupPendingTransactionCleanup() {
    // Clean up pending transactions on page load
    const cleanup = async () => {
        const pendingWords = wordCache.words.reduce((acc, word, index) => {
            if (word?.isPending) acc.push(index);
            return acc;
        }, []);

        // Update all pending words with their actual blockchain state
        for (const index of pendingWords) {
            await updateSingleWord(index);
        }
    };

    // Run cleanup on page load
    cleanup();

    // Add cleanup on page unload/refresh
    window.addEventListener('beforeunload', cleanup);
}


function setupEventListener() {
    // Remove any existing listeners
    if (contract) {
        contract.removeAllListeners("WordUpdated");

        // Set up new listener
        contract.on("WordUpdated", (wordIndex, author, event) => {
            // Prevent duplicate processing
            if (wordCache.processedTransactions.has(event.transactionHash)) {
                return;
            }
            wordCache.processedTransactions.add(event.transactionHash);

            // Add to pending updates
            wordCache.pendingUpdates.add(wordIndex.toNumber());
            processEventQueue();
        });
    }
}

async function processEventQueue() {
    if (wordCache.isProcessingEvents) return;

    try {
        wordCache.isProcessingEvents = true;

        while (wordCache.pendingUpdates.size > 0) {
            const indices = Array.from(wordCache.pendingUpdates);
            wordCache.pendingUpdates.clear();

            // Process updates in smaller batches
            const BATCH_SIZE = 5;
            for (let i = 0; i < indices.length; i += BATCH_SIZE) {
                const batch = indices.slice(i, i + BATCH_SIZE);

                // Update each word in the batch
                await Promise.all(batch.map(async (index) => {
                    try {
                        await updateSingleWord(index);
                    } catch (error) {
                        console.error(`Error updating word ${index}:`, error);
                        // Re-add failed updates to the queue
                        wordCache.pendingUpdates.add(index);
                    }
                }));

                // Add small delay between batches if more remain
                if (i + BATCH_SIZE < indices.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
    } finally {
        wordCache.isProcessingEvents = false;

        // If new updates came in while processing, run again
        if (wordCache.pendingUpdates.size > 0) {
            processEventQueue();
        }
    }
}

async function fetchAllCurrentWords() {
    const wordPromises = [];
    for (let i = 0; i < 128; i++) {
        wordPromises.push(getWordWithAuthorInfo(i));
    }
    return Promise.all(wordPromises);
}

async function initializeApp() {
    try {
        console.log('Starting app initialization...');
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
        contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, provider);

        // Initialize spend permission manager (but don't connect yet)
        spendPermissionManager = new SpendPermissionManager(smartWalletManager, CONFIG);
        await spendPermissionManager.initialize();

        paymasterService = new PaymasterService();

        // Rest of initialization...
        document.getElementById('connect-wallet').addEventListener('click', connectWallet);
        initializeBackgroundControls();
        setupEventListener();
        setupCacheMaintenance();
        setupPendingTransactionCleanup();
        await loadAllWords();

        if (window.ethereum) {
            window.ethereum.on('chainChanged', handleChainChange);
        }
    } catch (error) {
        console.error('Full initialization error:', error);
        showStatus(`Initialization error: ${error.message}`, 'error');
    }
}


function setupCacheMaintenance() {
    // Clean up old user data periodically
    setInterval(() => {
        const now = Date.now();
        const MAX_USER_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

        for (const [address, data] of wordCache.users) {
            if (now - data.lastUpdated > MAX_USER_CACHE_AGE) {
                wordCache.users.delete(address);
            }
        }

        // Keep processed transactions set from growing too large
        if (wordCache.processedTransactions.size > 1000) {
            wordCache.processedTransactions.clear();
        }
    }, 60 * 60 * 1000); // Run every hour

    // Periodic full refresh to catch any missed updates
    setInterval(async () => {
        const now = Date.now();
        const FORCE_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

        if (now - wordCache.lastFullUpdate >= FORCE_UPDATE_INTERVAL) {
            try {
                await loadAllWords();
            } catch (error) {
                console.error('Periodic refresh failed:', error);
            }
        }
    }, 60 * 1000); // Check every minute
}

function startLoadingAnimation() {
    const wordsContainer = document.getElementById('words-display');
    let dots = 1;

    // Clear any existing content and set up loading display
    wordsContainer.innerHTML = `<div class="loading-dots">.</div>`;
    const dotsElement = wordsContainer.querySelector('.loading-dots');

    // Clear any existing interval
    if (loadingAnimationInterval) {
        clearInterval(loadingAnimationInterval);
    }

    loadingAnimationInterval = setInterval(() => {
        dots = (dots % 3) + 1;
        dotsElement.textContent = '.'.repeat(dots);
    }, 500);
}

function stopLoadingAnimation() {
    if (loadingAnimationInterval) {
        clearInterval(loadingAnimationInterval);
        loadingAnimationInterval = null;
    }
}

async function loadAllWords() {
    startLoadingAnimation();

    try {
        console.log('Fetching words...');
        const BATCH_SIZE = 10; // Adjust based on RPC limits
        const DELAY_BETWEEN_BATCHES = 100; // ms

        for (let i = 0; i < 128; i += BATCH_SIZE) {
            const wordBatch = await fetchWordBatch(i, BATCH_SIZE);

            // Collect unique authors from this batch
            const authors = wordBatch
                .map(w => w.author)
                .filter(author => author !== 'unknown');

            // Fetch user info for new authors
            await fetchUserBatch(authors);

            // Update cache with new word data
            wordBatch.forEach(({ index, word, author }) => {
                const userInfo = wordCache.users.get(author) || { name: '', tribe: '0' };
                wordCache.words[index] = {
                    word: word || '[...]',
                    authorAddress: author,
                    authorName: userInfo.name,
                    tribe: userInfo.tribe
                };
            });

            // Add delay between batches to avoid rate limits
            if (i + BATCH_SIZE < 128) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        wordCache.lastFullUpdate = Date.now();
        wordCache.version++;
        await updateWordsDisplay();

    } catch (error) {
        console.error('Error in loadAllWords:', error);
        // If we have cached data, use it
        if (wordCache.words.some(w => w)) {
            await updateWordsDisplay();
            showStatus('Using cached data due to network issues', 'warning');
        } else {
            showStatus('Failed to load words', 'error');
        }
    } finally {
        stopLoadingAnimation();
    }
}

async function fetchWordBatch(startIndex, batchSize) {
    const promises = [];
    for (let i = 0; i < batchSize && (startIndex + i) < 128; i++) {
        promises.push(contract.getLastWord(startIndex + i)
            .then(([word, author]) => ({
                index: startIndex + i,
                word,
                author
            }))
            .catch(error => ({
                index: startIndex + i,
                error,
                // Use cached data if available
                word: wordCache.words[startIndex + i]?.word || '[...]',
                author: wordCache.words[startIndex + i]?.authorAddress || 'unknown'
            }))
        );
    }
    return Promise.all(promises);
}

async function fetchUserBatch(addresses) {
    // Filter out addresses we already have cached
    const uniqueAddresses = [...new Set(addresses)].filter(addr =>
        addr !== 'unknown' &&
        addr !== ethers.constants.AddressZero &&
        !wordCache.users.has(addr)
    );

    const promises = uniqueAddresses.map(address =>
        contract.users(address)
            .then(user => ({
                address,
                name: user.name,
                tribe: user.tribe.toString()
            }))
            .catch(() => ({
                address,
                name: '',
                tribe: '0'  // Default tribe
            }))
    );

    const results = await Promise.all(promises);

    // Update user cache
    results.forEach(result => {
        wordCache.users.set(result.address, {
            name: result.name,
            tribe: result.tribe,
            lastUpdated: Date.now()
        });
    });

    return results;
}

async function updateSingleWord(index) {
    try {
        const [word, author] = await contract.getLastWord(index);

        // Only fetch user info if we don't have it cached
        if (author !== 'unknown' && !wordCache.users.has(author)) {
            await fetchUserBatch([author]);
        }

        const userInfo = wordCache.users.get(author) || { name: '', tribe: '0' };
        const newWordInfo = {
            word: word || '[...]',
            authorAddress: author,
            authorName: userInfo.name,
            tribe: userInfo.tribe
        };

        // Only update if the word actually changed
        if (!wordCache.words[index] ||
            JSON.stringify(wordCache.words[index]) !== JSON.stringify(newWordInfo)) {

            wordCache.words[index] = newWordInfo;
            wordCache.version++;
            await updateWordsDisplay();
        }

    } catch (error) {
        console.error(`Error updating word ${index}:`, error);
        // Keep using cached version if available
        if (wordCache.words[index]) {
            showStatus('Using cached version due to network issues', 'warning');
        }
    }
}

async function updateWordsDisplay() {
    const wordsContainer = document.getElementById('words-display');
    wordsContainer.innerHTML = '';

    wordCache.words.forEach((wordInfo, index) => {
        if (!wordInfo) return;

        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        if (wordInfo.isPending) {
            wordSpan.classList.add('word-pending');
        }
        wordSpan.textContent = wordInfo.word;
        wordSpan.dataset.tribe = wordInfo.isPending ? 'pending' : wordInfo.tribe;
        wordSpan.dataset.index = index;
        wordSpan.dataset.author = wordInfo.authorName || wordInfo.authorAddress;

        if (!wordInfo.isPending) {
            wordSpan.onclick = () => showWordPopup(index, wordInfo);
        }

        if (index > 0) {
            wordsContainer.appendChild(document.createTextNode(' '));
        }

        wordsContainer.appendChild(wordSpan);
    });
}

async function handleContribution(wordIndex, newWord, originalWordInfo, popup) {
    try {
        setLoading(true);

        // Create user operation
        const userOp = await createUserOperation(wordIndex, newWord);

        // First get stub data
        const stubData = await paymasterService.getPaymasterStubData(userOp);
        console.log('Stub data received:', stubData);

        // Update userOp with stub data for estimation
        userOp.paymasterAndData = stubData.paymasterAndData;

        // Then get actual paymaster data
        const paymasterData = await paymasterService.getPaymasterData(userOp);
        console.log('Final paymaster data:', paymasterData);

        // Update userOp with final paymaster data
        userOp.paymasterAndData = paymasterData.paymasterAndData;

        // Add this line to actually send the operation!
        const result = await sendUserOperation(userOp);
        console.log('Operation result:', result);

        // ... rest of the function
    } catch (error) {
        // Handle error and revert UI
        handleContributionError(error, originalWordInfo, wordIndex);
    } finally {
        setLoading(false);
    }
}

async function createUserOperation(wordIndex, newWord) {
    const callData = contract.interface.encodeFunctionData('contribute', [
        ethers.BigNumber.from(wordIndex),
        newWord
    ]);

    // Create initial userOp
    const userOp = {
        sender: userAddress.toLowerCase(),
        nonce: "0x0",
        initCode: "0x",
        callData,
        callGasLimit: "0x3D090",
        verificationGasLimit: "0x3D090",
        preVerificationGas: "0x3D090",
        maxFeePerGas: '0x' + (30000000).toString(16),
        maxPriorityFeePerGas: '0x' + (100).toString(16),
        paymasterAndData: "0x",
        signature: "0x"
    };

    // Get paymaster data first
    const stubData = await paymasterService.getPaymasterStubData(userOp);
    userOp.paymasterAndData = stubData.paymasterAndData;

    // Create the message to sign
    const message = ethers.utils.solidityKeccak256(
        ['address', 'uint256', 'bytes', 'bytes', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
        [
            userOp.sender,
            userOp.nonce,
            userOp.initCode,
            userOp.callData,
            userOp.callGasLimit,
            userOp.verificationGasLimit,
            userOp.preVerificationGas,
            userOp.maxFeePerGas,
            userOp.maxPriorityFeePerGas,
            userOp.paymasterAndData
        ]
    );

    // Sign with our smart wallet
    console.log('Signing message:', message);
    const signature = await smartWalletManager.signer.signMessage(
        ethers.utils.arrayify(message)
    );
    console.log('Got signature:', signature);
    userOp.signature = signature;

    // Get final paymaster data
    const finalData = await paymasterService.getPaymasterData(userOp);
    userOp.paymasterAndData = finalData.paymasterAndData;

    return userOp;
}

async function updateOptimisticUI(wordIndex, newWord) {
    wordCache.words[wordIndex] = {
        word: newWord,
        authorAddress: userAddress,
        authorName: (await contract.users(userAddress)).name || userAddress,
        tribe: 'pending',
        isPending: true
    };
    await updateWordsDisplay();
}

function handleContributionError(error, originalWordInfo, wordIndex) {
    let errorMsg = 'Error: ';
    if (error.code === 'ACTION_REJECTED' || error.message.includes('rejected')) {
        errorMsg += 'Transaction cancelled';
    } else {
        errorMsg += error.message;
    }
    showStatus(errorMsg, 'error');

    // Revert optimistic update if needed
    if (originalWordInfo) {
        wordCache.words[wordIndex] = originalWordInfo;
        updateWordsDisplay();
    }
}

function showWordPopup(wordIndex, wordInfo) {
    if (!userAddress) {
        showStatus('Please connect your wallet first', 'error');
        return;
    }

    // Remove any existing popup
    const existingPopup = document.querySelector('.word-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup UI
    const popup = createPopupUI(wordIndex, wordInfo);

    // Add click handler
    const button = popup.querySelector('.popup-button');
    button.addEventListener('click', async () => {
        const newWord = popup.querySelector('.popup-input').value.trim();
        if (!newWord) {
            showStatus('Please enter a word', 'error');
            return;
        }

        if (!validateWord(newWord)) {
            showStatus('Word must contain only letters, with optional punctuation at the end', 'error');
            return;
        }

        const originalWordInfo = wordCache.words[wordIndex] ?
            { ...wordCache.words[wordIndex] } : null;

        await handleContribution(wordIndex, newWord, originalWordInfo, popup);
    });

    // Add popup to document
    document.body.appendChild(popup);
    popup.style.display = 'flex';
    popup.querySelector('.popup-input').focus();
}

function createPopupUI(wordIndex, wordInfo) {
    const popup = document.createElement('div');
    popup.className = 'word-popup';

    const content = document.createElement('div');
    content.className = 'popup-content';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'popup-input';
    input.placeholder = 'Enter new word';
    input.maxLength = 32;

    const button = document.createElement('button');
    button.className = 'popup-button';
    button.textContent = 'Contribute';

    const info = document.createElement('div');
    info.className = 'word-info';
    info.textContent = `#${wordIndex}, by ${wordInfo.authorName || wordInfo.authorAddress}`;

    content.appendChild(input);
    content.appendChild(button);
    content.appendChild(info);
    popup.appendChild(content);

    // Add click-outside-to-close handler
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });

    return popup;
}

async function getNonce(userAddress) {
    try {
        const response = await fetch(`${paymasterService.baseUrl}${paymasterService.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getUserOperationNonce',
                params: [
                    userAddress.toLowerCase(),
                    paymasterService.entryPoint
                ]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.result;  // Returns hex string nonce
    } catch (error) {
        console.error('Error fetching nonce:', error);
        throw error;
    }
}

async function sendUserOperation(userOp) {
    // First estimate gas
    const gasEstimate = await estimateUserOperationGas(userOp);

    // Update user operation with gas estimates
    userOp.callGasLimit = gasEstimate.callGasLimit;
    userOp.verificationGasLimit = gasEstimate.verificationGasLimit;
    userOp.preVerificationGas = gasEstimate.preVerificationGas;

    // Get current gas prices
    const feeData = await smartWalletManager.provider.getFeeData();
    userOp.maxFeePerGas = feeData.maxFeePerGas.toHexString();
    userOp.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString();

    // Get user signature
    const signature = await smartWalletManager.signer.signMessage(
        ethers.utils.arrayify(hashUserOp(userOp))
    );
    userOp.signature = signature;

    // Send the user operation
    const response = await fetch(`${paymasterService.baseUrl}${paymasterService.apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_sendUserOperation',
            params: [
                userOp,
                paymasterService.entryPoint
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
}

async function estimateUserOperationGas(userOp) {
    const response = await fetch(`${paymasterService.baseUrl}${paymasterService.apiKey}`, {
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
                paymasterService.entryPoint
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
}

// Helper function to hash user operation
function hashUserOp(userOp) {
    // This is a simplified version - we might need to adjust the hashing algorithm
    // based on Coinbase's requirements
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            [
                'address',   // sender
                'uint256',   // nonce
                'bytes',     // initCode
                'bytes',     // callData
                'uint256',   // callGasLimit
                'uint256',   // verificationGasLimit
                'uint256',   // preVerificationGas
                'uint256',   // maxFeePerGas
                'uint256',   // maxPriorityFeePerGas
                'bytes',     // paymasterAndData
            ],
            [
                userOp.sender,
                userOp.nonce,
                userOp.initCode,
                userOp.callData,
                userOp.callGasLimit,
                userOp.verificationGasLimit,
                userOp.preVerificationGas,
                userOp.maxFeePerGas,
                userOp.maxPriorityFeePerGas,
                userOp.paymasterAndData,
            ]
        )
    );
}

async function getWordWithAuthorInfo(index) {
    try {
        const [word, author] = await contract.getLastWord(index);
        let authorName = '';
        let tribe = '0'; // We should only default to this if we really can't get the info

        // Only proceed with user info fetch if we have a valid author
        if (author && author !== ethers.constants.AddressZero) {
            try {
                // Get user info directly
                const user = await contract.users(author);
                // Make sure we got valid data back
                if (user) {
                    authorName = user.name || '';
                    // Only set tribe if we got a valid number back
                    if (user.tribe != null && !isNaN(user.tribe)) {
                        tribe = user.tribe.toString();
                    }
                }
            } catch (error) {
                console.error(`Error fetching user info for word ${index}, author ${author}:`, error);
                // Don't default to tribe 0, keep trying to fetch
                throw error; // Let the outer try-catch handle it
            }
        }

        return {
            word: word || '[...]',
            authorAddress: author === ethers.constants.AddressZero ?
                'unknown' :
                `${author.slice(0, 6)}...${author.slice(-4)}`,
            authorName,
            tribe
        };
    } catch (error) {
        console.error(`Error fetching word ${index}:`, error);
        // Try one more time before giving up
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            const [word, author] = await contract.getLastWord(index);
            const user = await contract.users(author);
            return {
                word: word || '[...]',
                authorAddress: author === ethers.constants.AddressZero ?
                    'unknown' :
                    `${author.slice(0, 6)}...${author.slice(-4)}`,
                authorName: user.name || '',
                tribe: user.tribe.toString()
            };
        } catch (retryError) {
            console.error(`Retry failed for word ${index}:`, retryError);
            // Only now do we return a default tribe
            return {
                word: '[error]',
                authorAddress: 'unknown',
                authorName: '',
                tribe: '0'  // Last resort default
            };
        }
    }
}

function setLoading(isLoading) {
    const buttons = document.querySelectorAll('button');
    const inputs = document.querySelectorAll('input');

    buttons.forEach(button => {
        button.disabled = isLoading;
        button.classList.toggle('loading', isLoading);
    });

    inputs.forEach(input => {
        input.disabled = isLoading;
    });
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-messages');

    // Clean up the message
    let cleanMessage = message;
    /*
    if (message.includes('0x')) {
        // Remove transaction hashes and long hex strings
        cleanMessage = message.replace(/0x[a-fA-F0-9]{10,}/g, '(tx)');
    }*/

    // Remove or increase truncation
    // if (cleanMessage.length > 100) {
    //     cleanMessage = cleanMessage.substring(0, 97) + '...';
    // }

    console.log(message);  // Add this for debugging

    statusElement.textContent = cleanMessage;
    statusElement.className = type + ' visible';

    setTimeout(() => {
        statusElement.className = '';
    }, 5000);
}

async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // 8453 in hex for Base
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x2105',
                        chainName: 'Base',
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://base-rpc.publicnode.com'],
                        blockExplorerUrls: ['https://basescan.org']
                    }]
                });
            } catch (addError) {
                throw new Error('Could not add Base network to wallet');
            }
        } else {
            throw switchError;
        }
    }
}



async function connectWallet() {
    try {
        setLoading(true);
        showStatus('Initializing smart wallet...', 'info');

        userAddress = await smartWalletManager.connect();

        // Update spend permission manager connection
        await spendPermissionManager.updateConnection();

        // Get contract instance
        contract = await smartWalletManager.getContractFunction();

        // Set up event listeners
        setupEventListener();

        // Update UI
        await updateWalletDisplay();

        showStatus('Smart wallet connected successfully!', 'success');
    } catch (error) {
        let errorMessage = 'Failed to connect smart wallet';

        if (error.message?.includes('User rejected')) {
            errorMessage = 'Connection cancelled by user';
        } else if (error.message?.includes('network')) {
            errorMessage = 'Please make sure you are on the Base network';
        }

        showStatus(errorMessage, 'error');
        console.error(error);
    } finally {
        setLoading(false);
    }
}

async function updateWalletDisplay() {
    const walletInfo = document.getElementById('wallet-info');

    if (!userAddress) {
        walletInfo.innerHTML = `
            <button id="connect-wallet">Connect Smart Wallet</button>
        `;
        document.getElementById('connect-wallet').addEventListener('click', connectWallet);
        return;
    }

    try {
        // Check if user has registered a name
        const user = await contract.users(userAddress);
        const displayText = user.name ? user.name : `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

        walletInfo.innerHTML = `
            <span class="wallet-address" 
                  title="${userAddress}" 
                  style="cursor: copy;"
            >${displayText}</span>
        `;

        // Add click handler for copying
        const addressSpan = walletInfo.querySelector('.wallet-address');
        addressSpan.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(userAddress);
                showStatus('Address copied to clipboard!', 'success');
            } catch (error) {
                showStatus('Failed to copy address', 'error');
            }
        });

    } catch (error) {
        console.error('Error fetching user info:', error);
        walletInfo.innerHTML = `
            <span class="wallet-address" 
                  title="${userAddress}"
                  style="cursor: copy;"
            >${userAddress.slice(0, 6)}...${userAddress.slice(-4)}</span>
        `;
    }
}

async function showRegistrationPopup() {
    // Remove any existing popup
    const existingPopup = document.querySelector('.register-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'register-popup';

    const content = document.createElement('div');
    content.className = 'popup-content';

    const title = document.createElement('div');
    title.className = 'popup-title';
    title.textContent = 'PICK NAME. PICK TRIBE.';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'popup-input';
    input.placeholder = 'Enter your name (letters only)';
    input.maxLength = 32;

    // Create tribe selection with kanji
    const tribeSelector = document.createElement('div');
    tribeSelector.className = 'tribe-selector';

    const tribes = [
        { value: '0', kanji: '黄', color: 'var(--yellow-tribe)' },
        { value: '1', kanji: '赤', color: 'var(--red-tribe)' },
        { value: '2', kanji: '緑', color: 'var(--green-tribe)' },
        { value: '3', kanji: '青', color: 'var(--blue-tribe)' }
    ];

    let selectedTribe = null;

    tribes.forEach(tribe => {
        const tribeButton = document.createElement('button');
        tribeButton.className = 'tribe-button';
        tribeButton.innerHTML = `<span>${tribe.kanji}</span>`;
        tribeButton.style.color = tribe.color;
        tribeButton.dataset.tribe = tribe.value;

        tribeButton.addEventListener('click', (e) => {
            // Remove selection from all buttons
            document.querySelectorAll('.tribe-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Add selection to clicked button
            tribeButton.classList.add('selected');
            selectedTribe = tribe.value;
        });

        tribeSelector.appendChild(tribeButton);
    });

    const errorDiv = document.createElement('div');
    errorDiv.className = 'popup-error';
    errorDiv.style.display = 'none';

    const button = document.createElement('button');
    button.className = 'popup-button';
    button.textContent = 'Register';

    content.appendChild(title);
    content.appendChild(input);
    content.appendChild(tribeSelector);
    content.appendChild(button);
    content.appendChild(errorDiv);

    popup.appendChild(content);

    const showPopupError = (message) => {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    };

    button.addEventListener('click', async () => {
        const name = input.value.trim();

        // Clear any previous error
        errorDiv.style.display = 'none';

        if (!name) {
            showPopupError('Please enter your name');
            input.focus();
            return;
        }

        if (name.length > 32) {
            showPopupError('Name must be 32 characters or less');
            input.focus();
            return;
        }

        if (!/^[a-zA-Z]+$/.test(name)) {
            showPopupError('Name must contain only letters (A-Z, a-z)');
            input.focus();
            return;
        }

        if (selectedTribe === null) {
            showPopupError('Please select your tribe');
            return;
        }

        try {
            setLoading(true);
            const tx = await contract.register(name, selectedTribe);
            showStatus('Registration sent! Waiting for confirmation...', 'success');

            await tx.wait();
            showStatus('Successfully registered!', 'success');
            popup.remove();

            // Update display
            await updateWalletDisplay();

        } catch (error) {
            let errorMsg = 'Registration error: ';
            if (error.code === 'ACTION_REJECTED' || error.message.includes('rejected')) {
                errorMsg += 'Transaction cancelled';
            } else {
                errorMsg += error.message.split('\n')[0].substring(0, 50);
            }
            showPopupError(errorMsg);
        } finally {
            setLoading(false);
        }
    });

    // Close when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });

    document.body.appendChild(popup);
    popup.style.display = 'flex';
    input.focus();
}


function validateWord(word) {
    // First check if the word is empty or too long
    if (!word || word.length > 32) return false;

    // If word is only one character, it must be a letter
    if (word.length === 1) return /^[a-zA-Z]$/.test(word);

    // For longer words:
    // 1. All characters except the last must be letters
    // 2. Last character can be a letter or allowed punctuation
    const allButLast = word.slice(0, -1);
    const lastChar = word.slice(-1);

    return /^[a-zA-Z]+$/.test(allButLast) &&
        /^[a-zA-Z,\.;!?]$/.test(lastChar);
}

async function registerUser() {
    try {
        const name = document.getElementById('name-input').value.trim();
        const tribe = document.getElementById('tribe-select').value;

        if (!name) throw new Error('Please enter a name');
        if (name.length > 32) throw new Error('Name must be 32 characters or less');

        // Validate name characters (only letters allowed)
        if (!/^[a-zA-Z]+$/.test(name)) {
            throw new Error('Name must contain only letters');
        }

        setLoading(true);
        const tx = await contract.register(name, tribe);
        await tx.wait();

        document.getElementById('user-info').style.display = 'none';
        showStatus(`Successfully registered as ${name}`, 'success');
        highlightUserTribe(tribe);

    } catch (error) {
        showStatus(`Registration error: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

async function submitWord() {
    try {
        const wordIndex = parseInt(document.getElementById('word-index').value);
        const newWord = document.getElementById('new-word').value.trim();

        // Validate inputs
        if (isNaN(wordIndex) || wordIndex < 0 || wordIndex >= 128) {
            throw new Error('Word index must be between 0 and 127');
        }
        if (!newWord) throw new Error('Please enter a word');
        if (newWord.length > 32) throw new Error('Word must be 32 characters or less');

        // Validate word characters (only letters allowed)
        if (!/^[a-zA-Z]+$/.test(newWord)) {
            throw new Error('Word must contain only letters');
        }

        setLoading(true);
        const tx = await contract.contribute(wordIndex, newWord);
        await tx.wait();

        showStatus('Word submitted successfully', 'success');
        await updateWordsDisplay();

        // Clear input fields
        document.getElementById('word-index').value = '';
        document.getElementById('new-word').value = '';

    } catch (error) {
        showStatus(`Submission error: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

async function handleChainChange(newChainId) {
    try {
        // Only reinitialize signer if we're on Base
        if (newChainId === '0x2105') {
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = web3Provider.getSigner();
            // Update contract with signer for write operations
            contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, signer);
            showStatus('Connected to Base network', 'success');
        }
    } catch (error) {
        showStatus(`Network change error: ${error.message}`, 'error');
    }
}


function highlightUserTribe(tribe) {
    // Remove any existing tribe highlights
    document.querySelectorAll('.tribe-selected').forEach(el => {
        el.classList.remove('tribe-selected');
    });

    // Add highlight to user's tribe in the select element
    const tribeOption = document.querySelector(`#tribe-select option[value="${tribe}"]`);
    if (tribeOption) {
        tribeOption.classList.add('tribe-selected');
    }
}



// Initialize app when page loads
window.addEventListener('load', initializeApp);

// Update event handler for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            userAddress = null;
            await updateWalletDisplay();
        } else {
            userAddress = accounts[0];
            await connectWallet();
        }
    });
}

async function testPaymasterConnection() {
    try {
        const paymasterService = new PaymasterService();
        const dummyOp = {
            sender: "0x10004bc67CacA391f2298D0c5C42E40aC744703E",
            nonce: "0x0",
            initCode: "0x",
            callData: "0x",
            callGasLimit: "0x0",
            verificationGasLimit: "0x0",
            preVerificationGas: "0x0",
            maxFeePerGas: "0x0",
            maxPriorityFeePerGas: "0x0",
            paymasterAndData: "0x",
            signature: "0x"
        };

        console.log('Testing paymaster connection...');
        // Change this line to use stub data
        const result = await paymasterService.getPaymasterStubData(dummyOp);
        console.log('Paymaster response:', result);
        return result;
    } catch (error) {
        console.error('Paymaster test failed:', error);
    }
}

// Add this temporarily to test
window.addEventListener('load', () => {
    testPaymasterConnection().then(result => {
        console.log('Paymaster test complete:', result);
    });
});
