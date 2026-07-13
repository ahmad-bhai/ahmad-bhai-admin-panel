// api/admin-core.js (Secure Logic with Token Support)
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const dbURL = "https://reactions-maker-site-default-rtdb.firebaseio.com/users";
    const ADMIN_PASSWORD = "Ahmad Bhai00"; 
    const AUTH_TOKEN = "session_token_ahmad_bhai"; // Jo login par return hota hai

    // Query aur Headers dono se auth details check karenge
    const { action, key, userKey } = req.query;
    
    // Check karenge ki kya request ke sath valid password ya valid token aaya hai
    const incomingToken = req.headers['authorization'] || req.headers['token'] || req.query.token;
    const isAuthenticated = (key === ADMIN_PASSWORD) || (incomingToken === AUTH_TOKEN);

    try {
        // 1. LOGIN ACTION (Bina password/token ke allowed hai)
        if (action === "login") {
            let providedPassword = (req.method === "POST" && req.body) ? (req.body.password || req.body.key) : key;
            if (providedPassword === ADMIN_PASSWORD) {
                return res.status(200).json({ success: true, token: AUTH_TOKEN, data: { success: true } });
            }
            return res.status(401).json({ success: false, error: "Wrong Password" });
        }

        // 🔥 GLOBAL SECURITY GUARD: Login ke ilawa password YA valid token hona zaroori hai!
        if (!isAuthenticated) {
            return res.status(403).json({ success: false, error: "Unauthorized access layer blocked" });
        }

        // 2. LOAD ACTION
        if (action === "load") {
            const fbRes = await fetch(`${dbURL}.json`);
            const fbData = await fbRes.json();
            return res.status(200).json({ success: true, data: fbData || {} });
        }

        // 3. ADD ACTION
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

        // 4. DELETE ACTION
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
