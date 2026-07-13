// api/admin-core.js
export default async function handler(req, res) {
    // CORS Cross-Origin Allocation Settings
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const dbURL = "https://reactions-maker-site-default-rtdb.firebaseio.com/users";
    
    // 🔥 CONFIGURATION: Admin panel password
    const ADMIN_PASSWORD = "Ahmad Bhai00"; 

    // URL parameters extract karein
    const { action, key, userKey } = req.query;

    try {
        // ─── ACTION: AUTHENTICATION (LOGIN) ───
        if (action === "login") {
            let providedPassword = "";
            
            // Dono checks rakh diye hain: body se bhi aur URL query se bhi
            if (req.method === "POST" && req.body) {
                const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
                providedPassword = body.password || body.key;
            } else {
                providedPassword = key; // Frontend query parameter backup
            }

            if (providedPassword === ADMIN_PASSWORD) {
                return res.status(200).json({ success: true, token: "session_token_ahmad_bhai", data: { success: true } });
            } else {
                return res.status(401).json({ success: false, error: "Wrong Password" });
            }
        }

        // Auth Key Safety Validation Layer
        const incomingKey = key || req.headers['authorization'];
        if (incomingKey !== ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, error: "Unauthorized access layer blocked" });
        }

        // ─── ACTION: LOAD ALL DATA (GET) ───
        if (action === "load") {
            const fbRes = await fetch(`${dbURL}.json`);
            const fbData = await fbRes.json();
            return res.status(200).json({ success: true, data: fbData || {} });
        }

        // ─── ACTION: ADD / UPGRADE USER (POST) ───
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

        // ─── ACTION: DELETE USER (POST/DELETE) ───
        if (action === "delete") {
            // Frontend 'userKey' query bhej raha hai delete target ki id ke liye
            const targetKey = userKey || key; 
            if (!targetKey) return res.status(400).json({ error: "Missing Target Key parameter" });
            
            const delRes = await fetch(`${dbURL}/${targetKey}.json`, {
                method: "DELETE"
            });
            
            if (!delRes.ok) throw new Error("Firebase Rejected Delete Operation");
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: "Invalid Action Route Selection" });

    } catch (error) {
        console.error("Backend Error:", error);
        return res.status(500).json({ error: "Internal Server Fault Layer", details: error.message });
    }
}
