class WheatCropRenderer {
    constructor() {
        this.wheatLayer = null;
        this.baseWheatColor = '#DDA15E';
        this.darkStripeColors = ['#C99554', '#B8860B', '#A67C52'];
        this.lightStripeColors = ['#E8C9A0', '#D4B896', '#C4A882'];
        
        this.pixelSize = 1;
        this.harvestedPixels = new Set();
        this._lastHarvested = { x: -9999, y: -9999 };
        
        // Cache for harvest stats to prevent lag cause browsers can be a bitch
        this._cachedStats = null;
        this._lastStatsCheck = 0;
        this._statsCheckInterval = 500;
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
        this._cachedStats = null;
        this._lastStatsCheck = 0;
    }
    
    // Harvest wheat at a specific location (called when tractor moves over wheat)
    harvestAt(localX, localY) {
        if (!this.wheatLayer) return;
        
        const dx = localX - this._lastHarvested.x;
        const dy = localY - this._lastHarvested.y;
        const distSq = dx * dx + dy * dy;
        const minDist = 6;
        if (distSq < minDist * minDist) return;
        
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
        
        // Add to crop amount (small increment per harvest action)
        if (typeof gameUI !== 'undefined') {
            gameUI.addCropAmount(1);
        }
        
        // Only check stats periodically to avoid lag
        if (typeof marketSystem !== 'undefined' && typeof landManager !== 'undefined') {
            const currentTime = millis();
            if (currentTime - this._lastStatsCheck > this._statsCheckInterval) {
                const stats = this.getHarvestStats(true);
                marketSystem.updateHarvestProgress(stats.percentageHarvested);
                this._lastStatsCheck = currentTime;
            }
        }
    }
    
    isFullyHarvested(ownedLandSet) {
        if (typeof landManager === 'undefined') return false;
        
        const stats = this.getHarvestStats();
        
        // Consider fully harvested when 80% is done
        return stats.percentageHarvested >= 80;
    }
    
    getHarvestStats(forceRefresh = false) {
        // Return cached stats if available and not forcing refresh
        if (!forceRefresh && this._cachedStats !== null) {
            return this._cachedStats;
        }
        
        if (typeof landManager === 'undefined' || !this.wheatLayer) {
            return {
                wheatPixelsRemaining: 0,
                percentageHarvested: 0,
                totalArea: 0
            };
        }
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        
        let wheatPixelsRemaining = 0;
        let totalPixelsChecked = 0;
        
        // Increased sample rate for better performance (check every 4 pixels instead of 2)
        const sampleRate = 4;
        
        this.wheatLayer.loadPixels();
        const pixels = this.wheatLayer.pixels;
        const layerWidth = this.wheatLayer.width;
        
        landManager.ownedLand.forEach(plotKey => {
            const [plotX, plotY] = plotKey.split(',').map(Number);
            
            const startX = Math.floor(plotX * cellWidth);
            const startY = Math.floor(plotY * cellWidth);
            const endX = Math.floor(startX + cellWidth);
            const endY = Math.floor(startY + cellWidth);
            
            for (let x = startX; x < endX; x += sampleRate) {
                for (let y = startY; y < endY; y += sampleRate) {
                    totalPixelsChecked++;
                    // Calculate pixel index in the pixels array
                    const index = (y * layerWidth + x) * 4;
                    // Check alpha channel (index + 3)
                    if (pixels[index + 3] > 0) {
                        wheatPixelsRemaining++;
                    }
                }
            }
        });
        
        const percentageHarvested = totalPixelsChecked > 0 
            ? ((totalPixelsChecked - wheatPixelsRemaining) / totalPixelsChecked) * 100 
            : 0;
        
        const stats = {
            wheatPixelsRemaining,
            percentageHarvested,
            totalArea: totalPixelsChecked
        };
        
        this._cachedStats = stats;
        
        return stats;
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

// Test harvest stats
window.getHarvestStatus = function() {
    if (typeof wheatRenderer === 'undefined') {
        console.error('Wheat renderer not initialized');
        return;
    }
    
    const stats = wheatRenderer.getHarvestStats();
    console.log('=== HARVEST STATUS ===');
    console.log(`Wheat Pixels Remaining: ${stats.wheatPixelsRemaining}`);
    console.log(`Total Area Checked: ${stats.totalArea} pixels`);
    console.log(`Percentage Harvested: ${stats.percentageHarvested.toFixed(2)}%`);
    console.log(`Crop Amount: ${typeof gameUI !== 'undefined' ? gameUI.getCropAmount() : 'N/A'}`);
    console.log('======================');
    
    return stats;
};
