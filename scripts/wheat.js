class WheatCropRenderer {
    constructor() {
        this.wheatLayer = null;
        this.baseWheatColor = '#DDA15E';
        this.darkStripeColors = ['#C99554', '#B8860B', '#A67C52'];
        this.lightStripeColors = ['#E8C9A0', '#D4B896', '#C4A882'];
        
        this.pixelSize = 1;
        this.harvestedPixels = new Set(); // Track harvested areas
        this._lastHarvested = { x: -9999, y: -9999 }; // Track last harvest position
        this.harvestCounter = 0; // Counter for crop amount increments
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
        this.harvestedPixels.clear();
        this.harvestCounter = 0;
        this._lastHarvested = { x: -9999, y: -9999 };
    }
    harvestAt(localX, localY) {
        if (!this.wheatLayer) return;
        
        const w = 48;
        const h = 56;
        
        this.wheatLayer.push();
        this.wheatLayer.erase();
        this.wheatLayer.ellipse(localX, localY, w, h);
        this.wheatLayer.noErase();
        this.wheatLayer.pop();
        
        // Record harvested area
        const key = `${Math.round(localX)},${Math.round(localY)}`;
        this.harvestedPixels.add(key);
        
        this._lastHarvested.x = localX;
        this._lastHarvested.y = localY;
    }
    
    isFullyHarvested(ownedLandSet) {
        if (typeof landManager === 'undefined') return false;
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        const cellArea = cellWidth * cellWidth;
        const totalOwnedArea = ownedLandSet.size * cellArea;
        
        const harvestedPixels = this.harvestedPixels.size;
        const harvestedPercentage = (harvestedPixels / totalOwnedArea) * 100;
        return harvestedPercentage >= 90;
    }
    
    getHarvestStats() {
        if (typeof landManager === 'undefined') {
            return {
                harvestedPixels: 0,
                percentageHarvested: 0
            };
        }
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        const cellArea = cellWidth * cellWidth;
        const totalOwnedArea = landManager.ownedLand.size * cellArea;
        
        const harvestedPixels = this.harvestedPixels.size;
        const percentageHarvested = totalOwnedArea > 0 ? (harvestedPixels / totalOwnedArea) * 100 : 0;
        
        return {
            harvestedPixels,
            percentageHarvested,
            totalArea: totalOwnedArea
        };
    }
    
    testWheatRender(plotX = 0, plotY = 0, cellWidth = 100) {
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

window.getHarvestStatus = function() {
    if (typeof wheatRenderer === 'undefined') {
        console.error('Wheat renderer not initialized');
        return;
    }
    
    const stats = wheatRenderer.getHarvestStats();
    console.log('=== HARVEST STATUS ===');
    console.log(`Harvested Pixels: ${stats.harvestedPixels}`);
    console.log(`Total Area: ${Math.round(stats.totalArea)} pixels`);
    console.log(`Percentage Harvested: ${stats.percentageHarvested.toFixed(2)}%`);
    console.log(`Crop Amount: ${typeof gameUI !== 'undefined' ? gameUI.getCropAmount() : 'N/A'}`);
    console.log('======================');
    
    return stats;
};
