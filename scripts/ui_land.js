// Land Purchase System

class LandPurchaseManager {
    constructor() {
        this.isLandSelectionMode = false;
        this.selectedLandX = 0;
        this.selectedLandY = 0;
        this.ownedLand = new Set();
        this.ownedLand.add('1,2');
        
        this.landDisplay = null;
        this.dialogOverlay = null;
        this.landPriceDisplay = null;
        this.yesBtn = null;
        this.noBtn = null;
        
        // 3x3
        this.gridSize = 3;
        this.currentPlotX = 1;
        this.currentPlotY = 2;
        this.raisedAmount = 0;
        this.raisedTarget = 0;
        this.raisedSpeed = 0.15;
        this.flashRed = false;
        this.flashAlpha = 0;
    }
    
    init() {
        this.landDisplay = document.getElementById('land-display');
        this.dialogOverlay = document.getElementById('land-purchase-dialog');
        this.landPriceDisplay = document.getElementById('land-price');
        this.yesBtn = document.getElementById('land-yes-btn');
        this.noBtn = document.getElementById('land-no-btn');
        this.createPlantingWarningDialog();
        
        console.log('LandManager initialized:', {
            landDisplay: !!this.landDisplay,
            dialogOverlay: !!this.dialogOverlay,
            landPriceDisplay: !!this.landPriceDisplay,
            yesBtn: !!this.yesBtn,
            noBtn: !!this.noBtn
        });
        if (this.landDisplay) {
            this.landDisplay.addEventListener('click', () => this.toggleLandSelectionMode());
        }
        if (this.yesBtn) {
            this.yesBtn.addEventListener('click', () => this.confirmPurchase());
        }
        
        if (this.noBtn) {
            this.noBtn.addEventListener('click', () => this.cancelPurchase());
        }
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    createPlantingWarningDialog() {
        const dialogHTML = `
            <div id="planting-warning-dialog" class="dialog-overlay" style="display: none;">
                <div class="dialog-box">
                    <h3>Warning!</h3>
                    <p>If you buy this plot, you won't be able to plant anything until your next harvest.</p>
                    <div class="dialog-buttons">
                        <button id="warning-ok-btn" class="dialog-btn yes-btn">OK</button>
                        <button id="warning-no-btn" class="dialog-btn no-btn">No</button>
                    </div>
                    <p class="dialog-hint">Press Enter to confirm, ESC to cancel</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        this.plantingWarningDialog = document.getElementById('planting-warning-dialog');
        this.warningOkBtn = document.getElementById('warning-ok-btn');
        this.warningNoBtn = document.getElementById('warning-no-btn');
        
        if (this.warningOkBtn) {
            this.warningOkBtn.addEventListener('click', () => this.confirmWarning());
        }
        
        if (this.warningNoBtn) {
            this.warningNoBtn.addEventListener('click', () => this.cancelWarning());
        }
    }
    
    toggleLandSelectionMode() {
        this.isLandSelectionMode = !this.isLandSelectionMode;
        
        if (this.isLandSelectionMode) {
            this.currentPlotX = 1;
            this.currentPlotY = 2;
            console.log('Purch: Land selection active');
        } else {
            console.log('Purch: Land selection deactive.');
        }
    }
    
    handleKeyPress(e) {
        console.log('Purch: Key pressed:', e.key, 'Selection mode:', this.isLandSelectionMode, 'Dialog open:', this.isDialogOpen());

        // Handle warning dialog controls FIRST
        if (this.isWarningDialogOpen()) {
            console.log('Purch: Warning dialog is open, handling warning dialog controls');
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    e.stopPropagation();
                    this.confirmWarning();
                    return;
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    this.cancelWarning();
                    return;
            }
            return;
        }

        // Handle dialog controls SECOND, this is cause for some reason them dialogue wouldn't show up
        if (this.isDialogOpen()) {
            console.log('Purch: Dialog is open, handling dialog controls'); // note: remove all these dumb comments later
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    e.stopPropagation();
                    this.confirmPurchase();
                    return; 
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    this.cancelPurchase();
                    return;
            }
            return;
        }
        
        // check for planting dialogue
        if (typeof cropManager !== 'undefined' && cropManager.isPlantingDialogOpen && cropManager.isPlantingDialogOpen()) {
            return;
        }

        if (e.key === 'b') {
            e.preventDefault();
            this.toggleLandSelectionMode();
            return;
        }

        if (this.isLandSelectionMode) {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.moveSelection(0, -1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveSelection(0, 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveSelection(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveSelection(1, 0);
                    break;
                case 'Enter':
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Purch: Enter pressed: trying to purchase land');
                    this.tryPurchaseLand();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.toggleLandSelectionMode();
                    break;
            }
        }
    }
    
    moveSelection(dx, dy) {
        let newX = this.currentPlotX + dx;
        let newY = this.currentPlotY + dy;
        
        // Keep within grid bounds (0-2 for 3x3 grid)
        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            if (this.isAdjacentToOwnedLand(newX, newY) || this.isLandOwned(newX, newY)) {
                this.currentPlotX = newX;
                this.currentPlotY = newY;
                this.raisedTarget = 8;
                console.log(`Purch: Selected plot: (${this.currentPlotX}, ${this.currentPlotY})`);
            } else {
                console.log('Purch: Cannot reach that land');
                this.triggerRedFlash();
            }
        }
    }
    
    triggerRedFlash() {
        this.flashRed = true;
        this.flashAlpha = 255;
    }
    
    tryPurchaseLand() {
        const key = `${this.currentPlotX},${this.currentPlotY}`;
        
        console.log('Purch: Attempting to purchase land at:', this.currentPlotX, this.currentPlotY);
        console.log('Purch: Is owned:', this.ownedLand.has(key));
        console.log('Purch: Is adjacent:', this.isAdjacentToOwnedLand(this.currentPlotX, this.currentPlotY));
        
        if (this.ownedLand.has(key)) {
            console.log('Purch: Already owned land');
            return;
        }
        
        if (!this.isAdjacentToOwnedLand(this.currentPlotX, this.currentPlotY)) {
            console.log('Purch: Land not adjacent to owned');
            return;
        }
        
        this.showPurchaseDialog();
    }
    
    isAdjacentToOwnedLand(x, y) {
        const directions = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ];
        
        for (let [dx, dy] of directions) {
            const checkKey = `${x + dx},${y + dy}`;
            if (this.ownedLand.has(checkKey)) {
                return true;
            }
        }
        
        return false;
    }
    
    showPurchaseDialog() {
        console.log('=== showPurchaseDialog called ===');
        if (!this.dialogOverlay) {
            console.log('Purchdialog: Dialog overlay was null, trying to find it again');
            this.dialogOverlay = document.getElementById('land-purchase-dialog');
        }
        if (!this.landPriceDisplay) {
            this.landPriceDisplay = document.getElementById('land-price');
        }
        
        console.log('Purchdialog: Dialog overlay element:', this.dialogOverlay);
        console.log('Purchdialog: Current display style:', this.dialogOverlay ? this.dialogOverlay.style.display : 'null');
        
        const price = this.calculateLandPrice(this.currentPlotX, this.currentPlotY);
        
        if (this.landPriceDisplay) {
            this.landPriceDisplay.textContent = `Price: $${price}`;
        }
        
        if (this.dialogOverlay) {
            this.dialogOverlay.style.display = 'flex';
            console.log('Purchdialog: Dialog display set to flex');
            console.log('Dialog is now open:', this.isDialogOpen());
            
            // Force a reflow to ensure the style is applied
            this.dialogOverlay.offsetHeight;
        } else {
            console.error('Purchdialog: ERROR: Dialog overlay element not found!');
        }
    }
    
    hideDialog() {
        console.log('=== hideDialog called ===');
        if (this.dialogOverlay) {
            this.dialogOverlay.style.display = 'none';
            console.log('Purchdialog: Dialog hidden');
        }
    }
    
    isDialogOpen() {
        const isOpen = this.dialogOverlay && this.dialogOverlay.style.display === 'flex';
        console.log('Purchdialog: isDialogOpen check:', isOpen, 'display value:', this.dialogOverlay?.style.display);
        return isOpen;
    }
    
    isWarningDialogOpen() {
        return this.plantingWarningDialog && this.plantingWarningDialog.style.display === 'flex';
    }
    
    showWarningDialog() {
        if (this.plantingWarningDialog) {
            this.plantingWarningDialog.style.display = 'flex';
            console.log('Purchdialog: Warning dialog shown');
        }
    }
    
    hideWarningDialog() {
        if (this.plantingWarningDialog) {
            this.plantingWarningDialog.style.display = 'none';
            console.log('Purchdialog: Warning dialog hidden');
        }
    }
    
    confirmWarning() {
        console.log('Purchdialog: User confirmed purchase despite warning');
        this.hideWarningDialog();
        this.executePurchase();
    }
    
    cancelWarning() {
        console.log('Purchdialog: User cancelled purchase from warning');
        this.hideWarningDialog();
    }
    
    executePurchase() {
        const key = `${this.currentPlotX},${this.currentPlotY}`;
        this.ownedLand.add(key);
        if (typeof gameUI !== 'undefined') {
            gameUI.addLand();
        }
        
        console.log(`Purchdialog: Purchased land at (${this.currentPlotX}, ${this.currentPlotY})`);
        console.log(`Purchdialog: Total owned land: ${this.ownedLand.size}`);
    }
    
    confirmPurchase() {
        this.hideDialog();
        
        // Check for seed planting
        const hasPlantedSeeds = typeof cropManager !== 'undefined' && cropManager.seedsPlanted;
        
        if (hasPlantedSeeds) {
            console.log('Purchdialog: Seeds are planted, showing warning dialog');
            this.showWarningDialog();
        } else {
            console.log('Purchdialog: No seeds planted, proceeding with purchase');
            this.executePurchase();
        }
    }
    
    cancelPurchase() {
        console.log('Purchdialog: Purchase cancelled.');
        this.hideDialog();
    }
    
    calculateLandPrice(x, y) {
        // For now, return a fixed price
        // will be made more complex later
        return 1000;
    }
    
    isLandOwned(x, y) {
        const key = `${x},${y}`;
        return this.ownedLand.has(key);
    }
    
    drawLandHighlights() {
        if (!this.isLandSelectionMode) return;
        
        push();
        if (this.raisedAmount < this.raisedTarget) {
            this.raisedAmount += this.raisedSpeed * (this.raisedTarget - this.raisedAmount);
        } else if (this.raisedAmount > this.raisedTarget) {
            this.raisedAmount -= this.raisedSpeed * (this.raisedAmount - this.raisedTarget);
        }
        if (this.flashRed) {
            this.flashAlpha -= 8;
            if (this.flashAlpha <= 0) {
                this.flashRed = false;
                this.flashAlpha = 0;
            }
        }
        if (this.flashRed && this.flashAlpha > 0) {
            fill(255, 0, 0, this.flashAlpha * 0.3);
            noStroke();
            rect(BORDER_WIDTH, BORDER_WIDTH, PLAY_AREA, PLAY_AREA);
        }
        const cellWidth = PLAY_AREA / this.gridSize;
        const baseX = BORDER_WIDTH + (this.currentPlotX * cellWidth);
        const baseY = BORDER_WIDTH + (this.currentPlotY * cellWidth);
        const x = baseX;
        const y = baseY - this.raisedAmount;
        const key = `${this.currentPlotX},${this.currentPlotY}`;
        const isOwned = this.ownedLand.has(key);
        const isAdjacent = this.isAdjacentToOwnedLand(this.currentPlotX, this.currentPlotY);
        fill(0, 0, 0, 40);
        noStroke();
        ellipse(baseX + cellWidth/2, baseY + cellWidth/2 + this.raisedAmount * 0.5, 
                cellWidth * 0.9, cellWidth * 0.6);
        if (isOwned) {
            fill(100, 150, 255, 180);
        } else if (isAdjacent) {
            fill(100, 255, 100, 180);
        } else {
            fill(255, 100, 100, 180);
        }
        
        noStroke();
        rect(x, y, cellWidth, cellWidth);
        stroke(255, 255, 0, 200);
        strokeWeight(5);
        noFill();
        rect(x + 3, y + 3, cellWidth - 6, cellWidth - 6);
        stroke(255, 255, 100, 100);
        strokeWeight(2);
        rect(x + 8, y + 8, cellWidth - 16, cellWidth - 16);
        
        pop(); // I wanna eat pop-corn
    }
}

const landManager = new LandPurchaseManager();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            landManager.init();
            console.log('Land manager initialized after DOM loaded');
        }, 100);
    });
} else {
    setTimeout(() => {
        landManager.init();
        console.log('Land manager initialized (DOM already ready)');
    }, 100);
}
