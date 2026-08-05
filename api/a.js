import crypto from 'crypto';

const ALLOWED_DOMAIN = "ahmad-bhai-admin-panel.vercel.app";
const FIREBASE_BASE_URL = "https://reactions-maker-site-default-rtdb.firebaseio.com";
const ADMIN_PASSWORD = "Ahmad Bhai00";

// Helper function: Get Client IP Address
function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || "unknown-ip";
}

// Helper functions for Firebase Active Tokens Store
async function getActiveTokens() {
    try {
        const res = await fetch(`${FIREBASE_BASE_URL}/activeTokens.json`);
        const data = await res.json();
        return data || {};
    } catch (e) {
        return {};
    }
}

async function saveTokenData(token, data) {
    await fetch(`${FIREBASE_BASE_URL}/activeTokens/${token}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

async function removeTokenData(token) {
    await fetch(`${FIREBASE_BASE_URL}/activeTokens/${token}.json`, {
        method: "DELETE"
    });
}

export default async function handler(req, res) {
    // CORS Setup
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Token');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, key, userKey, token } = req.query;
    const clientIp = getClientIp(req);
    const origin = req.headers['origin'] || req.headers['referer'] || "";
    const incomingToken = req.headers['authorization'] || req.headers['token'] || token;

    try {
        // Fetch current active tokens from Firebase
        const tokensStore = await getActiveTokens();

        // 🛡️ SECURITY GUARD 1: Domain Enforcement & Anti-Cloning Lock
        if (origin && !origin.includes(ALLOWED_DOMAIN)) {
            if (incomingToken && tokensStore[incomingToken]) {
                await removeTokenData(incomingToken); // Invalidate token if accessed from cloned site
            }
            return res.status(403).json({ 
                success: false, 
                error: "UNAUTHORIZED_DOMAIN_ACCESS", 
                action: "DEAD_STATE" 
            });
        }

        // 🛡️ SECURITY GUARD 2: IP Collision Detection
        if (incomingToken) {
            for (const [existingToken, sessionInfo] of Object.entries(tokensStore)) {
                if (existingToken !== incomingToken && sessionInfo.ip === clientIp) {
                    // Same IP with multiple tokens detected -> Revoke both for security
                    await removeTokenData(incomingToken);
                    await removeTokenData(existingToken);
                    return res.status(403).json({ 
                        success: false, 
                        error: "IP_COLLISION_DETECTED", 
                        action: "LOGOUT" 
                    });
                }
            }
        }

        // Token Validity Check
        const isTokenValid = incomingToken && !!tokensStore[incomingToken];

        // 1. LOGIN ROUTE - Dynamically generates unique session tokens
if (action === "login") {
    let providedPassword = "";

    // Parse Body securely
    if (req.body) {
        const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        providedPassword = parsedBody.password || parsedBody.key || "";
    }
    
    // Fallback to URL Query if Body is empty
    if (!providedPassword && key) {
        providedPassword = decodeURIComponent(key);
    }

    // Trim extra spaces
    if (providedPassword.trim() === ADMIN_PASSWORD) {
        const newToken = "MS_TOK_" + crypto.randomBytes(16).toString('hex');
        
        await saveTokenData(newToken, {
            ip: clientIp,
            domain: ALLOWED_DOMAIN,
            created: Date.now()
        });

        return res.status(200).json({ 
            success: true, 
            token: newToken,
            message: "Login Successful" 
        });
    }
    
    return res.status(401).json({ 
        success: false, 
        error: "Wrong Password", 
        action: "PERMANENT_BLOCK" 
    });
}


        // 2. LOGOUT ROUTE - Deletes session token globally
        if (action === "logout") {
            if (incomingToken) {
                await removeTokenData(incomingToken);
            }
            
            // Redirect or response based on browser request
            if (req.headers['accept']?.includes('text/html')) {
                return res.status(200).send(`
                    <script>
                        localStorage.clear();
                        window.location.href = "https://${ALLOWED_DOMAIN}";
                    </script>
                `);
            }
            
            return res.status(200).json({ success: true, message: "Token Invalidated Globally" });
        }

        // 3. VERIFY TOKEN ROUTE - Heartbeat check for Frontend security polling
        if (action === "verify") {
            if (!isTokenValid) {
                return res.status(401).json({ success: false, valid: false, action: "LOGOUT" });
            }
            return res.status(200).json({ success: true, valid: true });
        }

        // 🔒 AUTHENTICATION CHECK FOR DATA OPERATIONS
        const isAuthenticated = (key === ADMIN_PASSWORD) || isTokenValid;
        if (!isAuthenticated) {
            return res.status(403).json({ 
                success: false, 
                error: "Unauthorized access layer blocked", 
                action: "LOGOUT" 
            });
        }

        // 4. LOAD DATA ROUTE
        if (action === "load") {
            const fbRes = await fetch(`${FIREBASE_BASE_URL}/users.json`);
            const fbData = await fbRes.json();
            return res.status(200).json({ success: true, data: fbData || {} });
        }

        // 5. ADD USER ROUTE
        if (action === "add" && req.method === "POST") {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const saveRes = await fetch(`${FIREBASE_BASE_URL}/users.json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!saveRes.ok) throw new Error("Firebase Rejected Write Operation");
            return res.status(200).json({ success: true });
        }

        // 6. DELETE USER ROUTE
        if (action === "delete") {
            const targetKey = userKey || key; 
            if (!targetKey) return res.status(400).json({ error: "Missing Target Key parameter" });
            const delRes = await fetch(`${FIREBASE_BASE_URL}/users/${targetKey}.json`, { method: "DELETE" });
            if (!delRes.ok) throw new Error("Firebase Rejected Delete Operation");
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: "Invalid Action Route Selection" });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Fault Layer", details: error.message });
    }
}
