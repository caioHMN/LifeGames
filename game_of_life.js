// --- Configurações iniciais ---
const CELL_SIZE = 16;
const GRID_COLOR = "#444";
const CELL_COLOR = "#4caf50";
const DEAD_COLOR = "#222";
const CANVAS = document.getElementById("game-canvas");
const CTX = CANVAS.getContext("2d");

let rows = Math.floor(CANVAS.height / CELL_SIZE);
let cols = Math.floor(CANVAS.width / CELL_SIZE);

let grid = createEmptyGrid();
let running = false;
let generation = 0;
let fps = 10;
let intervalId = null;
let currentLang = "pt"; // idioma padrão

// --- Funções utilitárias ---
function createEmptyGrid() {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

// --- Desenho do grid ---
function drawGrid() {
    CTX.fillStyle = DEAD_COLOR;
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // Linhas do grid
    CTX.strokeStyle = GRID_COLOR;
    for (let x = 0; x <= CANVAS.width; x += CELL_SIZE) {
        CTX.beginPath();
        CTX.moveTo(x, 0);
        CTX.lineTo(x, CANVAS.height);
        CTX.stroke();
    }
    for (let y = 0; y <= CANVAS.height; y += CELL_SIZE) {
        CTX.beginPath();
        CTX.moveTo(0, y);
        CTX.lineTo(CANVAS.width, y);
        CTX.stroke();
    }

    // Células vivas
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) {
                CTX.fillStyle = CELL_COLOR;
                CTX.fillRect(
                    c * CELL_SIZE + 1,
                    r * CELL_SIZE + 1,
                    CELL_SIZE - 2,
                    CELL_SIZE - 2
                );
            }
        }
    }
}

// --- Atualização do grid (regras do Game of Life) ---
function nextGeneration() {
    const newGrid = createEmptyGrid();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let liveNeighbors = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        liveNeighbors += grid[nr][nc];
                    }
                }
            }
            if (grid[r][c]) {
                newGrid[r][c] = (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
            } else {
                newGrid[r][c] = (liveNeighbors === 3) ? 1 : 0;
            }
        }
    }
    grid = newGrid;
    generation++;
}

// --- Loop principal ---
function loop() {
    if (running) {
        nextGeneration();
        updateInfoBar();
    }
    drawGrid();
}

// --- Atualização da barra de informações (com tradução) ---
function updateInfoBar() {
    const t = LANGUAGES[currentLang];
    document.getElementById("generation-label").textContent = t.generation_label + generation;
    document.getElementById("status-label").textContent = t.status_label + (running ? t.status_running : t.status_paused);
    const liveCells = grid.flat().reduce((a, b) => a + b, 0);
    document.getElementById("live-cells-label").textContent = t.live_cells_label + liveCells;
}

// --- Controles ---
document.getElementById("toggle-btn").onclick = () => {
    running = !running;
    updateAllTexts();
};

document.getElementById("clear-btn").onclick = () => {
    grid = createEmptyGrid();
    generation = 0;
    drawGrid();
    updateInfoBar();
};

document.getElementById("fps-slider").oninput = (e) => {
    fps = parseInt(e.target.value);
    document.getElementById("fps-value").textContent = fps;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = setInterval(loop, 1000 / fps);
    }
};

// --- Salvar o grid no localStorage ---
document.getElementById("save-btn").onclick = () => {
    const data = {
        grid: grid,
        generation: generation
    };
    localStorage.setItem("gol_save", JSON.stringify(data));
    alert("Estado salvo!");
};

// --- Restaurar o grid do localStorage ---
document.getElementById("load-btn").onclick = () => {
    const data = localStorage.getItem("gol_save");
    if (data) {
        const obj = JSON.parse(data);
        grid = obj.grid;
        generation = obj.generation;
        drawGrid();
        updateInfoBar();
        alert("Estado restaurado!");
    } else {
        alert("Nenhum estado salvo encontrado.");
    }
};

// --- Popular popup de padrões ---
function showPatternsPopup() {
    const list = document.getElementById("patterns-list");
    list.innerHTML = "";
    for (const key in PATTERNS) {
        const btn = document.createElement("button");
        btn.textContent = PATTERNS[key].name;
        btn.onclick = () => {
            applyPattern(PATTERNS[key].pattern);
            closePatternsPopup();
        };
        list.appendChild(btn);
    }
    document.getElementById("patterns-popup").classList.remove("hidden");
}

function closePatternsPopup() {
    document.getElementById("patterns-popup").classList.add("hidden");
}

document.getElementById("patterns-btn").onclick = showPatternsPopup;
document.getElementById("close-patterns-btn").onclick = closePatternsPopup;

// --- Aplicar padrão centralizado ---
function applyPattern(pattern) {
    grid = createEmptyGrid();
    const pRows = pattern.length;
    const pCols = pattern[0].length;
    const startRow = Math.floor((rows - pRows) / 2);
    const startCol = Math.floor((cols - pCols) / 2);
    for (let r = 0; r < pRows; r++) {
        for (let c = 0; c < pCols; c++) {
            if (pattern[r][c]) {
                const gr = startRow + r;
                const gc = startCol + c;
                if (gr >= 0 && gr < rows && gc >= 0 && gc < cols) {
                    grid[gr][gc] = 1;
                }
            }
        }
    }
    generation = 0;
    drawGrid();
    updateInfoBar();
}

// --- Popups de QR Code ---
function showQRPopup() {
    document.getElementById("qr-popup").classList.remove("hidden");
    document.getElementById("qr-title").textContent = "PiX caiohomemm@gmail.com";
    const qrDiv = document.getElementById("qr-code");
    qrDiv.innerHTML = '<img src="qrb.png" alt="QR Code" style="width: 180px; height: 180px;">';
}
function closeQRPopup() {
    document.getElementById("qr-popup").classList.add("hidden");
}

document.getElementById("show-qr-btn").onclick = showQRPopup;
document.getElementById("close-qr-btn").onclick = closeQRPopup;

// --- Popups de instruções ---
function fillInstructionsPopup() {
    const t = LANGUAGES[currentLang];
    const lines = [
        `<strong>${t.instructions_intro}</strong>`,
        "",
        `<strong>${t.rules_title}</strong>`,
        t.rule_1,
        t.rule_2,
        t.rule_3,
        t.rule_4,
        "",
        `<strong>${t.controls_title}</strong>`,
        t.control_click,
        t.control_toggle,
        t.control_save,
        t.control_load,
        t.control_clear,
        t.control_fps_slider
    ];
    document.getElementById("instructions-title").textContent = t.instructions_title;
    document.getElementById("instructions-text").innerHTML = lines.join("<br>");
    document.getElementById("show-qr-btn").textContent = t.show_qr_code_button || "Mostrar QR Code";
    document.getElementById("close-instructions-btn").textContent = t.close_button || "Fechar";
}

function showInstructionsPopup() {
    fillInstructionsPopup();
    document.getElementById("instructions-popup").classList.remove("hidden");
}
function closeInstructionsPopup() {
    document.getElementById("instructions-popup").classList.add("hidden");
}

document.getElementById("instructions-btn").onclick = showInstructionsPopup;
document.getElementById("close-instructions-btn").onclick = closeInstructionsPopup;

// --- Troca de idioma ---
document.getElementById("lang-btn").onclick = () => {
    currentLang = (currentLang === "pt") ? "en" : "pt";
    updateAllTexts();
};

function updateAllTexts() {
    const t = LANGUAGES[currentLang];
    document.getElementById("toggle-btn").textContent = running ? t.pause_button : t.run_button;
    document.getElementById("clear-btn").textContent = t.clear_button;
    document.getElementById("save-btn").textContent = t.save_button;
    document.getElementById("load-btn").textContent = t.restore_button;
    document.getElementById("patterns-btn").textContent = t.patterns;
    document.getElementById("instructions-btn").textContent = t.instructions_title.split(" ")[0];
    document.getElementById("fps-label").innerHTML = t.fps_label + `<span id="fps-value">${fps}</span>`;
    updateInfoBar();
    fillInstructionsPopup();
    if (!document.getElementById("patterns-popup").classList.contains("hidden")) showPatternsPopup();
}

// --- Interação com o canvas ---
CANVAS.addEventListener("click", (e) => {
    const rect = CANVAS.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
        grid[r][c] = grid[r][c] ? 0 : 1;
        drawGrid();
        updateInfoBar();
    }
});

// --- Inicialização ---
function start() {
    drawGrid();
    updateInfoBar();
    intervalId = setInterval(loop, 1000 / fps);
}

window.onload = function() {
    start();
    updateAllTexts();
    showInstructionsPopup();
};