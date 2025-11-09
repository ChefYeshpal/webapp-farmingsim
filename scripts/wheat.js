// Wheat crop rendering system - Pixel Art Top-Down View

class WheatCropRenderer {
    constructor() {
        this.wheatLayer = null;
        // Main wheat color (dominant)
        this.mainWheatColor = '#DDA15E';
        this.strayColors = ['#E8B878', '#C99554', '#F4E4C1', '#B8860B'];
        // Pixel size for retro look
        this.pixelSize = 4;
        // Animation offset for swaying
        this.swayOffset = 0;
        this.swaySpeed = 0.03;
    }
    
    init() {
        if (typeof createGraphics === 'function') {
            this.wheatLayer = createGraphics(PLAY_AREA, PLAY_AREA);
            this.wheatLayer.clear();
            this.wheatLayer.noSmooth();
        }
    }
    
    renderWheatOnPlots(ownedLandSet) {
        if (!this.wheatLayer || typeof landManager === 'undefined') {
            return;
        }
        
        this.wheatLayer.clear();
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        
        // Update sway animation
        this.swayOffset += this.swaySpeed;
        
        // Iterate through all owned land plots
        ownedLandSet.forEach(plotKey => {
            const [plotX, plotY] = plotKey.split(',').map(Number);
            
            const startX = plotX * cellWidth;
            const startY = plotY * cellWidth;
            
            this.drawWheatInPlot(startX, startY, cellWidth);
        });
    }
    
    drawWheatInPlot(startX, startY, cellWidth) {
        this.wheatLayer.push();
        this.wheatLayer.noStroke();
        
        const pixelSize = this.pixelSize;
        const cols = Math.floor(cellWidth / pixelSize);
        const rows = Math.floor(cellWidth / pixelSize);
        
        // Fill most of the field with the main wheat color
        this.wheatLayer.fill(this.mainWheatColor);
        this.wheatLayer.rect(startX, startY, cellWidth, cellWidth);
        
        // Add subtle vertical stripes (darker spots)
        // Create stripes that are about 3 pixels tall, randomly placed
        const stripeWidth = pixelSize; // Single pixel width
        const stripeHeight = 3; // 3 pixels tall
        
        // Distribute stripes across the field
        const numStripes = Math.floor((cols * rows) * 0.08); // About 8% coverage
        
        for (let i = 0; i < numStripes; i++) {
            // Use noise for column selection to create subtle patterns
            const noiseVal = noise(i * 0.2 + this.swayOffset * 0.5);
            const col = Math.floor(noiseVal * cols);
            
            // Random row position
            const row = Math.floor(Math.random() * (rows - stripeHeight));
            
            const x = startX + col * pixelSize;
            const y = startY + row * pixelSize;
            
            // Use darker shades for the stripes
            const darkerColors = ['#C99554', '#B8860B'];
            const colorIndex = Math.floor(Math.random() * darkerColors.length);
            this.wheatLayer.fill(darkerColors[colorIndex]);
            
            // Draw vertical stripe (3 pixels tall)
            for (let j = 0; j < stripeHeight; j++) {
                this.wheatLayer.rect(x, y + j * pixelSize, pixelSize, pixelSize);
            }
        }
        
        // Add some animated "swaying" pixels using sine wave
        const numSwayPixels = Math.floor((cols * rows) * 0.04);
        
        for (let i = 0; i < numSwayPixels; i++) {
            const angle = this.swayOffset + i * 0.5;
            const swayX = sin(angle) * 0.5 + 0.5; // Normalize to 0-1
            const swayY = cos(angle * 1.3) * 0.5 + 0.5;
            
            const col = Math.floor(swayX * cols);
            const row = Math.floor(swayY * rows);
            
            const x = startX + col * pixelSize;
            const y = startY + row * pixelSize;
            
            // Lighter colors for swaying highlights
            this.wheatLayer.fill(this.strayColors[Math.floor(Math.random() * 2)]); // Use lighter colors
            this.wheatLayer.rect(x, y, pixelSize, pixelSize);
        }
        
        this.wheatLayer.pop();
    }
    
    drawWheat() {
        if (this.wheatLayer) {
            push();
            imageMode(CORNER);
            image(this.wheatLayer, BORDER_WIDTH, BORDER_WIDTH);
            pop();
        }
    }
    
    clearWheat() {
        if (this.wheatLayer) {
            this.wheatLayer.clear();
        }
    }
    
    // Console testing function to visualize wheat rendering
    testWheatRender(plotX = 0, plotY = 0, cellWidth = 100) {
        console.log('🌾 Testing wheat render...');
        console.log(`Plot: (${plotX}, ${plotY}), Cell Width: ${cellWidth}px`);
        console.log(`Pixel Size: ${this.pixelSize}px`);
        console.log(`Main Color: ${this.mainWheatColor}`);
        console.log(`Stray Colors: ${this.strayColors.join(', ')}`);
        console.log(`Current Sway Offset: ${this.swayOffset.toFixed(3)}`);
        
        if (this.wheatLayer) {
            this.wheatLayer.clear();
            this.drawWheatInPlot(plotX, plotY, cellWidth);
            console.log('✅ Test render complete - check canvas');
        } else {
            console.log('❌ Wheat layer not initialized. Call init() first.');
        }
    }
}

const wheatRenderer = new WheatCropRenderer();

// Global console function for easy testing
window.testWheat = function(plotX = 0, plotY = 0, cellWidth = 100) {
    wheatRenderer.testWheatRender(plotX, plotY, cellWidth);
};
