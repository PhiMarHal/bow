const { ethers } = require('ethers');
require('dotenv').config();

// In-memory rate limiting (replace with Redis in production)
const rateLimits = new Map();

function checkRateLimit(userAddress) {
    const now = Date.now();
    const userLimit = rateLimits.get(userAddress);

    if (userLimit) {
        const { count, timestamp } = userLimit;
        // Reset counter if it's been more than an hour
        if (now - timestamp > 3600000) {
            rateLimits.set(userAddress, { count: 1, timestamp: now });
            return true;
        }
        // Check if user has exceeded limit
        if (count >= 100) {
            return false;
        }
        // Increment counter
        rateLimits.set(userAddress, { count: count + 1, timestamp });
    } else {
        // First request from this user
        rateLimits.set(userAddress, { count: 1, timestamp: now });
    }
    return true;
}

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { userAddress, userOp } = JSON.parse(event.body);

        // Validate input
        if (!userAddress || !ethers.utils.isAddress(userAddress)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid address' })
            };
        }

        // Check rate limit
        if (!checkRateLimit(userAddress)) {
            return {
                statusCode: 429,
                body: JSON.stringify({ error: 'Rate limit exceeded' })
            };
        }

        // Get paymaster data from Base
        const response = await fetch(process.env.BASE_PAYMASTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.BASE_PAYMASTER_API_KEY}`
            },
            body: JSON.stringify({
                userOp
            })
        });

        const paymasterData = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(paymasterData)
        };
    } catch (error) {
        console.error('Paymaster error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};