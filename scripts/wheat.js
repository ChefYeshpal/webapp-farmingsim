// Wheat crop rendering system

class WheatCropRenderer {
    constructor() {
        this.wheatLayer = null;
        this.wheatColor = '#DDA15E';
        this.stripeColors = ['#DDA15E', '#E8B878', '#C99554', '#F4E4C1'];
    }
    
    init() {
        if (typeof createGraphics === 'function') {
            this.wheatLayer = createGraphics(PLAY_AREA, PLAY_AREA);
            this.wheatLayer.clear();
            console.log('WheatCropRenderer initialized');
        }
    }
    
    renderWheatOnPlots(ownedLandSet) {
        if (!this.wheatLayer || typeof landManager === 'undefined') {
            return;
        }
        
        this.wheatLayer.clear();
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        
        // Iterate through all owned land plots
        ownedLandSet.forEach(plotKey => {
            const [plotX, plotY] = plotKey.split(',').map(Number);
            
            const startX = plotX * cellWidth;
            const startY = plotY * cellWidth;
            
            this.drawWheatInPlot(startX, startY, cellWidth);
        });
        
        console.log('🌾 Wheat rendered on all owned plots');
    }
    
    drawWheatInPlot(startX, startY, cellWidth) {
        this.wheatLayer.push();
        const stripeWidth = 4;
        const numStripes = Math.floor(cellWidth / stripeWidth);
        
        for (let i = 0; i < numStripes; i++) {
            const x = startX + (i * stripeWidth);
            
            const colorIndex = Math.floor(Math.random() * this.stripeColors.length);
            const stripeColor = this.stripeColors[colorIndex];
            
            const baseHeight = cellWidth * 0.85;
            const heightVariation = cellWidth * 0.15;
            const stripeHeight = baseHeight + (Math.random() * heightVariation);
            
            const bottomY = startY + cellWidth;
            const topY = bottomY - stripeHeight;
            
            this.wheatLayer.noStroke();
            this.wheatLayer.fill(stripeColor);
            this.wheatLayer.rect(x, topY, stripeWidth, stripeHeight);
            
            const tipHeight = 6;
            this.wheatLayer.fill('#C99554');
            this.wheatLayer.rect(x, topY, stripeWidth, tipHeight);
            
            if (Math.random() > 0.7) {
                this.wheatLayer.stroke('#B8860B');
                this.wheatLayer.strokeWeight(1);
                this.wheatLayer.line(
                    x + stripeWidth/2, 
                    topY + tipHeight, 
                    x + stripeWidth/2, 
                    bottomY
                );
            }
        }
        
        for (let i = 0; i < cellWidth / 8; i++) {
            const grainX = startX + Math.random() * cellWidth;
            const grainY = startY + (cellWidth * 0.1) + Math.random() * (cellWidth * 0.2);
            
            this.wheatLayer.noStroke();
            this.wheatLayer.fill('#F4E4C1');
            this.wheatLayer.ellipse(grainX, grainY, 3, 5);
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
}

const wheatRenderer = new WheatCropRenderer();
