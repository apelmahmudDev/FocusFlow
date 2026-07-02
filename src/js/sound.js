(function (app) {
	"use strict";

	function getSoundIconMarkup(isOn) {
		if (isOn) {
			return `
				<svg class="sound-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
					<path
						d="M11 5 6 9H3.8C3.36 9 3 9.36 3 9.8v4.4c0 .44.36.8.8.8H6l5 4V5Z"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M16 9.5a4 4 0 0 1 0 5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M19 7a8 8 0 0 1 0 10"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			`;
		}

		return `
			<svg class="sound-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
				<path
					d="M11 5 6 9H3.8C3.36 9 3 9.36 3 9.8v4.4c0 .44.36.8.8.8H6l5 4V5Z"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="m17 9 4 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
				<path
					d="m21 9-4 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		`;
	}

	const ALERT_SOUND_PATH = "assets/sounds/notification.wav";
	const alertSound = new Audio(ALERT_SOUND_PATH);
	alertSound.preload = "auto";

	app.playAlertSound = function playAlertSound() {
		if (!app.state.soundOn) return;

		alertSound.currentTime = 0;
		alertSound.play().catch(() => {
			// Browser autoplay rules may block audio until the user interacts.
		});
	};

	app.applySoundToggleUI = function applySoundToggleUI() {
		const { el, state } = app;

		el.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
		el.soundToggle.querySelector(".toggle-icon").innerHTML = getSoundIconMarkup(
			state.soundOn,
		);
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
})((window.FocusFlow = window.FocusFlow || {}));
