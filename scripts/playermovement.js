// Player / tractor movement for the farming sim
// Uses p5.js lifecycle hooks (preload is provided here to load the sprite)

let tractorImg;
let player = {
	x: 0,
	y: 0,
	angle: 0, 
	speed: 0,
	maxSpeed: 2.0,
	rotationSpeed: 0.06
};

let inputState = {
	forward: false,
	reverse: false,
	left: false,
	right: false
};

function preload() {
	tractorImg = loadImage('assets/tractor_rake.png');
}

function setupPlayer() {
	// Assumption: the "far end" is the top of the canvas, so facing up.
	player.angle = -PI / 2;
	player.x = CANVAS_SIZE / 2;
	player.y = CANVAS_SIZE - BORDER_WIDTH - 40;

	player.speed = 0;
}

function updatePlayer() {
	if (inputState.left) {
		player.angle -= player.rotationSpeed;
	}
	if (inputState.right) {
		player.angle += player.rotationSpeed;
	}
	if (inputState.forward) {
		player.speed = player.maxSpeed;
	} else if (inputState.reverse) {
		player.speed = -player.maxSpeed * 0.7;
	} else {
		player.speed *= 0.9;
		if (abs(player.speed) < 0.02) player.speed = 0;
	}
	player.x += cos(player.angle) * player.speed;
	player.y += sin(player.angle) * player.speed;

	// constrains to board area
	const minX = BORDER_WIDTH + 10;
	const maxX = CANVAS_SIZE - BORDER_WIDTH - 10;
	const minY = BORDER_WIDTH + 10;
	const maxY = CANVAS_SIZE - BORDER_WIDTH - 10;

	player.x = constrain(player.x, minX, maxX);
	player.y = constrain(player.y, minY, maxY);
}

function drawPlayer() {
	if (!tractorImg) return;

	push();
	translate(player.x, player.y);
	rotate(player.angle + PI / 2);
	imageMode(CENTER);
	const drawW = 36;
	const drawH = (tractorImg.height / tractorImg.width) * drawW;
	image(tractorImg, 0, 0, drawW, drawH);
	pop();
}

// keyboard handling to update inputState; uses p5's key events
function keyPressed() {
	const k = key.toLowerCase();
	if (k === 'w') inputState.forward = true;
	if (k === 's') inputState.reverse = true;
	if (k === 'a') inputState.left = true;
	if (k === 'd') inputState.right = true;
}

function keyReleased() {
	const k = key.toLowerCase();
	if (k === 'w') inputState.forward = false;
	if (k === 's') inputState.reverse = false;
	if (k === 'a') inputState.left = false;
	if (k === 'd') inputState.right = false;
}

function getPlayerState() {
	return { x: player.x, y: player.y, angle: player.angle };
}

