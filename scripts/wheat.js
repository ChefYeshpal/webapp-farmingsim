class WheatCropRenderer {
    constructor() {
        this.wheatLayer = null;
        this.baseWheatColor = '#DDA15E';
        this.darkStripeColors = ['#C99554', '#B8860B', '#A67C52'];
        this.lightStripeColors = ['#E8C9A0', '#D4B896', '#C4A882'];
        
        this.pixelSize = 1;
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
        this.wheatLayer.noStroke();
        this.wheatLayer.fill(this.baseWheatColor);
        this.wheatLayer.rect(startX, startY, cellWidth, cellWidth);
        const totalPixels = Math.floor(cellWidth);
        const numStripes = Math.floor(cellWidth * 2.5);
        
        for (let i = 0; i < numStripes; i++) {
            const x = startX + Math.floor(Math.random() * cellWidth);
            const stripeLength = 3 + Math.floor(Math.random() * 6); 
            const y = startY + Math.floor(Math.random() * (cellWidth - stripeLength));
            const isDark = Math.random() > 0.4;
            
            if (isDark) {
                const darkColor = this.darkStripeColors[Math.floor(Math.random() * this.darkStripeColors.length)];
                this.wheatLayer.fill(darkColor);
            } else {
                const lightColor = this.lightStripeColors[Math.floor(Math.random() * this.lightStripeColors.length)];
                this.wheatLayer.fill(lightColor);
            }
            this.wheatLayer.rect(x, y, 1, stripeLength);
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
    
    testWheatRender(plotX = 0, plotY = 0, cellWidth = 100) {
        console.log('🌾 Testing wheat render...');
        console.log(`Plot: (${plotX}, ${plotY}), Cell Width: ${cellWidth}px`);
        
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
window.testWheat = function(plotX = 0, plotY = 0, cellWidth = 100) {
    wheatRenderer.testWheatRender(plotX, plotY, cellWidth);
};
