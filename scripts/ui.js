// Handles the display and updates of game information

class GameUI {
    constructor() {
        this.currentDay = 1;
        this.currentSeason = 'Spring';
        this.currentYear = 1;
        this.currentCrop = 'None';
        this.cropAmount = 0;
        this.seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
        this.daysPerSeason = 28;
        this.daysPerYear = this.daysPerSeason * 4;
        this.dateDisplay = null;
        this.seasonDisplay = null;
        this.cropDisplay = null;
        this.cropText = null;
        this.cropProgressBar = null;
        this.landDisplay = null;
        this.yearProgress = null;
        this.progressIndicator = null;
        this.ownedLandCount = 1;
        this.totalLandCount = 9;
        
        this.isPaused = false;
        this.timeMultiplier = 1;
        this.pauseBtn = null;
        this.speed2xBtn = null;
        this.speed5xBtn = null;
    }
    
    init() {
        this.dateDisplay = document.getElementById('date-display');
        this.seasonDisplay = document.getElementById('season-display');
        this.cropDisplay = document.getElementById('crop-display');
        this.cropText = document.getElementById('crop-text');
        this.cropProgressBar = document.getElementById('crop-progress-bar');
        this.landDisplay = document.getElementById('land-display');
        this.yearProgress = document.getElementById('year-progress');
        this.progressIndicator = document.getElementById('progress-indicator');

        this.pauseBtn = document.getElementById('pause-btn');
        this.speed2xBtn = document.getElementById('speed-2x-btn');
        this.speed5xBtn = document.getElementById('speed-5x-btn');
        
        this.setupTimeControls();
        this.updateDisplay();
    }
    
    setupTimeControls() {
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (this.speed2xBtn) {
            this.speed2xBtn.addEventListener('click', () => this.setTimeMultiplier(2));
        }
        
        if (this.speed5xBtn) {
            this.speed5xBtn.addEventListener('click', () => this.setTimeMultiplier(5));
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseBtn.textContent = '▶';
            this.pauseBtn.classList.add('active');
            this.timeMultiplier = 1;
            this.updateSpeedButtons();
        } else {
            this.pauseBtn.textContent = '||';
            this.pauseBtn.classList.remove('active');
        }
    }
    
    setTimeMultiplier(multiplier) {
        if (this.isPaused) {
            this.togglePause();
        }
        
        this.timeMultiplier = multiplier;
        this.updateSpeedButtons();
    }
    
    updateSpeedButtons() {
        if (this.speed2xBtn) {
            this.speed2xBtn.classList.remove('active');
        }
        if (this.speed5xBtn) {
            this.speed5xBtn.classList.remove('active');
        }
        
        // Add active class to the current speed button
        if (this.timeMultiplier === 2 && this.speed2xBtn) {
            this.speed2xBtn.classList.add('active');
        } else if (this.timeMultiplier === 5 && this.speed5xBtn) {
            this.speed5xBtn.classList.add('active');
        }
    }
    
    isGamePaused() {
        return this.isPaused;
    }
    
    getTimeMultiplier() {
        return this.isPaused ? 0 : this.timeMultiplier;
    }
    
    updateDisplay() {
        if (this.dateDisplay) {
            this.dateDisplay.textContent = `Day ${this.currentDay}, ${this.currentSeason}, Year ${this.currentYear}`;
        }
        
        if (this.seasonDisplay) {
            this.seasonDisplay.textContent = this.cropAmount;
        }
        
        if (this.cropText) {
            this.cropText.textContent = this.currentCrop;
        }
        
        if (this.landDisplay) {
            this.landDisplay.textContent = `${this.ownedLandCount}/${this.totalLandCount}`;
        }
        
        this.updateProgressBar();
    }
    
    updateProgressBar() {
        const totalDayInYear = ((this.seasons.indexOf(this.currentSeason)) * this.daysPerSeason) + this.currentDay;
        const progress = (totalDayInYear / this.daysPerYear) * 100;
        
        if (this.yearProgress) {
            this.yearProgress.style.width = `${progress}%`;
        }
        
        if (this.progressIndicator) {
            this.progressIndicator.style.left = `${progress}%`;
        }
    }
    
    nextDay() {
        this.currentDay++;
        
        if (this.currentDay > this.daysPerSeason) {
            this.currentDay = 1;
            this.nextSeason();
        }
        
        this.updateDisplay();
    }
    
    nextSeason() {
        const currentSeasonIndex = this.seasons.indexOf(this.currentSeason);
        const nextSeasonIndex = (currentSeasonIndex + 1) % this.seasons.length;
        
        this.currentSeason = this.seasons[nextSeasonIndex];
        
        if (nextSeasonIndex === 0) {
            this.currentYear++;
        }
    }
    
    addLand() {
        if (this.ownedLandCount < this.totalLandCount) {
            this.ownedLandCount++;
            this.updateDisplay();
        }
    }
    
    getOwnedLandCount() {
        return this.ownedLandCount;
    }
    
    setCrop(cropName) {
        this.currentCrop = cropName;
        this.updateDisplay();
    }
    
    setCropProgress(percentage) {
        if (this.cropProgressBar) {
            this.cropProgressBar.style.width = `${percentage}%`;
        }
    }
    
    addCropAmount(amount) {
        this.cropAmount += amount;
        this.updateDisplay();
    }
    
    getCropAmount() {
        return this.cropAmount;
    }
    
    getGameState() {
        return {
            day: this.currentDay,
            season: this.currentSeason,
            year: this.currentYear,
            ownedLand: this.ownedLandCount,
            crop: this.currentCrop,
            cropAmount: this.cropAmount
        };
    }
}

const gameUI = new GameUI();

// Initialize when DOM is ready, how does olof have future generations? like... will elsa make him a kid out of snow?
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameUI.init();
    });
} else {
    gameUI.init();
}
