(function (app) {
	"use strict";

	function minutesToSeconds(value, fallback) {
		const minutes = Number(value);

		if (!Number.isFinite(minutes) || minutes <= 0) {
			return fallback;
		}

		return Math.round(minutes) * 60;
	}

	function secondsToMinutes(value) {
		return Math.max(1, Math.round(value / 60));
	}

	function syncOpenState(isOpen) {
		const { settingsToggle, settingsPanel } = app.el;

		settingsToggle.setAttribute("aria-expanded", String(isOpen));
		settingsPanel.hidden = !isOpen;
	}

	function openSettings() {
		const { el } = app;

		el.settingsFocusInput.value = secondsToMinutes(app.DURATIONS.focus);
		el.settingsShortInput.value = secondsToMinutes(app.DURATIONS.short);
		el.settingsLongInput.value = secondsToMinutes(app.DURATIONS.long);

		syncOpenState(true);
		el.settingsFocusInput.focus();
	}

	function closeSettings() {
		syncOpenState(false);
	}

	function saveSettings() {
		const { el } = app;
		const nextDurations = {
			focus: minutesToSeconds(el.settingsFocusInput.value, app.DURATIONS.focus),
			short: minutesToSeconds(el.settingsShortInput.value, app.DURATIONS.short),
			long: minutesToSeconds(el.settingsLongInput.value, app.DURATIONS.long),
		};
		const previousDurations = { ...app.DURATIONS };

		app.DURATIONS = nextDurations;
		app.persistDurations();

		if (!app.state.isRunning) {
			const currentMode = app.state.mode;
			const previousSeconds = previousDurations[currentMode];
			const nextSeconds = nextDurations[currentMode];

			if (
				app.state.secondsLeft === previousSeconds ||
				app.state.secondsLeft > nextSeconds
			) {
				app.state.secondsLeft = nextSeconds;
				app.persistTimer();
			}
		}

		app.renderTimerDisplay();
		app.showToast("Timer durations updated.");
		closeSettings();
	}

	app.initSettings = function initSettings() {
		const { el } = app;

		el.settingsToggle.addEventListener("click", () => {
			const isOpen = !el.settingsPanel.hidden;

			if (isOpen) {
				closeSettings();
				return;
			}

			openSettings();
		});

		el.settingsSaveBtn.addEventListener("click", saveSettings);

		document.addEventListener("click", (event) => {
			if (el.settingsPanel.hidden) return;
			if (el.settingsPanel.contains(event.target)) return;
			if (el.settingsToggle.contains(event.target)) return;

			closeSettings();
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && !el.settingsPanel.hidden) {
				closeSettings();
				el.settingsToggle.focus();
			}
		});

		syncOpenState(false);
	};
})((window.FocusFlow = window.FocusFlow || {}));
