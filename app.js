(function(window) {
	// General utilities
	var doc = window.document,
			$ = function(selector) {
				var result = doc.querySelectorAll(selector);
				return (result.length > 1) ? result : result[0];
			};

	Node.prototype.on = Node.prototype.addEventListener;
	NodeList.prototype.on = function(type, func, flag) {
		[].forEach.call(this, function(node, index) {
			node.on(type, func, flag);
		});
	};

	// Start the app related code

	// Create the SynthPad Module
	var SynthPad = (function(){
		var canvas;
		var frequencyLabel;
		var volumeLabel;

		var audioContext;
		var oscillator;
		var gainNode;

		// Notes
		var lowNote = 261.63; // C4
		var highNote = 493.88; // b4

		// create the constructor
		var SynthPad = function() {
			canvas = $('#synth-pad');
			frequencyLabel = $('#frequency');
			volumeLabel = $('#volume');

			// Getting the audio context
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			context = new AudioContext();

			SynthPad.setupEventListeners();
		};

		// Event Listeners
		SynthPad.setupEventListeners = function() {
			// disables scrolling on touch devices
			doc.body.on('touchmove', function(e) {
				e.preventDefault();
			}, false);

			canvas.on('mousedown', SynthPad.playSound);
			canvas.on('touchstart', SynthPad.playSound);

			canvas.on('mouseup', SynthPad.stopSound);
			canvas.on('mouseleave', SynthPad.stopSound);
			canvas.on('touchend', SynthPad.stopSound);
		};

		// Play a note
		SynthPad.playSound = function(e) {
			oscillator = context.createOscillator();
			gainNode = context.createGainNode();

			oscillator.type = 'triangle';

			oscillator.connect(gainNode);
			gainNode.connect(context.destination);

			SynthPad.updateFrequency(e);

			oscillator.start(0);

			canvas.on('mousemove', SynthPad.updateFrequency);
			canvas.on('touchmove', SynthPad.updateFrequency);

			canvas.on('mouseout', SynthPad.stopSound);
		};

		// Stop the audio
		SynthPad.stopSound = function(e) {
			oscillator.stop(0);

			canvas.removeEventListener('mousemove', SynthPad.updateFrequency);
			canvas.removeEventListener('touchmove', SynthPad.updateFrequency);
			canvas.removeEventListener('mouseout', SynthPad.stopSound);
		};

		// calculate the note frequency
		SynthPad.calculateNote = function(posX) {
			var noteDifference = highNote - lowNote;
			var noteOffset = (noteDifference / canvas.offsetWidth) * (posX - canvas.offsetLeft);

			return (lowNote + noteOffset);
		};

		// Calculate the volume
		SynthPad.calculateVolume = function(posY) {
			var volumeLevel = 1 - (((100 / canvas.offsetHeight) * (posY - canvas.offsetTop)) / 100);

			return volumeLevel;
		};

		// Calculate the frquency
		SynthPad.calculateFrequency = function(x, y) {
			var noteValue = SynthPad.calculateNote(x);
			var volumeValue = SynthPad.calculateVolume(y);

			oscillator.frequency.value = noteValue;
			gainNode.gain.value = volumeValue;

			frequencyLabel.innerHTML = Math.floor(noteValue) + 'Hz';
			volumeLabel.innerHTML = Math.floor(volumeValue * 100) + '%';
		};

		// Update the note frequency
		SynthPad.updateFrequency = function(e) {
			if(e.type === 'mousedown' || e.type === 'mousemove') {
				SynthPad.calculateFrequency(e.x, e.y);
			} else if(e.type === 'touchstart' || e.type === 'touchmove') {
				var touch = e.touches[0];
				SynthPad.calculateFrequency(touch.pageX, touch.pageY);
			}
		};

		return SynthPad;

	}());

	// initialize SynthPad
	var synthPad = new SynthPad();

}(this));