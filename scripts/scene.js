const CANVAS_SIZE = 600;
const GRID_SIZE = 3;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const BORDER_WIDTH = 20;
const PLAY_AREA = CANVAS_SIZE - (BORDER_WIDTH * 2);

const COLORS = {
    wheat: '#794707e5',
    darkWheat: '#DDA15E',
    lightWheat: '#FEFAE0',
    border: '#8B4513',
    fencePost: '#654321',
    ground: '#8B5A2B',
    groundLight: '#B97A46',
    gridLine: '#D4A574'
}

let baseStripesLayer;
let coverLayer
let _lastTilled = { x: -9999, y: -9999 };

function setup() {
    let canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent('game-container');
    // enable continuous draw for moving objects
    // noLoop(); // static for now, use loop() afterwards, just adding this so I remember what this does

    // player setup (playermovement.js)
    if (typeof setupPlayer === 'function') setupPlayer();

    baseStripesLayer = createGraphics(PLAY_AREA, PLAY_AREA);
    coverLayer = createGraphics(PLAY_AREA, PLAY_AREA);

    const stripeW = 8;
    baseStripesLayer.noStroke();
    for (let x = 0, i = 0; x < PLAY_AREA; x += stripeW) {
        baseStripesLayer.fill(i % 2 === 0 ? COLORS.ground : COLORS.groundLight);
        baseStripesLayer.rect(x, 0, stripeW, PLAY_AREA);
        i++;
    }
    coverLayer.noStroke();
    coverLayer.fill(COLORS.wheat);
    coverLayer.rect(0, 0, PLAY_AREA, PLAY_AREA);
    
    // Initialize wheat renderer
    if (typeof wheatRenderer !== 'undefined') {
        wheatRenderer.init();
    }
    
    // Initialize crop manager
    if (typeof cropManager !== 'undefined') {
        cropManager.init();
    }
}

function draw() {
    background('#aac57a');
    drawField();
    drawBaseAndCover();
    
    // *seed the land*
    if (typeof cropManager !== 'undefined') {
        cropManager.drawSeeds();
        cropManager.updateGrowth();
    }
    
    drawGrid();
    drawFence();
    
    // land selection highlights
    if (typeof landManager !== 'undefined' && landManager.drawLandHighlights) {
        landManager.drawLandHighlights();
    }
    
    if (typeof updatePlayer === 'function') updatePlayer();
    if (typeof getPlayerState === 'function') {
        const p = getPlayerState();
        maybeEraseCover(p.x, p.y, p);
    }
    if (typeof drawPlayer === 'function') drawPlayer();
}

function drawField() {
    fill(COLORS.ground);
    noStroke();
    rect(BORDER_WIDTH, BORDER_WIDTH, PLAY_AREA, PLAY_AREA);
}

function drawTilledLayer() {
    // deprecreated, but I wanna keep this here
}

function drawBaseAndCover() {
    if (!baseStripesLayer || !coverLayer) return;
    push();
    imageMode(CORNER);
    image(baseStripesLayer, BORDER_WIDTH, BORDER_WIDTH);
    image(coverLayer, BORDER_WIDTH, BORDER_WIDTH);
    pop();
}

function maybeEraseCover(canvasX, canvasY, playerState) {
    if (!coverLayer) return;
    if (canvasX < BORDER_WIDTH || canvasX > CANVAS_SIZE - BORDER_WIDTH) return;
    if (canvasY < BORDER_WIDTH || canvasY > CANVAS_SIZE - BORDER_WIDTH) return;

    const dx = canvasX - _lastTilled.x;
    const dy = canvasY - _lastTilled.y;
    const distSq = dx * dx + dy * dy;
    const minDist = 6; 
    if (distSq < minDist * minDist) return;

    const localX = canvasX - BORDER_WIDTH;
    const localY = canvasY - BORDER_WIDTH;

    eraseCoverAt(localX, localY, playerState);
    _lastTilled.x = canvasX;
    _lastTilled.y = canvasY;
}

function eraseCoverAt(localX, localY, playerState) {
    const w = 48;
    const h = 56;

    coverLayer.push();
    coverLayer.erase();
    coverLayer.ellipse(localX, localY, w, h);
    coverLayer.noErase();
    coverLayer.pop();
    
    // Record tilling in crop manager
    if (typeof cropManager !== 'undefined') {
        cropManager.recordTilling(localX, localY);
    }
}

function drawGrid() {
    stroke(COLORS.gridLine);
    strokeWeight(2);
    for (let i = 1; i < GRID_SIZE; i++) {
        let x = BORDER_WIDTH + (i * PLAY_AREA / GRID_SIZE);
        line(x, BORDER_WIDTH, x, CANVAS_SIZE - BORDER_WIDTH);
    }
    for (let i = 1; i < GRID_SIZE; i++) {
        let y = BORDER_WIDTH + (i * PLAY_AREA / GRID_SIZE);
        line(BORDER_WIDTH, y, CANVAS_SIZE - BORDER_WIDTH, y);
    }
}

function drawFence() {
    stroke(COLORS.border);
    strokeWeight(4);
    noFill();

    rect(5, 5, CANVAS_SIZE - 10, CANVAS_SIZE - 10);
    rect(15, 15, CANVAS_SIZE - 30, CANVAS_SIZE - 30);
    
    fill(COLORS.fencePost);
    noStroke();
    
    rect(0, 0, 20, 20);
    rect(CANVAS_SIZE - 20, 0, 20, 20);
    rect(0, CANVAS_SIZE - 20, 20, 20);
    rect(CANVAS_SIZE - 20, CANVAS_SIZE - 20, 20, 20);

    stroke(COLORS.border);
    strokeWeight(2);
    for (let x = 30; x < CANVAS_SIZE - 30; x += 15) {
        line(x, 8, x + 10, 8);
        line(x, CANVAS_SIZE - 8, x + 10, CANVAS_SIZE - 8);
    }
    
    for (let y = 30; y < CANVAS_SIZE - 30; y += 15) {
        line(8, y, 8, y + 10);
        line(CANVAS_SIZE - 8, y, CANVAS_SIZE - 8, y + 10);
    }
}

function gridToPixel(gridX, gridY) {
    return {
        x: BORDER_WIDTH + (gridX * PLAY_AREA / GRID_SIZE),
        y: BORDER_WIDTH + (gridY * PLAY_AREA / GRID_SIZE)
    };
}

function getCellCenter(cellX, cellY) {
    let cellWidth = PLAY_AREA / GRID_SIZE;
    return {
        x: BORDER_WIDTH + (cellX * cellWidth) + (cellWidth / 2),
        y: BORDER_WIDTH + (cellY * cellWidth) + (cellWidth / 2)
    };
}