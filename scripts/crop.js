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
        
        // Growth system
        this.growthStages = ['Seeds', 'Seedlings', 'Semi-Plantlings', 'Plantlings', 'Wheat'];
        this.currentStageIndex = -1;
        this.growthProgress = 0;
        this.growthDuration = 10000;
        this.lastUpdateTime = 0;
        this.isGrowing = false;
        this.isHarvestable = false;
        
        this.stageImages = {
            'Seeds': null,
            'Seedlings': null,
            'Semi-Plantlings': null,
            'Plantlings': null
        };
        
        this.tillingThreshold = 2.1;
    }
    
    init() {
        this.createPlantingDialog();
        if (typeof loadImage === 'function') {
            this.stageImages['Seeds'] = loadImage('assets/seed.png');
            this.stageImages['Seedlings'] = loadImage('assets/seedLINGS.png');
            this.stageImages['Semi-Plantlings'] = loadImage('assets/plantlings.png');
            this.stageImages['Plantlings'] = loadImage('assets/plantlings.png');
            this.seedImage = this.stageImages['Seeds'];
        }
        this.seedsLayer = createGraphics(PLAY_AREA, PLAY_AREA);
        this.seedsLayer.clear();
        
        // Initialize wheat renderer
        if (typeof wheatRenderer !== 'undefined') {
            wheatRenderer.init();
        }
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
        }
    }
    
    hidePlantingDialog() {
        if (this.plantingDialog) {
            this.plantingDialog.style.display = 'none';
        }
    }
    
    confirmPlanting() {
        this.plantSeeds();
        this.hidePlantingDialog();
        this.startGrowth();
    }
    
    cancelPlanting() {
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
        
        if (stats.percentageTilled >= this.tillingThreshold) {
            this.plantingDialogShown = true;
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
        
        this.currentStageIndex = 0;
        this.renderCurrentStage();
        
        this.seedsPlanted = true;
        
        if (typeof gameUI !== 'undefined') {
            gameUI.setCrop('Seeds');
        }
    }
    
    renderCurrentStage() {
        if (typeof landManager === 'undefined' || !this.seedsLayer) {
            return;
        }
        
        const stageName = this.growthStages[this.currentStageIndex];
        
        // Handle wheat stage separately
        if (stageName === 'Wheat') {
            this.seedsLayer.clear();
            if (typeof wheatRenderer !== 'undefined') {
                wheatRenderer.renderWheatOnPlots(landManager.ownedLand);
            }
            return;
        }
        
        this.seedsLayer.clear();
        
        const gridSize = landManager.gridSize;
        const cellWidth = PLAY_AREA / gridSize;
        const seedSpacing = 20;
        
        // growth stages
        let seedSize = 12;
        
        if (stageName === 'Seedlings') {
            seedSize = 18; 
        } else if (stageName === 'Semi-Plantlings') {
            seedSize = 21;
        } else if (stageName === 'Plantlings') {
            seedSize = 24;
        }
        
        const stageImage = this.stageImages[stageName];
        
        let seedCount = 0;
        
        // Iterate through all owned land plots
        landManager.ownedLand.forEach(plotKey => {
            const [plotX, plotY] = plotKey.split(',').map(Number);
            
            const startX = plotX * cellWidth;
            const startY = plotY * cellWidth;
            
            for (let x = startX + seedSpacing/2; x < startX + cellWidth; x += seedSpacing) {
                for (let y = startY + seedSpacing/2; y < startY + cellWidth; y += seedSpacing) {
                    if (stageImage && stageImage.width > 0) {
                        this.seedsLayer.push();
                        this.seedsLayer.imageMode(CENTER);
                        this.seedsLayer.noSmooth();
                        this.seedsLayer.image(stageImage, x, y, seedSize, seedSize);
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
    }
    
    startGrowth() {
        this.isGrowing = true;
        this.growthProgress = 0;
        this.lastUpdateTime = millis();
    }
    
    getCurrentStageDuration() {
        const stageName = this.growthStages[this.currentStageIndex];
        if (stageName === 'Plantlings') {
            return 20000; // 20 seconds
        }
        return 10000; // 10 seconds for all other stages
    }
    
    updateGrowth() {
        if (!this.isGrowing || this.currentStageIndex < 0) {
            return;
        }
        
        if (typeof gameUI !== 'undefined' && gameUI.isGamePaused()) {
            this.lastUpdateTime = millis();
            return;
        }
        
        const currentTime = millis();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
    
        const timeMultiplier = typeof gameUI !== 'undefined' ? gameUI.getTimeMultiplier() : 1;
        this.growthProgress += deltaTime * timeMultiplier;
        
        const currentDuration = this.getCurrentStageDuration();
        
        // Calculate percentage for progress bar
        const percentage = (this.growthProgress / currentDuration) * 100;
        
        if (typeof gameUI !== 'undefined') {
            gameUI.setCropProgress(Math.min(percentage, 100));
        }
        
        if (this.growthProgress >= currentDuration) {
            this.advanceStage();
        }
    }
    
    advanceStage() {
        this.currentStageIndex++;
        
        if (this.currentStageIndex >= this.growthStages.length) {
            // All stages complete
            this.isGrowing = false;
            if (typeof gameUI !== 'undefined') {
                gameUI.setCropProgress(100);
            }
            return;
        }
        
        this.growthProgress = 0;
        
        const stageName = this.growthStages[this.currentStageIndex];
        
        if (stageName === 'Wheat') {
            this.isGrowing = false;
            this.isHarvestable = true;
            if (typeof gameUI !== 'undefined') {
                gameUI.setCropProgress(0);
            }
        } else {
            if (typeof gameUI !== 'undefined') {
                gameUI.setCropProgress(0);
            }
        }
        
        if (typeof gameUI !== 'undefined') {
            gameUI.setCrop(stageName);
        }
        this.renderCurrentStage();
    }
    
    drawSeeds() {
        if (this.seedsPlanted && this.seedsLayer) {
            push();
            imageMode(CORNER);
            image(this.seedsLayer, BORDER_WIDTH, BORDER_WIDTH);
            pop();
        }
        
        const stageName = this.growthStages[this.currentStageIndex];
        if (stageName === 'Wheat' && typeof wheatRenderer !== 'undefined') {
            wheatRenderer.drawWheat();
        }
    }
    
    // Testing function
    autoTillAndPrompt() {
        if (typeof landManager === 'undefined') {
            console.error('LandManager not found');
            return;
        }
        
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
        
        this.plantingDialogShown = false;
        this.seedsPlanted = false;
        this.checkTillingProgress();
    }
    
    reset() {
        this.tilledPixels.clear();
        this.seedsPlanted = false;
        this.plantingDialogShown = false;
        this.isGrowing = false;
        this.isHarvestable = false;
        this.growthProgress = 0;
        this.currentStageIndex = -1;
        if (this.seedsLayer) {
            this.seedsLayer.clear();
        }
        if (typeof gameUI !== 'undefined') {
            gameUI.setCropProgress(0);
        }
        if (typeof wheatRenderer !== 'undefined') {
            wheatRenderer.clearWheat();
        }
    }
}

// Create global instance
const cropManager = new CropManager();
window.getTillingStatus = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    const stats = cropManager.getTillingStats();
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
    cropManager.startGrowth();
};

window.testGrowth = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    console.log('=== GROWTH TEST ===');
    console.log('Current stage:', cropManager.growthStages[cropManager.currentStageIndex]);
    console.log('Progress:', cropManager.growthProgress, '/', cropManager.getCurrentStageDuration());
    console.log('Is growing:', cropManager.isGrowing);
    console.log('Is harvestable:', cropManager.isHarvestable);
    console.log('===================');
};

window.skipStage = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    if (!cropManager.isGrowing && !cropManager.isHarvestable) {
        return;
    }
    
    cropManager.advanceStage();
};

// Quick function to reach wheat stage for testing
window.skipToWheat = function() {
    if (typeof cropManager === 'undefined') {
        console.error('CropManager not initialized');
        return;
    }
    
    // Skip all stages until wheat
    while (cropManager.currentStageIndex < cropManager.growthStages.length - 1) {
        cropManager.advanceStage();
    }
};
