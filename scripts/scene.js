const CANVAS_SIZE = 600;
const GRID_SIZE = 3;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const BORDER_WIDTH = 20;
const PLAY_AREA = CANVAS_SIZE - (BORDER_WIDTH * 2);

const COLORS = {
    wheat: '#F5DEB3',
    darkWheat: '#DDA15E',
    lightWheat: '#FEFAE0',
    border: '#8B4513',
    fencePost: '#654321',
    ground: '#BC6C25',
    gridLine: '#D4A574'
}

function setup() {
    let canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent('game-container');
    noLoop(); // static for now, use loop() afterwards, just adding this so I remember what this does
}

function draw() {
    background(COLORS.ground);
    drawField();
    drawGrid();
    drawFence();
}

function drawField() {
    fill(COLORS.wheat);
    noStroke(); // heh, heart stroke
    rect(BORDER_WIDTH, BORDER_WIDTH, PLAY_AREA, PLAY_AREA);
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