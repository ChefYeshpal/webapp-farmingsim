// Tractor sound manager
// Loads three tractor audio files from the `assets/` folder and switches between
// them depending on the tractor movement state (idle / forward / reverse).
//
// Behavior:
// - Idle (player.speed approximately 0): `tractor-idling-01.mp3` loops and plays while idle.
// - Moving forward (player.speed > threshold): `tractor-working-03.mp3` loops; idle stops.
// - Reversing (player.speed < -threshold): `tractor-reversing-01.mp3` loops; other sounds stop.
//
// The code exposes `setupSounds()` and `updateSounds()` which are called from
// the main `setup()` / `draw()` in `scene.js`.

let _tractorSounds = {
	idle: null,
	forward: null,
	reverse: null
};

let _currentSoundKey = null; // 'idle' | 'forward' | 'reverse'
let _needUserGestureToPlay = false;

const SPEED_THRESHOLD = 0.02;

function _createAudio(src) {
	try {
		const a = new Audio(src);
		a.loop = true;
		a.preload = 'auto';
		a.volume = 0.5;
		return a;
	} catch (e) {
		console.warn('Failed to create Audio for', src, e);
		return null;
	}
}

function setupSounds() {
	_tractorSounds.idle = _createAudio('assets/tractor-idling-01.mp3');
	_tractorSounds.forward = _createAudio('assets/tractor-working-03.mp3');
	_tractorSounds.reverse = _createAudio('assets/tractor-reversing-01.mp3');
	_currentSoundKey = null;
	_switchToSound('idle');
	if (_needUserGestureToPlay) {
		const unlock = () => {
			if (_currentSoundKey) {
				const s = _tractorSounds[_currentSoundKey];
				if (s) {
					s.play().catch(() => {});
				}
			}
			window.removeEventListener('pointerdown', unlock);
			window.removeEventListener('keydown', unlock);
			_needUserGestureToPlay = false;
		};
		window.addEventListener('pointerdown', unlock);
		window.addEventListener('keydown', unlock);
	}
}

function _stopSound(key) {
	const s = _tractorSounds[key];
	if (!s) return;
	try {
		s.pause();
		s.currentTime = 0;
	} catch (e) {
		// ignore this pls
	}
}

function _playSound(key) {
	const s = _tractorSounds[key];
	if (!s) return;
	try {
		const p = s.play();
		if (p && typeof p.then === 'function') {
			p.catch(() => { _needUserGestureToPlay = true; });
		}
	} catch (e) {
		_needUserGestureToPlay = true;
	}
}

function _switchToSound(key) {
	if (_currentSoundKey === key) return;
	if (_currentSoundKey) {
		_stopSound(_currentSoundKey);
	}
	_currentSoundKey = key;
	_playSound(key);
}

function updateSounds() {
	let speed = 0;
	if (typeof player !== 'undefined' && typeof player.speed === 'number') {
		speed = player.speed;
	} else if (typeof inputState !== 'undefined') {
		if (inputState.forward) speed = SPEED_THRESHOLD * 2;
		else if (inputState.reverse) speed = -SPEED_THRESHOLD * 2;
		else speed = 0;
	}

	if (speed > SPEED_THRESHOLD) {
		_switchToSound('forward');
	} else if (speed < -SPEED_THRESHOLD) {
		_switchToSound('reverse');
	} else {
		_switchToSound('idle');
	}
}

window.setupSounds = setupSounds;
window.updateSounds = updateSounds;

