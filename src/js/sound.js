(function (app) {
	"use strict";

	let audioCtx = null;

	app.playAlertSound = function playAlertSound() {
		if (!app.state.soundOn) return;

		try {
			audioCtx =
				audioCtx || new (window.AudioContext || window.webkitAudioContext)();
			const now = audioCtx.currentTime;

			[0, 0.18].forEach((offset, index) => {
				const oscillator = audioCtx.createOscillator();
				const gain = audioCtx.createGain();

				oscillator.type = "sine";
				oscillator.frequency.value = index === 0 ? 880 : 1046.5;
				gain.gain.setValueAtTime(0.0001, now + offset);
				gain.gain.exponentialRampToValueAtTime(0.2, now + offset + 0.02);
				gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.28);

				oscillator.connect(gain);
				gain.connect(audioCtx.destination);
				oscillator.start(now + offset);
				oscillator.stop(now + offset + 0.3);
			});
		} catch (err) {
			// Web Audio unavailable.
		}
	};

	app.applySoundToggleUI = function applySoundToggleUI() {
		const { el, state } = app;

		el.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
		el.soundToggle.querySelector(".toggle-icon").textContent = state.soundOn
			? "Audio"
			: "Muted";
		el.soundToggle.querySelector(".toggle-label").textContent = state.soundOn
			? "Sound"
			: "Muted";
	};

	app.initSound = function initSound() {
		const { el, state } = app;

		app.applySoundToggleUI();

		el.soundToggle.addEventListener("click", () => {
			state.soundOn = !state.soundOn;
			app.persistSound();
			app.applySoundToggleUI();
			app.showToast(state.soundOn ? "Sound alerts on." : "Sound alerts muted.");
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
