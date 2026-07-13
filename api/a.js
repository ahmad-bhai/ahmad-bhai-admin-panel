// api/admin-core.js
export default async function handler(req, res) {
    // CORS Cross-Origin Allocation Settings
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const dbURL = "https://reactions-maker-site-default-rtdb.firebaseio.com/users";
    
    // 🔥 CONFIGURATION: Yahan apna password set karein jo admin panel ka hoga
    const ADMIN_PASSWORD = "Ahmad Bhai00"; 

    const { action, key, id } = req.query;

    try {
        // ─── ACTION: AUTHENTICATION (LOGIN) ───
        if (action === "login" && req.method === "POST") {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (body.password === ADMIN_PASSWORD) {
                return res.status(200).json({ success: true, token: "session_token_ahmad_bhai" });
            } else {
                return res.status(401).json({ success: false, error: "Wrong Password" });
            }
        }

        // ─── ACTION: LOAD ALL DATA (GET) ───
        if (action === "load" && req.method === "GET") {
            const fbRes = await fetch(`${dbURL}.json`);
            const fbData = await fbRes.json();
            return res.status(200).json(fbData || {});
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
        if (action === "delete" && req.method === "POST") {
            if (!key) return res.status(400).json({ error: "Missing Key parameter" });
            
            const delRes = await fetch(`${dbURL}/${key}.json`, {
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
