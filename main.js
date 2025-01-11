// Get reference to Canvas
var canvas = document.getElementById('canvas');

// Get reference to Canvas Context
var context = canvas.getContext('2d');

// Get reference to loading screen
var loading_screen = document.getElementById('loading');

// Initialize loading variables
var loaded = false;
var load_counter = 0;

// Initialize images for layers
var background = new Image();
var didot = new Image();
var shadow = new Image();
var man = new Image();
var headlines = new Image();
var title = new Image();
var frame = new Image();
var gloss = new Image();

// Create a list of layer objects
var layer_list =[
	{
		'image': background,
		'src': './images/layer_1_1.png',
		'z_index': -5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': didot,
		'src': './images/layer_2_1.png',
		'z_index': -4,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': shadow,
		'src': './images/layer_3_1.png',
		'z_index': -3,
		'position': {x: 0, y: 0},
		'blend': 'multiply',
		'opacity': 0.5
	},
	{
		'image': man,
		'src': './images/layer_4_1.png',
		'z_index': -2,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': headlines,
		'src': './images/layer_5_1.png',
		'z_index': -0.5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': title,
		'src': './images/layer_6_1.png',
		'z_index': -0.5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': frame,
		'src': './images/layer_7_1.png',
		'z_index': 0,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': gloss,
		'src': './images/layer_8_1.png',
		'z_index': 0.5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	}
];

layer_list.forEach(function(layer, index) {
	layer.image.onload = function() {
		load_counter += 1;
		if (load_counter >= layer_list.length) {
			// Hide the loading screen
			hideLoading();
			requestAnimationFrame(drawCanvas);
		}
	}
	layer.image.src = layer.src;
});

function hideLoading() {
	loading_screen.classList.add('hidden');
}

function drawCanvas() {
	// clear whatever is in the canvas
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// Calculate how much the canvas should rotate
	var rotate_x = (pointer.y * -0.15) + (motion.y * -1.2);
	var rotate_y = (pointer.x * 0.15) + (motion.x * 1.2);

	var transform_string = "rotateX(" + rotate_x + "deg) rotateY(" + rotate_y + "deg)";

	// Actually rotate the canvas
	canvas.style.transform = transform_string;

	// Loop through each layer and draw it to the canvas
	layer_list.forEach(function(layer, index) {

		layer.position = getOffset(layer);
		
		if (layer.blend) {
			context.globalCompositeOperation = layer.blend;
		} else {
			context.globalCompositeOperation = 'normal';
		}
		
		context.globalAlpha = layer.opacity;
		
		context.drawImage(layer.image, layer.position.x, layer.position.y);
	});
	requestAnimationFrame(drawCanvas);
}	

function getOffset(layer) {
	var touch_multiplier = 0.1;
	var touch_offset_x = pointer.x * layer.z_index * touch_multiplier;
	var touch_offset_y = pointer.y * layer.z_index * touch_multiplier;

	var motion_multiplier = 1;
	var motion_offset_x = motion.x * layer.z_index * motion_multiplier;
	var motion_offset_y = motion.y * layer.z_index * motion_multiplier;

	var offset = {
		x: touch_offset_x + motion_offset_x,
		y: touch_offset_y + motion_offset_y
	};

	return offset;
}

//// TOUCH AND MOUSE CONTROLS ////

var moving = false;

// Initialize touch and mouse position
var pointer_initial = {
	x: 0,
	y: 0
};

var pointer = {
	x: 0,
	y: 0
};

canvas.addEventListener('touchstart', pointerStart);
canvas.addEventListener('mousedown', pointerStart);

function pointerStart(event) {
	moving = true;
	if (event.type === 'touchstart') {
		pointer_initial.x = event.touches[0].clientX;
		pointer_initial.y = event.touches[0].clientY;
	} else if (event.type === 'mousedown') {
		pointer_initial.x = event.clientX;
		pointer_initial.y = event.clientY;
	}
}

window.addEventListener('touchmove', pointerMove);
window.addEventListener('mousemove', pointerMove);

function pointerMove(event) {
	event.preventDefault();
	if (moving === true) {
		var current_x = 0;
		var current_y = 0;
		if (event.type === 'touchmove') {
			current_x = event.touches[0].clientX;
			current_y = event.touches[0].clientY;
		} else if (event.type === 'mousemove') {
			current_x = event.clientX;
			current_y = event.clientY;
		}
		pointer.x = current_x - pointer_initial.x;
		pointer.y = current_y - pointer_initial.y;
	}
}

canvas.addEventListener('touchmove', function(event) {
	event.preventDefault();
});

canvas.addEventListener('mousemove', function(event) {
	event.preventDefault();
});

window.addEventListener('touchend', function(event) {
	endGesture();
});

window.addEventListener('mouseup', function(event) {
	endGesture();
});

function endGesture() {
	moving = false;

	pointer.x = 0;
	pointer.y = 0;
}

//// MOTION CONTROLS ////

// Initialize variables for motion based parallax
var motion_initial = {
	x: null,
	y: null
};

var motion = {
	x: 0,
	y: 0
};

// Listen to gyroscope events
window.addEventListener('deviceorientation', function(event) {
	// if this is the first time through
	if (!motion_initial.x && !motion_initial.y) {
		motion_initial.x = event.beta;
		motion_initial.y = event.gamma;
	}
	
	if (window.orientation === 0) {
		// The device is in portrait orientation
		motion.x = event.gamma - motion_initial.y;
		motion.y = event.beta - motion_initial.x;
	} else if (window.orientation === 90) {
		// The device is in landscape on its left side
		motion.x = event.beta - motion_initial.x;
		motion.y = -event.gamma + motion_initial.y;
	} else if (window.orientation === -90) {
		// The device is in landscape on its right side
		motion.x = -event.beta + motion_initial.x;
		motion.y = event.gamma - motion_initial.y;
	} else {
		// The device is upside down
		motion.x = -event.gamma + motion_initial.y;
		motion.y = -event.beta + motion_initial.x;
	}
		
});

window.addEventListener('orientationchange', function(event) {
	motion_initial.x = 0;
	motion_initial.y = 0;
});
