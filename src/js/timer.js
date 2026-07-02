(function (app) {
	"use strict";

	function getModeLabel(mode) {
		return app.MODE_LABELS[mode] || "Focus period";
	}

	function updateTimerHeading() {
		app.el.timerCardTitle.textContent = getModeLabel(app.state.mode);
	}

	function getTimerToggleMarkup(isRunning) {
		if (isRunning) {
			return `
				<svg class="timer-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<rect x="7" y="5" width="4" height="14" rx="1.2"></rect>
					<rect x="13" y="5" width="4" height="14" rx="1.2"></rect>
				</svg>
				<span class="timer-toggle-label">Pause</span>
			`;
		}

		return `
			<svg class="timer-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M8 5.5v13a.9.9 0 0 0 1.42.74l9.1-6.5a.9.9 0 0 0 0-1.48l-9.1-6.5A.9.9 0 0 0 8 5.5Z"></path>
			</svg>
			<span class="timer-toggle-label">Start</span>
		`;
	}

	function updateTimerToggleButton() {
		const { timerToggleBtn } = app.el;
		const isRunning = app.state.isRunning;

		timerToggleBtn.setAttribute(
			"aria-label",
			isRunning ? "Pause timer" : "Start focus timer",
		);
		timerToggleBtn.setAttribute("aria-pressed", String(isRunning));
		timerToggleBtn.classList.toggle("is-running", isRunning);
		timerToggleBtn.innerHTML = getTimerToggleMarkup(isRunning);
	}

	function setTimerFullscreen(isFullscreen) {
		const { timerCard, timerFullscreenBtn } = app.el;

		timerCard.classList.toggle("is-fullscreen", isFullscreen);
		document.body.classList.toggle("timer-fullscreen-open", isFullscreen);
		timerFullscreenBtn.setAttribute("aria-pressed", String(isFullscreen));
		timerFullscreenBtn.setAttribute(
			"aria-label",
			isFullscreen ? "Shrink timer card" : "Expand timer card",
		);
	}

	function toggleTimerFullscreen() {
		setTimerFullscreen(!app.el.timerCard.classList.contains("is-fullscreen"));
	}

	app.setMode = function setMode(mode, { resetTime = true } = {}) {
		const { el, state } = app;
		state.mode = mode;

		if (resetTime) {
			state.secondsLeft = app.DURATIONS[mode];
		}

		el.modeButtons.forEach((button) => {
			const isActive = button.dataset.mode === mode;
			button.classList.toggle("active", isActive);
			button.setAttribute("aria-selected", String(isActive));
		});

		updateTimerHeading();
		app.renderTimerDisplay();
		app.renderActiveTaskLine();
		app.persistTimer();
	};

	app.renderTimerDisplay = function renderTimerDisplay() {
		const time = app.formatTime(app.state.secondsLeft);
		const duration = app.DURATIONS[app.state.mode] || app.state.secondsLeft;
		const elapsed = Math.max(0, duration - app.state.secondsLeft);
		const progress = duration > 0 ? Math.min(360, (elapsed / duration) * 360) : 0;
		const timerRing = app.el.timerDisplay.closest(".timer-ring");

		app.el.timerDisplay.textContent = time;
		if (timerRing) {
			timerRing.style.setProperty("--timer-progress", `${progress}deg`);
		}
		updateDocumentTitle(time);
		updateTimerToggleButton();
	};

	function updateDocumentTitle(time) {
		if (app.state.isRunning) {
			document.title = `${getModeLabel(app.state.mode)} ${time} - FocusFlow`;
			return;
		}

		document.title = `${getModeLabel(app.state.mode)} - FocusFlow`;
	}

	function tick() {
		app.state.secondsLeft = Math.max(0, app.state.secondsLeft - 1);
		app.renderTimerDisplay();
		app.persistTimer();

		if (app.state.secondsLeft === 0) {
			completeSession();
		}
	}

	function startTimer() {
		const { state } = app;
		if (state.isRunning) return;

		state.isRunning = true;
		updateTimerToggleButton();
		app.renderTimerDisplay();
		app.persistTimer();
		state.intervalId = setInterval(tick, 1000);
	}

	app.pauseTimer = function pauseTimer() {
		const { state } = app;
		if (!state.isRunning) return;

		state.isRunning = false;
		clearInterval(state.intervalId);
		state.intervalId = null;
		updateTimerToggleButton();
		app.renderTimerDisplay();
		app.persistTimer();
	};

	function resetTimer() {
		app.pauseTimer();
		app.state.secondsLeft = app.DURATIONS[app.state.mode];
		app.renderTimerDisplay();
		app.persistTimer();
	}

	function skipSession() {
		app.pauseTimer();
		advanceToNextMode();
	}

	function completeSession() {
		const { state } = app;
		app.pauseTimer();

		const task = app.getActiveTask();
		const durationMinutes = app.DURATIONS[state.mode] / 60;

		state.history.unshift({
			id: app.uid(),
			mode: state.mode,
			taskName: task ? task.title : "No active task",
			durationMinutes,
			completedAt: new Date().toISOString(),
		});
		app.persistHistory();

		if (state.mode === "focus") {
			if (task) {
				task.completedPomodoros += 1;
				app.persistTasks();
			}

			state.sessionsCompletedInCycle += 1;
			app.persistCycle();
			app.showToast("Focus session completed!");
		} else {
			app.showToast(
				state.mode === "short"
					? "Short break complete."
					: "Long break complete.",
			);
		}

		app.playAlertSound();
		app.renderStats();
		app.renderTaskList();
		app.renderHistory();
		pulseTimerDisplay();
		advanceToNextMode();
	}

	function pulseTimerDisplay() {
		const { timerDisplay } = app.el;

		timerDisplay.classList.remove("pulse");
		void timerDisplay.offsetWidth;
		timerDisplay.classList.add("pulse");
	}

	function advanceToNextMode() {
		const { state } = app;

		if (state.mode === "focus") {
			const completedFocusCount = state.sessionsCompletedInCycle;
			const isLongBreakDue =
				completedFocusCount > 0 &&
				completedFocusCount % app.SESSIONS_UNTIL_LONG_BREAK === 0;

			app.setMode(isLongBreakDue ? "long" : "short");
			return;
		}

		app.setMode("focus");
	}

	app.restoreTimer = function restoreTimer() {
		const savedTimer = app.loadJSON(app.STORAGE_KEYS.timer, null);
		const isValidMode = savedTimer && savedTimer.mode in app.DURATIONS;
		const secondsLeft = Number(savedTimer && savedTimer.secondsLeft);
		const savedAt = Number(savedTimer && savedTimer.savedAt);
		const shouldResume = Boolean(savedTimer && savedTimer.isRunning);
		const elapsedSinceSave =
			shouldResume && Number.isFinite(savedAt)
				? Math.max(0, Math.floor((Date.now() - savedAt) / 1000))
				: 0;
		const restoredSecondsLeft = Math.max(0, secondsLeft - elapsedSinceSave);
		const isValidTime =
			Number.isFinite(secondsLeft) &&
			secondsLeft > 0 &&
			isValidMode &&
			secondsLeft <= app.DURATIONS[savedTimer.mode];

		if (!isValidMode || !isValidTime) {
			app.setMode("focus");
			return;
		}

		app.state.mode = savedTimer.mode;
		app.state.secondsLeft = restoredSecondsLeft;
		app.state.isRunning = false;
		app.state.intervalId = null;

		app.el.modeButtons.forEach((button) => {
			const isActive = button.dataset.mode === savedTimer.mode;
			button.classList.toggle("active", isActive);
			button.setAttribute("aria-selected", String(isActive));
		});

		updateTimerHeading();
		app.renderActiveTaskLine();

		if (shouldResume && restoredSecondsLeft > 0) {
			startTimer();
			return;
		}

		if (shouldResume && restoredSecondsLeft === 0) {
			app.renderTimerDisplay();
			completeSession();
			return;
		}

		app.renderTimerDisplay();
		updateTimerToggleButton();
	};

	app.initTimer = function initTimer() {
		const { el } = app;

		el.timerToggleBtn.addEventListener("click", () => {
			if (app.state.isRunning) {
				app.pauseTimer();
				return;
			}

			startTimer();
		});
		el.resetBtn.addEventListener("click", resetTimer);
		el.skipBtn.addEventListener("click", skipSession);
		el.timerFullscreenBtn.addEventListener("click", toggleTimerFullscreen);

		el.modeButtons.forEach((button) => {
			button.addEventListener("click", () => {
				app.pauseTimer();
				app.setMode(button.dataset.mode);
			});
		});

		document.addEventListener("keydown", (event) => {
			if (
				event.key === "Escape" &&
				el.timerCard.classList.contains("is-fullscreen")
			) {
				setTimerFullscreen(false);
				el.timerFullscreenBtn.focus();
			}
		});

		updateTimerHeading();
		updateTimerToggleButton();
	};
})((window.FocusFlow = window.FocusFlow || {}));
