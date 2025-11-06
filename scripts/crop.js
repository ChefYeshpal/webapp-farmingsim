// Crop and tilling management system

class CropManager {
    constructor() {
        this.tilledPixels = new Set();
        this.seedsPlanted = false;
        this.seedImage = null;
        this.seedsLayer = null;
        this.plantingDialogShown = false;
        this.plantingDialog = null;
        this.plantYesBtn = null;
        this.plantNoBtn = null;
        
        // Threshold for showing the planting dialog (0.8% of owned land tilled - lowered for easier testing)
        // This means tilled land should be about 0.8% of the land area (roughly 279 pixels for a single plot, yeah I wipped out the calculator for this)
        this.tillingThreshold = 0.8;
    }
    
    init() {
        this.createPlantingDialog();
        if (typeof loadImage === 'function') {
            this.seedImage = loadImage('assets/seed.png');
        }
        this.seedsLayer = createGraphics(PLAY_AREA, PLAY_AREA);
        this.seedsLayer.clear();
        
        console.log('CropManager initialized');
    }
    
    createPlantingDialog() {
        let existingDialog = document.getElementById('planting-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        const dialogHTML = `
            <div id="planting-dialog" class="dialog-overlay" style="display: none;">
                <div class="dialog-box">
                    <h3>Planting tiem!</h3>
                    <p>Tilled 100% of owned land</p>
                    <p>Do you want to plant seeds?</p>
                    <div class="dialog-buttons">
                        <button id="plant-yes-btn" class="dialog-btn yes-btn">Yes</button>
                        <button id="plant-no-btn" class="dialog-btn no-btn">No</button>
                    </div>
                    <p class="dialog-hint">Press Enter to confirm, ESC to cancel</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        this.plantingDialog = document.getElementById('planting-dialog');
        this.plantYesBtn = document.getElementById('plant-yes-btn');
        this.plantNoBtn = document.getElementById('plant-no-btn');
        
        if (this.plantYesBtn) {
            this.plantYesBtn.addEventListener('click', () => this.confirmPlanting());
        }
        
        if (this.plantNoBtn) {
            this.plantNoBtn.addEventListener('click', () => this.cancelPlanting());
        }
        
        document.addEventListener('keydown', (e) => this.handlePlantingKeyPress(e));
    }
    
    handlePlantingKeyPress(e) {
        if (!this.isPlantingDialogOpen()) return;
        
        if (typeof landManager !== 'undefined' && landManager.isDialogOpen && landManager.isDialogOpen()) {
            return;
        }
        
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                this.confirmPlanting();
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.cancelPlanting();
                break;
        }
    }
    
    isPlantingDialogOpen() {
        return this.plantingDialog && this.plantingDialog.style.display === 'flex';
    }
    
    showPlantingDialog() {
        if (this.plantingDialog) {
            this.plantingDialog.style.display = 'flex';
            console.log('Planting dialog shown');
        }
    }
    
    hidePlantingDialog() {
        if (this.plantingDialog) {
            this.plantingDialog.style.display = 'none';
            console.log('Planting dialog hidden');
        }
    }
    
    confirmPlanting() {
        console.log('User confirmed planting');
        this.plantSeeds();
        this.hidePlantingDialog();
    }
    
    cancelPlanting() {
        console.log('User canceled planting');
        this.hidePlantingDialog();
        this.plantingDialogShown = false;
    }
    
    // Track when land is tilled
    recordTilling(localX, localY) {
        const key = `${Math.round(localX)},${Math.round(localY)}`;
        this.tilledPixels.add(key);
        this.checkTillingProgress();
    }
    
    checkTillingProgress() {
        if (this.plantingDialogShown || this.seedsPlanted) return;
        
        const stats = this.getTillingStats();
        
        console.log(`Tilling check: ${stats.percentageTilled.toFixed(2)}% (threshold: ${this.tillingThreshold}%)`);
        
        // Show dialog when threshold percentage of owned land is tilled
        // percentageTilled is already in percentage form (0-100), so compare directly against threshold
        if (stats.percentageTilled >= this.tillingThreshold) {
            this.plantingDialogShown = true;
            console.log('🌱 Threshold reached! Showing planting dialog');
            this.showPlantingDialog();
        }
    }
    
    getTillingStats() {
        if (typeof landManager === 'undefined') {
            return {
                ownedLandArea: 0,
                tilledPixels: 0,
                percentageTilled: 0,
                ownedLandCount: 0
            };
        }
        
        const cellWidth = PLAY_AREA / landManager.gridSize;
        const cellArea = cellWidth * cellWidth;
        const ownedLandCount = landManager.ownedLand.size;
        const ownedLandArea = ownedLandCount * cellArea;
        
        const tilledPixels = this.tilledPixels.size;
        const percentageTilled = ownedLandArea > 0 ? (tilledPixels / ownedLandArea) * 100 : 0;
        
        return {
            ownedLandArea,
            tilledPixels,
            percentageTilled,
            ownedLandCount
        };
    }
    
    plantSeeds() {
        if (typeof landManager === 'undefined') {
            console.error('LandManager not found');
            return;
        }
        
        if (!this.seedsLayer) {
            console.error('Seeds layer not initialized');
            return;
        }
        
        console.log('Planting seeds on all owned land...');
        console.log('Seed image loaded:', this.seedImage && this.seedImage.width > 0);
        console.log('Owned land plots:', landManager.ownedLand.size);
        
        this.seedsLayer.clear();
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        const seedSpacing = 20;
        const seedSize = 12;
        
        let seedCount = 0;
        
        // Iterate through all owned land plots
        landManager.ownedLand.forEach(plotKey => {
            const [plotX, plotY] = plotKey.split(',').map(Number);
            
            const startX = plotX * cellWidth;
            const startY = plotY * cellWidth;
            
            console.log(`Planting on plot (${plotX}, ${plotY}) - startX: ${startX}, startY: ${startY}, cellWidth: ${cellWidth}`);
            
            for (let x = startX + seedSpacing/2; x < startX + cellWidth; x += seedSpacing) {
                for (let y = startY + seedSpacing/2; y < startY + cellWidth; y += seedSpacing) {
                    if (this.seedImage && this.seedImage.width > 0) {
                        this.seedsLayer.push();
                        this.seedsLayer.imageMode(CENTER);
                        this.seedsLayer.image(this.seedImage, x, y, seedSize, seedSize);
                        this.seedsLayer.pop();
                    } else {
                        this.seedsLayer.push();
                        this.seedsLayer.fill(139, 69, 19);
                        this.seedsLayer.noStroke();
                        this.seedsLayer.ellipse(x, y, seedSize, seedSize);
                        this.seedsLayer.pop();
                    }
                    seedCount++;
                }
            }
        });
        
        this.seedsPlanted = true;
        console.log(`Seeds planted successfully! Total seeds: ${seedCount}`);
        console.log('Seeds layer dimensions:', this.seedsLayer.width, 'x', this.seedsLayer.height);
        
        // Update UI
        if (typeof gameUI !== 'undefined') {
            gameUI.setCrop('Seeds');
        }
    }
    
    drawSeeds() {
        if (this.seedsPlanted && this.seedsLayer) {
            push();
            imageMode(CORNER);
            image(this.seedsLayer, BORDER_WIDTH, BORDER_WIDTH);
            pop();
        }
    }
    
    // Testing function
    autoTillAndPrompt() {
        if (typeof landManager === 'undefined') {
            console.error('LandManager not found');
            return;
        }
        
        console.log('AUTO-TILLING all owned land for testing...');
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        
        this.tilledPixels.clear();
        
        landManager.ownedLand.forEach(plotKey => {
            const [plotX, plotY] = plotKey.split(',').map(Number);
            
            const startX = plotX * cellWidth;
            const startY = plotY * cellWidth;
            
            for (let x = Math.floor(startX); x < Math.floor(startX + cellWidth); x += 5) {
                for (let y = Math.floor(startY); y < Math.floor(startY + cellWidth); y += 5) {
                    const key = `${x},${y}`;
                    this.tilledPixels.add(key);
                }
            }
        });
        
        const stats = this.getTillingStats();
        console.log(`Auto-tilled ${stats.tilledPixels} pixels (${stats.percentageTilled.toFixed(2)}%)`);
        
        this.plantingDialogShown = false;
        this.seedsPlanted = false;
        this.checkTillingProgress();
    }
    
    reset() {
        this.tilledPixels.clear();
        this.seedsPlanted = false;
        this.plantingDialogShown = false;
        if (this.seedsLayer) {
            this.seedsLayer.clear();
        }
        console.log('Crop system reset');
    }
}

// Create global instance
const cropManager = new CropManager();

// Initialize when p5.js is ready
if (typeof setup !== 'undefined') {
    console.log('CropManager will be initialized in setup()');
}
window.getTillingStatus = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    const stats = cropManager.getTillingStats();
    // WHY DO I LIKE CONSOLE LOGS SO MUCH?!?!?!?!??!?!
    // Its cause then i'll know where i eff up, i aint a god
    console.log('=== TILLING STATUS ===');
    console.log(`Owned Land Plots: ${stats.ownedLandCount}`);
    console.log(`Owned Land Area: ${Math.round(stats.ownedLandArea)} pixels`);
    console.log(`Tilled Pixels: ${stats.tilledPixels}`);
    console.log(`Percentage Tilled: ${stats.percentageTilled.toFixed(2)}%`);
    console.log('======================');
    
    return stats;
};

window.checkTilling = window.getTillingStatus;

// yet another testing function: Auto-till all owned land and show the planting dialog
window.autoTill = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    cropManager.autoTillAndPrompt();
};

// oh no step-plant~ dont force yourself~~
window.forcePlant = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    cropManager.plantSeeds();
};
