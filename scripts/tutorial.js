// Tutorial System
const TUTORIAL_MESSAGES = [
    "Well hello there...",
    "Let me give you a little breakdown of the situation",
    "You have inherited your great-grandfather's farm plot",
    "He stored enough wheat seeds to last you a century, if you store them properly",
    "All you have to do, is farm",
    'Please read the <a href="https://github.com/ChefYeshpal/webapp-farmingsim/blob/main/README.md" target="_blank">readme</a> in the github repository to know the controls'
];

class TutorialManager {
    constructor() {
        this.currentMessageIndex = 0;
        this.overlay = null;
        this.textElement = null;
        this.isActive = false;
        this.hasShown = false;
    }

    init() {
        console.log('Tutorial initializing');
        
        /*
        const tutorialShown = localStorage.getItem('farmingSimTutorialShown');
        if (tutorialShown === 'true') {
            console.log('Tutorial already shown, skipping');
            this.hasShown = true;
            return;
        }
        */

        this.overlay = document.getElementById('tutorial-overlay');
        this.textElement = document.getElementById('tutorial-text');

        if (!this.overlay || !this.textElement) {
            console.error('Tutorial elements not found', {
                overlay: this.overlay,
                textElement: this.textElement
            });
            return;
        }

        console.log('Tutorial elements found, setting up...');

        this.overlay.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                this.nextMessage();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (this.isActive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.nextMessage();
            }
        });

        this.start();
    }

    start() {
        console.log('Tutorial starting...');
        this.isActive = true;
        this.currentMessageIndex = 0;
        this.overlay.classList.remove('hidden');
        this.showCurrentMessage();
    }

    showCurrentMessage() {
        if (this.currentMessageIndex < TUTORIAL_MESSAGES.length) {
            const message = TUTORIAL_MESSAGES[this.currentMessageIndex];
            console.log('Showing message:', message);
            this.textElement.innerHTML = message;
        }
    }

    nextMessage() {
        console.log('Next message...');
        this.currentMessageIndex++;
        
        if (this.currentMessageIndex < TUTORIAL_MESSAGES.length) {
            this.showCurrentMessage();
        } else {
            this.end();
        }
    }

    end() {
        console.log('Tutorial ending...');
        this.isActive = false;
        this.overlay.classList.add('hidden');
        
        localStorage.setItem('farmingSimTutorialShown', 'true');
        this.hasShown = true;
    }

    reset() {
        localStorage.removeItem('farmingSimTutorialShown');
        this.hasShown = false;
        this.currentMessageIndex = 0;
    }
}

const tutorialManager = new TutorialManager();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing tutorial');
        tutorialManager.init();
    });
} else {
    console.log('DOM already loaded, initializing tutorial');
    tutorialManager.init();
}
