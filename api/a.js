import crypto from 'crypto';

// Token session storage (In-memory storage)
const activeTokens = new Set();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Token');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const dbURL = "https://reactions-maker-site-default-rtdb.firebaseio.com/users";
    const ADMIN_PASSWORD = "Ahmad Bhai00"; 

    const { action, key, userKey, token } = req.query;
    
    const incomingToken = req.headers['authorization'] || req.headers['token'] || token;

    // Check ki requested token active token list me hai ya password sahi hai
    const isTokenValid = incomingToken && activeTokens.has(incomingToken);
    const isAuthenticated = (key === ADMIN_PASSWORD) || isTokenValid;

    try {
        // 1. LOGIN ROUTE - Dynamically generates unique session tokens
        if (action === "login") {
            let providedPassword = (req.method === "POST" && req.body) ? (req.body.password || req.body.key) : key;
            
            if (providedPassword === ADMIN_PASSWORD) {
                // Generate secure random token
                const newToken = "MS_TOK_" + crypto.randomBytes(16).toString('hex');
                activeTokens.add(newToken);

                return res.status(200).json({ 
                    success: true, 
                    token: newToken,
                    message: "Login Successful" 
                });
            }
            return res.status(401).json({ success: false, error: "Wrong Password" });
        }

        // 2. LOGOUT ROUTE - Deletes target session token
        if (action === "logout") {
            if (incomingToken) {
                activeTokens.delete(incomingToken);
            }
            return res.status(200).json({ success: true, message: "Token Invalidated" });
        }

        // 🔥 SECURITY GUARD: Protects database operations
        if (!isAuthenticated) {
            return res.status(403).json({ success: false, error: "Unauthorized access layer blocked" });
        }

        // 3. LOAD DATA ROUTE
        if (action === "load") {
            const fbRes = await fetch(`${dbURL}.json`);
            const fbData = await fbRes.json();
            return res.status(200).json({ success: true, data: fbData || {} });
        }

        // 4. ADD USER ROUTE
        if (action === "add" && req.method === "POST") {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const saveRes = await fetch(`${dbURL}.json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!saveRes.ok) throw new Error("Firebase Rejected Write Operation");
            return res.status(200).json({ success: true });
        }

        // 5. DELETE USER ROUTE
        if (action === "delete") {
            const targetKey = userKey || key; 
            if (!targetKey) return res.status(400).json({ error: "Missing Target Key parameter" });
            const delRes = await fetch(`${dbURL}/${targetKey}.json`, { method: "DELETE" });
            if (!delRes.ok) throw new Error("Firebase Rejected Delete Operation");
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: "Invalid Action Route Selection" });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Fault Layer", details: error.message });
    }
}
