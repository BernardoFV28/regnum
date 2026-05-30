window.UIManager = {
    init() {
        this.initCanvas();
        this.injectSVGs();
        this.renderSteamSegments();
    },

    // --- CANVAS DE CINZAS ---
    initCanvas() {
        const canvas = document.getElementById('ash-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();

        for(let i=0; i<60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                speedY: Math.random() * -1 - 0.5,
                speedX: Math.random() * 1 - 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(138, 108, 42, ${p.opacity})`; // Cinzas sujas
                ctx.fill();
                p.y += p.speedY; p.x += p.speedX;
                if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
            });
            requestAnimationFrame(draw);
        }
        draw();
    },

    // --- INJEÇÃO DE SVGS INLINE ---
    injectSVGs() {
        const svgBio = `<svg viewBox="0 0 100 100"><path fill="var(--flesh-green)" d="M50 10 C 20 40, 10 70, 50 90 C 90 70, 80 40, 50 10" /><circle cx="50" cy="50" r="15" fill="var(--void-black)"/></svg>`;
        const svgCop = `<svg viewBox="0 0 100 100"><polygon points="20,80 50,20 80,80" fill="none" stroke="var(--copper-raw)" stroke-width="8"/><circle cx="50" cy="60" r="10" fill="var(--gold-dirty)"/></svg>`;
        
        document.getElementById('icon-bio').innerHTML = svgBio;
        document.getElementById('icon-cop').innerHTML = svgCop;
    },

    getBuildingSVG(type) {
        if (type === 'cabana') return `<svg viewBox="0 0 100 100"><rect x="20" y="40" width="60" height="50" fill="none" stroke="var(--text-secondary)" stroke-width="4"/><polygon points="10,40 50,10 90,40" fill="var(--metal-rust)"/></svg>`;
        if (type === 'fazenda') return `<svg viewBox="0 0 100 100"><path d="M10 50 Q 50 10 90 50 Q 50 90 10 50" fill="var(--flesh-green)" opacity="0.6"/><circle cx="50" cy="50" r="10" fill="var(--blood-red)"/></svg>`;
        if (type === 'caldeira') return `<svg viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="60" fill="var(--copper-raw)"/><line x1="50" y1="20" x2="50" y2="0" stroke="var(--amber-steam)" stroke-width="6"/></svg>`;
        return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="var(--metal-border)" stroke-width="4" fill="none"/></svg>`;
    },

    // --- DRAMA DO VAPOR ---
    renderSteamSegments() {
        const bar = document.getElementById('steam-bar');
        bar.innerHTML = '';
        for(let i=0; i<10; i++) {
            const seg = document.createElement('div');
            seg.className = 'steam-segment';
            bar.appendChild(seg);
        }
    },

    updateSteam(percent) {
        document.getElementById('val-vap').innerText = `${percent}%`;
        const segments = document.querySelectorAll('.steam-segment');
        const activeCount = Math.ceil(percent / 10);
        
        segments.forEach((seg, index) => {
            seg.classList.remove('active', 'critical');
            if (index < activeCount) {
                if (percent <= 30) seg.classList.add('critical');
                else seg.classList.add('active');
            }
        });

        if (percent <= 10) document.body.classList.add('crisis');
        else document.body.classList.remove('crisis');
    },

    // --- FEEDBACK VISUAL ---
    updateResource(id, current, delta) {
        const el = document.getElementById(`val-${id}`);
        if (!el) return;
        el.innerText = current;

        if (delta !== 0) {
            const floatEl = document.createElement('div');
            floatEl.className = 'float-text';
            floatEl.style.color = delta > 0 ? 'var(--flesh-green)' : 'var(--blood-red)';
            floatEl.innerText = delta > 0 ? `+${delta}` : delta;
            el.appendChild(floatEl);
            setTimeout(() => floatEl.remove(), 2000);
        }
    },

    addLog(text, type = 'info') {
        const logPanel = document.getElementById('colony-log');
        const entry = document.createElement('div');
        const time = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        
        let icon = type === 'crit' ? '✕' : type === 'warn' ? '⚠' : '⚙';
        entry.className = `log-entry log-${type}`;
        entry.innerHTML = `<span class="opacity-50">[${time}]</span> ${icon} ${text}`;
        
        logPanel.prepend(entry);
        if (logPanel.children.length > 50) logPanel.removeChild(logPanel.lastChild);
    },

    renderBuildings(buildings, clickHandler) {
        const grid = document.getElementById('building-grid');
        grid.innerHTML = '';
        
        buildings.forEach(b => {
            const card = document.createElement('div');
            card.className = `building-card ${b.active ? 'active-pulse' : ''}`;
            card.innerHTML = `
                <div class="bldg-icon">${this.getBuildingSVG(b.id)}</div>
                <div class="bldg-name">${b.name}</div>
                <div class="bldg-cost">CUSTO: ${b.cost} COP</div>
                <div class="bldg-cost" style="color:var(--flesh-green)">+${b.prod}/s</div>
            `;
            card.onclick = () => clickHandler(b.id);
            grid.appendChild(card);
        });
    }
};
