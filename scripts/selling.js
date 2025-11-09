// Selling and Market System

class MarketSystem {
    constructor() {
        this.harvestAmount = 0;
        this.wheatPerPlot = 100;
        this.sellButton = null;
        this.sellDialog = null;
        this.amountDisplay = null;
        this.priceInput = null;
        this.sellConfirmBtn = null;
        this.sellCancelBtn = null;
        this.estimatedSalesDisplay = null;
        this.estimatedRevenueDisplay = null;
        this.basePrice = 10;
        this.marketDemand = 1.0;
        this.priceElasticity = 0.8;
        
        this.isReadyToSell = false;
        this.money = 1000; 
    }
    
    init() {
        this.createSellButton();
        this.createSellDialog();
    }
    
    createSellButton() {
        const buttonHTML = `
            <button id="sell-produce-btn" class="sell-button" style="display: none;">
                Sell Produce
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', buttonHTML);
        this.sellButton = document.getElementById('sell-produce-btn');
        
        if (this.sellButton) {
            this.sellButton.addEventListener('click', () => this.showSellDialog());
        }
    }
    
    createSellDialog() {
        const dialogHTML = `
            <div id="sell-dialog" class="dialog-overlay" style="display: none;">
                <div class="dialog-box">
                    <h3>Sell Your Produce</h3>
                    <div class="sell-info">
                        <div class="sell-info-row">
                            <span class="sell-label">Amount:</span>
                            <span class="sell-value" id="sell-amount">0 units</span>
                        </div>
                        <div class="sell-info-row">
                            <span class="sell-label">Base Price:</span>
                            <span class="sell-value">$${this.basePrice}/unit</span>
                        </div>
                    </div>
                    
                    <div class="price-input-section">
                        <label for="price-input" class="price-label">Set Your Price:</label>
                        <div class="price-input-wrapper">
                            <span class="price-symbol">$</span>
                            <input type="number" id="price-input" class="price-input" 
                                   min="1" max="100" value="${this.basePrice}" step="0.5">
                            <span class="price-unit">/unit</span>
                        </div>
                        <p class="price-hint">💡 Higher prices = Lower sales volume</p>
                    </div>
                    
                    <div class="market-forecast">
                        <h4>Market Forecast</h4>
                        <div class="forecast-row">
                            <span class="forecast-label">Expected Sales:</span>
                            <span class="forecast-value" id="estimated-sales">0 units</span>
                        </div>
                        <div class="forecast-row">
                            <span class="forecast-label">Estimated Revenue:</span>
                            <span class="forecast-value revenue" id="estimated-revenue">$0</span>
                        </div>
                    </div>
                    
                    <div class="dialog-buttons">
                        <button id="sell-confirm-btn" class="dialog-btn yes-btn">Sell!</button>
                        <button id="sell-cancel-btn" class="dialog-btn no-btn">Cancel</button>
                    </div>
                    <p class="dialog-hint">Press Enter to confirm, ESC to cancel</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        this.sellDialog = document.getElementById('sell-dialog');
        this.amountDisplay = document.getElementById('sell-amount');
        this.priceInput = document.getElementById('price-input');
        this.sellConfirmBtn = document.getElementById('sell-confirm-btn');
        this.sellCancelBtn = document.getElementById('sell-cancel-btn');
        this.estimatedSalesDisplay = document.getElementById('estimated-sales');
        this.estimatedRevenueDisplay = document.getElementById('estimated-revenue');
        
        if (this.priceInput) {
            this.priceInput.addEventListener('input', () => this.updateMarketForecast());
        }
        
        if (this.sellConfirmBtn) {
            this.sellConfirmBtn.addEventListener('click', () => this.confirmSale());
        }
        
        if (this.sellCancelBtn) {
            this.sellCancelBtn.addEventListener('click', () => this.hideSellDialog());
        }
        
        document.addEventListener('keydown', (e) => this.handleSellDialogKeyPress(e));
    }
    
    handleSellDialogKeyPress(e) {
        if (!this.isSellDialogOpen()) return;
        
        // Don't interfere if typing in the price input
        if (document.activeElement === this.priceInput) return;
        
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                this.confirmSale();
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.hideSellDialog();
                break;
        }
    }
    
    isSellDialogOpen() {
        return this.sellDialog && this.sellDialog.style.display === 'flex';
    }
    
    updateHarvestProgress(harvestedPercentage) {
        if (harvestedPercentage >= 80 && !this.isReadyToSell) {
            this.isReadyToSell = true;
            this.calculateHarvestAmount();
            this.showSellButton();
        }
    }
    
    calculateHarvestAmount() {
        if (typeof wheatRenderer !== 'undefined' && typeof landManager !== 'undefined') {
            const stats = wheatRenderer.getHarvestStats();
            const ownedPlots = landManager.ownedLand.size;
            
            // Each plot can yield up to wheatPerPlot units
            // Actual yield is based on harvest percentage
            const maxPossible = ownedPlots * this.wheatPerPlot;
            this.harvestAmount = Math.floor(maxPossible * (stats.percentageHarvested / 100));
        }
    }
    
    showSellButton() {
        if (this.sellButton) {
            this.sellButton.style.display = 'block';
        }
    }
    
    hideSellButton() {
        if (this.sellButton) {
            this.sellButton.style.display = 'none';
        }
    }
    
    showSellDialog() {
        if (this.sellDialog && this.amountDisplay) {
            this.amountDisplay.textContent = `${this.harvestAmount} units`;
            if (this.priceInput) {
                this.priceInput.value = this.basePrice;
            }
            this.updateMarketForecast();
            this.sellDialog.style.display = 'flex';
        }
    }
    
    hideSellDialog() {
        if (this.sellDialog) {
            this.sellDialog.style.display = 'none';
        }
    }
    
    updateMarketForecast() {
        if (!this.priceInput) return;
        
        const pricePerUnit = parseFloat(this.priceInput.value) || this.basePrice;
        const priceRatio = pricePerUnit / this.basePrice;
        
        // Calculate demand based on price elasticity
        // Higher prices reduce demand exponentially
        const demandMultiplier = Math.pow(1 / priceRatio, this.priceElasticity);
        const salesVolume = Math.floor(this.harvestAmount * Math.min(demandMultiplier, 1));
        const revenue = salesVolume * pricePerUnit;
        
        if (this.estimatedSalesDisplay) {
            this.estimatedSalesDisplay.textContent = `${salesVolume} units`;
            const salesPercent = (salesVolume / this.harvestAmount) * 100;
            if (salesPercent >= 80) {
                this.estimatedSalesDisplay.style.color = '#2d6a4f';
            } else if (salesPercent >= 50) {
                this.estimatedSalesDisplay.style.color = '#d4a574';
            } else {
                this.estimatedSalesDisplay.style.color = '#bc6c25';
            }
        }
        
        if (this.estimatedRevenueDisplay) {
            this.estimatedRevenueDisplay.textContent = `$${revenue.toFixed(2)}`;
        }
    }
    
    confirmSale() {
        const pricePerUnit = parseFloat(this.priceInput.value) || this.basePrice;
        const priceRatio = pricePerUnit / this.basePrice;
        const demandMultiplier = Math.pow(1 / priceRatio, this.priceElasticity);
        const salesVolume = Math.floor(this.harvestAmount * Math.min(demandMultiplier, 1));
        const revenue = salesVolume * pricePerUnit;
        
        this.money += revenue;
        
        if (typeof gameUI !== 'undefined') {
            console.log(`💰 Sold ${salesVolume} units for $${revenue.toFixed(2)}!`);
            console.log(`💵 Total money: $${this.money.toFixed(2)}`);
        }
        this.harvestAmount = 0;
        this.isReadyToSell = false;
        this.hideSellButton();
        this.hideSellDialog();
        if (typeof cropManager !== 'undefined') {
            cropManager.isHarvestable = false;
            cropManager.seedsPlanted = false;
            cropManager.plantingDialogShown = false;
            cropManager.currentStageIndex = -1;
            
            if (typeof gameUI !== 'undefined') {
                gameUI.setCrop('None');
                gameUI.setCropProgress(0);
            }
        }
        if (typeof wheatRenderer !== 'undefined') {
            wheatRenderer.clearWheat();
        }
        
        if (typeof coverLayer !== 'undefined') {
            coverLayer.noStroke();
            coverLayer.fill(COLORS.wheat);
            coverLayer.rect(0, 0, PLAY_AREA, PLAY_AREA);
        }
    }
    
    getMoney() {
        return this.money;
    }
}
const marketSystem = new MarketSystem();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        marketSystem.init();
    });
} else {
    marketSystem.init();
}
