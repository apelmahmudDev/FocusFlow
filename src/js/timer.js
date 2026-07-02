(function (app) {
	"use strict";

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

		app.renderTimerDisplay();
		app.renderActiveTaskLine();
		app.persistTimer();
	};

	app.renderTimerDisplay = function renderTimerDisplay() {
		const time = app.formatTime(app.state.secondsLeft);

		app.el.timerDisplay.textContent = time;
		updateDocumentTitle(time);
	};

	function updateDocumentTitle(time) {
		if (app.state.isRunning) {
			document.title = `${time} - FocusFlow`;
			return;
		}

		document.title = app.APP_TITLE;
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
		const { el, state } = app;
		if (state.isRunning) return;

		state.isRunning = true;
		el.startBtn.disabled = true;
		el.pauseBtn.disabled = false;
		app.renderTimerDisplay();
		app.persistTimer();
		state.intervalId = setInterval(tick, 1000);
	}

	app.pauseTimer = function pauseTimer() {
		const { el, state } = app;
		if (!state.isRunning) return;

		state.isRunning = false;
		clearInterval(state.intervalId);
		state.intervalId = null;
		el.startBtn.disabled = false;
		el.pauseBtn.disabled = true;
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
		app.state.secondsLeft = secondsLeft;
		app.state.isRunning = false;
		app.state.intervalId = null;

		app.el.startBtn.disabled = false;
		app.el.pauseBtn.disabled = true;

		app.el.modeButtons.forEach((button) => {
			const isActive = button.dataset.mode === savedTimer.mode;
			button.classList.toggle("active", isActive);
			button.setAttribute("aria-selected", String(isActive));
		});

		app.renderTimerDisplay();
		app.renderActiveTaskLine();
	};

	app.initTimer = function initTimer() {
		const { el } = app;

		el.startBtn.addEventListener("click", startTimer);
		el.pauseBtn.addEventListener("click", app.pauseTimer);
		el.resetBtn.addEventListener("click", resetTimer);
		el.skipBtn.addEventListener("click", skipSession);

		el.modeButtons.forEach((button) => {
			button.addEventListener("click", () => {
				app.pauseTimer();
				app.setMode(button.dataset.mode);
			});
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
