(function() {
    const pKey = "AhmadBhai_Ultimate_v10";

    let settings = JSON.parse(localStorage.getItem(pKey)) || {
        theme: 'dark', layout: 'default', radius: '12',
        dark: { accent: '#22c55e', blue: '#2563eb', red: '#ef4444' },
        light: { accent: '#22c55e', blue: '#2563eb', red: '#ef4444' }
    };

    const layouts = {
        default: "",
        glass: ".box { background: rgba(15,23,42,0.7) !important; backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1) !important; }",
        neon: ".box { border: 2px solid var(--blue) !important; box-shadow: 0 0 20px var(--blue) !important; }",
        sidebar_left: "body { justify-content: flex-start !important; padding:0; } .box { height: 100vh; width: 380px; border-radius: 0 !important; }",
        sidebar_right: "body { justify-content: flex-end !important; padding:0; } .box { height: 100vh; width: 380px; border-radius: 0 !important; }",
        floating: ".box { margin-top: 50px; box-shadow: 0 30px 60px rgba(0,0,0,0.8) !important; }",
        minimal: ".box { border: none !important; background: transparent !important; box-shadow: none !important; }",
        gradient_bg: "body { background: linear-gradient(45deg, #0f172a, #1e293b) !important; }",
        border_glow: ".box { border-top: 10px solid var(--blue) !important; }",
        rounded_max: ".box { border-radius: 60px !important; }",
        skewed: ".box { transform: perspective(1000px) rotateY(-5deg); }",
        retro: ".box { border: 4px solid #fff !important; box-shadow: 10px 10px 0 var(--blue) !important; border-radius:0 !important; }",
        soft: ".box { background: #1e293b !important; box-shadow: 20px 20px 60px #0a101f !important; }",
        future: ".box::before { content:'SYSTEM ONLINE'; position:absolute; top:-20px; color:var(--blue); font-size:10px; }",
        bordered: ".box { background: none !important; border: 1px dashed var(--blue) !important; }",
        ultra_wide: ".box { width: 95% !important; max-width:1300px !important; }",
        bottom_bar: ".box { position:fixed; bottom:0; left:0; right:0; width:100% !important; border-radius:0 !important; }",
        card_stack: ".box { box-shadow: 0 10px 0 var(--blue), 0 20px 0 var(--red) !important; }",
        outline_thin: ".box { background:transparent !important; border: 1px solid rgba(255,255,255,0.1) !important; }",
        cyber: ".box { clip-path: polygon(0% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%); }"
    };

    const styleEl = document.createElement('style');
    styleEl.id = "ahmad-persistent-v10";
    document.head.appendChild(styleEl);

    window.applyAhmadSystem = function() {
        const mode = settings.theme;
        const colors = settings[mode];
        const rad = settings.radius + "px";
        
        styleEl.innerHTML = `
            :root { --blue: ${colors.blue} !important; --red: ${colors.red} !important; --accent: ${colors.accent} !important; }
            .box, .btn, input, select, .user-card, .logout-btn, .del-btn, .slider, .t-row { border-radius: ${rad} !important; }
            ${layouts[settings.layout] || ""}
            
            .selector { width:100%; max-width:360px; margin:12px 0; position:relative; }
            .selector button {
              width:100%; display:flex; align-items:center; gap:10px; justify-content:flex-start;
              padding:12px; border-radius:10px; border:none; background:rgba(0,0,0,0.6); color:#fff; font-size:16px; cursor:pointer;
              box-shadow:0 6px 18px rgba(0,0,0,0.45);
            }
            .selector-options {
              display:none; position:absolute; top:54px; left:0; right:0; background:rgba(15,23,42,0.95); border-radius:10px;
              max-height:240px; overflow:auto; padding:6px 0; box-shadow:0 10px 30px rgba(0,0,0,0.6); z-index:50;
              border: 1px solid rgba(255,255,255,0.1);
            }
            .selector-options div { padding: 12px; color: #fff; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .selector-options div:hover { background: var(--blue); }
            
            #ahmadModal {
                width: 380px; border: none; padding: 0; position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%); z-index: 999999; border-radius: 25px;
                background: ${mode === 'dark' ? '#0f172a' : '#ffffff'};
                color: ${mode === 'dark' ? '#fff' : '#000'};
                box-shadow: 0 40px 120px rgba(0,0,0,0.9); font-family: sans-serif; overflow: hidden;
            }
            #ahmadModal::backdrop { background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); }
            .h-head { background: var(--blue); padding: 18px; text-align: center; color: #fff; font-weight: bold; }
            .h-body { padding: 20px; }
            .h-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: rgba(128,128,128,0.1); padding: 10px; border-radius: 12px; }
            .h-btn { width: 100%; padding: 12px; border: none; font-weight: bold; cursor: pointer; border-radius: 12px; margin-top: 10px; background: var(--blue); color: #fff; }
            .h-label { font-size: 11px; font-weight: bold; opacity: 0.6; margin-top: 10px; display: block; }
        `;
        localStorage.setItem(pKey, JSON.stringify(settings));
    };

    applyAhmadSystem();

    window.openAhmadEngine = function() {
        if(document.getElementById('ahmadModal')) return;
        const diag = document.createElement('dialog');
        diag.id = "ahmadModal";
        diag.innerHTML = `
            <div class="h-head">AHMAD BHAI ENGINE v10.0</div>
            <div class="h-body">
                <span class="h-label">UI THEME & LAYOUT</span>
                <div class="selector" id="themeSel">
                    <button>Theme: ${settings.theme.toUpperCase()}</button>
                    <div class="selector-options">
                        <div data-val="dark">Dark Night</div>
                        <div data-val="light">Pure Light</div>
                    </div>
                </div>

                <div class="selector" id="layoutSel">
                    <button>Layout: ${settings.layout.toUpperCase()}</button>
                    <div class="selector-options">
                        ${Object.keys(layouts).map(l => `<div data-val="${l}">${l.replace('_',' ').toUpperCase()}</div>`).join('')}
                    </div>
                </div>

                <span class="h-label">BORDER RADIUS</span>
                <div class="h-row"><input type="range" id="sRad" min="0" max="50" value="${settings.radius}" style="width:100%; accent-color:var(--blue);"></div>

                <span class="h-label">COLOR PALETTE</span>
                <div class="h-row"><span>Blue</span><input type="color" id="cBlue" value="${settings[settings.theme].blue}"></div>
                <div class="h-row"><span>Red</span><input type="color" id="cRed" value="${settings[settings.theme].red}"></div>
                <div class="h-row"><span>Accent</span><input type="color" id="cAcc" value="${settings[settings.theme].accent}"></div>

                <button id="hSave" class="h-btn">SAVE CHANGES</button>
                <button id="hReset" class="h-btn" style="background:transparent; color:var(--red); font-size:12px;">RESET TO DEFAULT</button>
            </div>
        `;
        document.body.appendChild(diag);
        diag.showModal();

        diag.querySelectorAll('.selector button').forEach(btn => {
            btn.onclick = () => {
                const opts = btn.nextElementSibling;
                opts.style.display = opts.style.display === 'block' ? 'none' : 'block';
            };
        });

        diag.querySelector('#themeSel .selector-options').onclick = (e) => {
            if(e.target.dataset.val) {
                settings.theme = e.target.dataset.val;
                diag.querySelector('#themeSel button').innerText = "Theme: " + settings.theme.toUpperCase();
                e.currentTarget.style.display = 'none';
                applyAhmadSystem();
            }
        };

        diag.querySelector('#layoutSel .selector-options').onclick = (e) => {
            if(e.target.dataset.val) {
                settings.layout = e.target.dataset.val;
                diag.querySelector('#layoutSel button').innerText = "Layout: " + settings.layout.toUpperCase();
                e.currentTarget.style.display = 'none';
                applyAhmadSystem();
            }
        };

        diag.querySelector('#sRad').oninput = (e) => { settings.radius = e.target.value; applyAhmadSystem(); };
        diag.querySelector('#cBlue').oninput = (e) => { settings[settings.theme].blue = e.target.value; applyAhmadSystem(); };
        diag.querySelector('#cRed').oninput = (e) => { settings[settings.theme].red = e.target.value; applyAhmadSystem(); };
        diag.querySelector('#cAcc').oninput = (e) => { settings[settings.theme].accent = e.target.value; applyAhmadSystem(); };
        
        diag.querySelector('#hSave').onclick = () => { diag.close(); diag.remove(); };
        diag.querySelector('#hReset').onclick = () => {
            localStorage.removeItem(pKey);
            location.reload();
        };
    };
})();
// ==========================================
// 🚩 FLAG DROPDOWN SYSTEM START
// ==========================================
var flagList = [
    ["pk", "Pakistan"], ["in", "India"], ["bd", "Bangladesh"], ["sa", "Saudi Arabia"],
    ["ae", "United Arab Emirates"], ["tr", "Turkey"], ["lk", "Sri Lanka"], ["au", "Australia"],
    ["jp", "Japan"], ["np", "Nepal"], ["eg", "Egypt"], ["my", "Malaysia"],
    ["th", "Thailand"], ["kr", "South Korea"], ["ng", "Nigeria"], ["mx", "Mexico"]
];

let selectedCountryCode = "pk"; // Default active country variable

// 1. Generate and Render List Items Dynamically with smooth UI state
function initializeFlagDropdown() {
    const listContainer = document.getElementById('dropdownList');
    if(!listContainer) return;
    listContainer.innerHTML = "";
    
    flagList.forEach(country => {
        let code = country[0];
        let name = country[1];
        
        let item = document.createElement('div');
        item.className = `dropdown-item ${code === selectedCountryCode ? 'active' : ''}`;
        item.setAttribute('data-code', code);
        
        // Click behavior with event propagation management
        item.onclick = function(e) { 
            e.stopPropagation(); 
            selectCountry(code, name); 
        };
        
        item.innerHTML = `
            <img src="https://flagcdn.com/24x18/${code}.png" class="flag-icon" style="width:24px; height:18px; object-fit:cover; border-radius:3px;">
            <span style="font-weight: 600; font-size: 14px;">${name}</span>
        `;
        listContainer.appendChild(item);
    });
}

// 2. Toggle main container view state
function toggleDropdown() {
    const dropdown = document.getElementById('flagDropdown');
    if(dropdown) {
        dropdown.classList.toggle('open');
    }
}

// 3. Update application state and UI elements when country changes
function selectCountry(code, name) {
    selectedCountryCode = code;
    
    const currentFlagImg = document.getElementById('currentFlagImg');
    const currentCountryName = document.getElementById('currentCountryName');
    const flagDropdown = document.getElementById('flagDropdown');
    
    if(currentFlagImg) currentFlagImg.src = `https://flagcdn.com/24x18/${code}.png`;
    if(currentCountryName) currentCountryName.innerText = name;
    
    // Refresh active styling across dynamic options list
    document.querySelectorAll('.dropdown-item').forEach(el => {
        el.classList.remove('active');
        if(el.getAttribute('data-code') === code) el.classList.add('active');
    });
    
    if(flagDropdown) flagDropdown.classList.remove('open');
}

// 4. Function to reset dropdown back to default (Use this inside your add() success block)
function resetFlagDropdown() {
    selectCountry("pk", "Pakistan");
}

// 5. Global Window Event Listener for Closing Dropdown on exterior boundary clicks
window.addEventListener('click', function(e) {
    const dropdown = document.getElementById('flagDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

// 6. Safe initialization hook attachment without overwriting existing window triggers
if (window.addEventListener) {
    window.addEventListener('load', initializeFlagDropdown);
} else if (window.attachEvent) {
    window.attachEvent('onload', initializeFlagDropdown);
}
// ==========================================
// 🚩 FLAG DROPDOWN SYSTEM END
// ==========================================


