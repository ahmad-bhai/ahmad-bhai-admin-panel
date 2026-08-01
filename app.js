// ─── ADMIN PANEL API CONFIGURATION ───────────────────────────────────
const adminAPIUrl = "https://ahmad-bhai-admin-panel.vercel.app/a"; 

function togglePasswordVisibility() {
    let passInput = document.getElementById('pass');
    let checkbox = document.getElementById('togglePassCheckbox');
    if (checkbox.checked) {
        passInput.type = "text";
    } else {
        passInput.type = "password";
    }
}

function showToggles() {
    let ad = document.getElementById('admin_n').value.trim();
    let id = document.getElementById('i').value.trim();
    document.getElementById('toggleBox').style.display = (ad && id) ? "block" : "none";
}

function applyTheme(theme) {
    const themeIcon = (theme === 'light') ? 'moon.png' : 'sun.png';
    const searchIcon = (theme === 'light') ? 'search1.png' : 'search.png';
    if(theme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
    document.getElementById('themeIconLogin').src = themeIcon;
    document.getElementById('themeIconPanel').src = themeIcon;
    document.getElementById('searchIcon').src = searchIcon;
}

function toggleTheme() {
    let current = localStorage.getItem('theme') || 'dark';
    let newTheme = (current === 'dark') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

function showToast(m, showIcon = false){
    let t = document.getElementById('toast');
    document.getElementById('toastText').innerText = m;
    document.getElementById('toastIcon').style.display = showIcon ? "block" : "none";
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// ─── NEW BACKEND API ROUTINES ───────────────────────────────────────
async function login(){
    let passInput = document.getElementById('pass');
    let errorMsg = document.getElementById('loginError');
    let passValue = passInput.value;
    if(!passValue) {
        passInput.classList.add('error-border');
        errorMsg.style.display = "block";
        return;
    }
    
    try {
        let res = await fetch(`${adminAPIUrl}?action=login&key=${encodeURIComponent(passValue)}`);
        let data = await res.json();
        
        if(data.success) {
            localStorage.setItem('admin_session_pass', passValue);
            document.getElementById('loginBox').classList.add('hidden');
            document.getElementById('panelBox').classList.remove('hidden');
            loadData();
        } else {
            showToast("Wrong Password");
        }
    } catch(e) {
        showToast("Server Connection Error");
    }
}

function resetError() {
    let passInput = document.getElementById('pass');
    let errorMsg = document.getElementById('loginError');
    passInput.classList.remove('error-border');
    errorMsg.style.display = "none";
}

function logout(){
    localStorage.removeItem('admin_session_pass');
    document.getElementById('panelBox').classList.add('hidden');
    document.getElementById('loginBox').classList.remove('hidden');
    resetError();
    showToast("Logged Out");
}

async function loadData(){
    let savedPass = localStorage.getItem('admin_session_pass');
    if(!savedPass) return checkAuthState();

    try {
        let res = await fetch(`${adminAPIUrl}?action=load&key=${encodeURIComponent(savedPass)}`);
        let data = await res.json();
        
        if(!data.success) {
            logout();
            return;
        }

        let h = "";
        // Backend se data object format me milta hai
        let users = data.data || {};
        
// Replace the Object.keys(users).forEach loop block inside loadData() with this:
Object.keys(users).forEach(key => {
    let v = users[key];
    let searchKey = (v.admin_note || v.name).toLowerCase();
    let expiryDisplay = v.expiry_time ? new Date(v.expiry_time).toLocaleString() : "Never";

    // 🚩 Country configurations mapping
    let flagToken = v.flag || "pk"; 
    let matchedCountryPair = flagList.find(c => c[0] === flagToken);
    let countryTitle = matchedCountryPair ? matchedCountryPair[1] : "Global Region";

    // 🆕 Custom Logo verification fallback logic
    let userLogoSrc = (v.logo && v.logo.trim() !== "") ? v.logo : "MS.png";

    h += `<div class="user-card" data-admin="${searchKey}">
        <span style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <!-- 🆕 Left Side Circular Profile Dynamic User Logo -->
            <img src="${userLogoSrc}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--blue); flex-shrink: 0;">
            
            <div style="flex-grow: 1;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <img src="https://flagcdn.com/24x18/${flagToken}.png" class="flag-icon" style="width:18px; height:13px;" title="${countryTitle}">
                    <b style="color:var(--blue); text-transform:uppercase; font-size:14px;">${v.admin_note || 'No Name'}</b>
                </div>
                <b style="color:var(--text); font-size:12px;">${v.name}</b><br>
                <small style="opacity:0.7; font-size:11px;">Device: ${v.id}</small><br>
                <small style="color:var(--accent); font-size:11px;">Trader: ${v.trader_id || 'N/A'}</small><br>
                <small style="color:var(--red); font-weight:bold; font-size:11px;">Expires: ${expiryDisplay}</small>
            </div>
        </span>
        <button class="del-btn" onclick="del('${key}', '${v.admin_note || v.name}')" style="flex-shrink: 0; margin-left: 10px;">
            <img src="delete.png" style="width:12px;"> Delete
        </button>
    </div>`;
});

        document.getElementById('list').innerHTML = h || "<p style='text-align:center;opacity:0.5'>Empty List</p>";
    } catch(e) {
        console.error(e);
    }
}

async function add() {
    let savedPass = localStorage.getItem('admin_session_pass');
    if(!savedPass) return logout();

    let adInput = document.getElementById('admin_n');
    let nInput = document.getElementById('n');
    let iInput = document.getElementById('i');
    let tInput = document.getElementById('trader_id');
    let eInput = document.getElementById('e');
    let logoInput = document.getElementById('logo_url'); // 🆕 Fetch Logo Input
    let expInput = document.getElementById('expiry_time');
    
    if(adInput.value.trim() !== "" && iInput.value.trim() !== ""){
        let perms = {
            android: document.getElementById('t_android').checked,
            pc: document.getElementById('t_pc').checked,
            win: document.getElementById('t_win').checked,
            lb: document.getElementById('t_lb').checked,
            p: document.getElementById('t_p').checked,
            t: document.getElementById('t_t').checked,
            ana: document.getElementById('t_ana').checked
        };

        let expiryTimestamp = expInput.value ? new Date(expInput.value).getTime() : null;

        let userData = {
            admin_note: adInput.value,
            id: iInput.value.replace(/\s/g, ''),
            name: nInput.value,
            trader_id: tInput.value,
            email: eInput.value,
            logo: logoInput.value.trim() || "", // 🆕 Saves Target Logo URL String directly to Firebase
            flag: selectedCountryCode,
            date: new Date().toLocaleDateString(),
            expiry_time: expiryTimestamp, 
            status: "active",
            permissions: perms
        };

        try {
            let res = await fetch(`${adminAPIUrl}?action=add&key=${encodeURIComponent(savedPass)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            let result = await res.json();

            if(result.success) {
                showToast("User Upgraded Successfully!");
                // Clear all input text nodes including logo field
                adInput.value=""; nInput.value=""; iInput.value=""; tInput.value=""; eInput.value=""; logoInput.value=""; expInput.value="";
                if(typeof resetFlagDropdown === 'function') resetFlagDropdown();
                document.getElementById('toggleBox').style.display = "none";
                loadData(); 
            } else {
                showToast("Failed to upgrade: " + result.message);
            }
        } catch(err) {
            showToast("Error processing request");
        }
    } else {
        showToast("Admin Name & ID are required!");
    }
}


async function del(k, name){
    let savedPass = localStorage.getItem('admin_session_pass');
    if(!savedPass) return logout();

    try {
        let res = await fetch(`${adminAPIUrl}?action=delete&key=${encodeURIComponent(savedPass)}&userKey=${k}`);
        let result = await res.json();
        if(result.success) {
            showToast(name + " removed!", true);
            loadData(); // List refresh karein
        } else {
            showToast("Delete failed!");
        }
    } catch(e) {
        showToast("Network Error");
    }
}

function search(){
    let v=document.getElementById('s').value.toLowerCase();
    document.querySelectorAll('.user-card').forEach(u => {
        let adminAttr = u.getAttribute('data-admin');
        u.style.display = adminAttr.includes(v) ? "flex" : "none";
    });
}

function checkAuthState() {
    let savedPass = localStorage.getItem('admin_session_pass');
    if(savedPass) {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('panelBox').classList.remove('hidden');
        loadData();
    } else {
        document.getElementById('panelBox').classList.add('hidden');
        document.getElementById('loginBox').classList.remove('hidden');
        resetError();
    }
}

// Auto Refresh state check on page load
window.onload = () => { 
    applyTheme(localStorage.getItem('theme') || 'dark'); 
    checkAuthState();
};
