(function (app) {
	"use strict";

	let timerPipWindow = null;

	function getModeLabel(mode) {
		return app.MODE_LABELS[mode] || "Focus period";
	}

	function getTimerProgress() {
		const duration = app.DURATIONS[app.state.mode] || app.state.secondsLeft;
		const elapsed = Math.max(0, duration - app.state.secondsLeft);

		return duration > 0 ? Math.min(360, (elapsed / duration) * 360) : 0;
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

	function getTimerPipMarkup() {
		return `
			<style>
				:root {
					color-scheme: light;
					--bg: #f4f7fb;
					--panel: rgba(255, 255, 255, 0.92);
					--text: #0b1736;
					--muted: #64708a;
					--border: #dfe7f3;
					--primary: #2563eb;
					--secondary: #0f9f94;
					--track: #e9effa;
					font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
				}

				[data-theme="dark"] {
					color-scheme: dark;
					--bg: #0f172a;
					--panel: rgba(17, 24, 39, 0.94);
					--text: #f9fafb;
					--muted: #cbd5e1;
					--border: #334155;
					--track: #1e293b;
				}

				* {
					box-sizing: border-box;
				}

				body {
					margin: 0;
					min-height: 100vh;
					background: var(--bg);
					color: var(--text);
					display: grid;
					place-items: center;
				}

				.pip-card {
					width: 100%;
					min-height: 100vh;
					padding: 18px;
					background: var(--panel);
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 14px;
				}

				.pip-mode {
					margin: 0;
					font-size: 0.8rem;
					font-weight: 800;
					color: var(--muted);
					letter-spacing: 0.08em;
					text-transform: uppercase;
				}

				.pip-ring {
					--timer-progress: 0deg;
					--timer-size: min(220px, 72vmin);
					width: var(--timer-size);
					aspect-ratio: 1;
					border-radius: 50%;
					display: grid;
					place-items: center;
					background:
						radial-gradient(circle, var(--panel) 0 63%, transparent 64%),
						conic-gradient(
							from -90deg,
							var(--primary) 0deg,
							var(--secondary) var(--timer-progress),
							var(--track) var(--timer-progress),
							var(--track) 360deg
						);
				}

				.pip-ring-inner {
					width: calc(100% - 28px);
					height: calc(100% - 28px);
					border-radius: 50%;
					background: var(--panel);
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
				}

				.pip-time {
					font-size: clamp(3rem, 18vmin, 4.4rem);
					line-height: 1;
					font-weight: 900;
					font-variant-numeric: tabular-nums;
					letter-spacing: 0;
				}

				.pip-unit {
					font-size: 0.8rem;
					font-weight: 800;
					color: var(--muted);
					letter-spacing: 0.12em;
				}

				.pip-lines {
					width: 100%;
					text-align: center;
				}

				.pip-task,
				.pip-session {
					margin: 0;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.pip-task {
					font-size: 0.95rem;
					font-weight: 800;
				}

				.pip-session {
					margin-top: 4px;
					font-size: 0.8rem;
					color: var(--muted);
				}

				.pip-controls {
					display: flex;
					gap: 8px;
					flex-wrap: wrap;
					justify-content: center;
				}

				button {
					border: 1px solid var(--border);
					border-radius: 999px;
					padding: 9px 14px;
					background: var(--panel);
					color: var(--muted);
					font: inherit;
					font-size: 0.8rem;
					font-weight: 800;
					cursor: pointer;
				}

				.pip-toggle {
					border-color: transparent;
					background: linear-gradient(135deg, var(--primary), var(--secondary));
					color: #fff;
				}
			</style>
			<main class="pip-card" aria-label="FocusFlow timer picture in picture">
				<p class="pip-mode" id="pipMode"></p>
				<div class="pip-ring" id="pipRing">
					<div class="pip-ring-inner">
						<div class="pip-time" id="pipTime" role="timer" aria-live="polite"></div>
						<div class="pip-unit">MIN</div>
					</div>
				</div>
				<div class="pip-lines">
					<p class="pip-task" id="pipTask"></p>
					<p class="pip-session" id="pipSession"></p>
				</div>
				<div class="pip-controls">
					<button class="pip-toggle" id="pipToggle" type="button"></button>
					<button id="pipReset" type="button">Reset</button>
					<button id="pipSkip" type="button">Skip</button>
				</div>
			</main>
		`;
	}

	function updateTimerPipButton(isOpen) {
		const { timerPipBtn } = app.el;

		timerPipBtn.setAttribute("aria-pressed", String(isOpen));
		timerPipBtn.setAttribute(
			"aria-label",
			isOpen ? "Close timer picture in picture" : "Open timer picture in picture",
		);
	}

	function closeTimerPip() {
		if (timerPipWindow && !timerPipWindow.closed) {
			timerPipWindow.close();
		}

		timerPipWindow = null;
		updateTimerPipButton(false);
	}

	function attachTimerPipEvents(pipDocument) {
		pipDocument.getElementById("pipToggle").addEventListener("click", () => {
			if (app.state.isRunning) {
				app.pauseTimer();
				return;
			}

			startTimer();
		});

		pipDocument.getElementById("pipReset").addEventListener("click", resetTimer);
		pipDocument.getElementById("pipSkip").addEventListener("click", skipSession);
	}

	app.renderTimerPip = function renderTimerPip() {
		if (!timerPipWindow || timerPipWindow.closed) return;

		const pipDocument = timerPipWindow.document;
		const theme = document.documentElement.getAttribute("data-theme") || "light";
		const toggleButton = pipDocument.getElementById("pipToggle");

		pipDocument.documentElement.setAttribute("data-theme", theme);
		pipDocument.getElementById("pipMode").textContent = getModeLabel(
			app.state.mode,
		);
		pipDocument.getElementById("pipTime").textContent = app.formatTime(
			app.state.secondsLeft,
		);
		pipDocument
			.getElementById("pipRing")
			.style.setProperty("--timer-progress", `${getTimerProgress()}deg`);
		pipDocument.getElementById("pipTask").textContent =
			app.el.activeTaskLine.textContent;
		pipDocument.getElementById("pipSession").textContent =
			app.el.sessionCountLine.textContent;
		toggleButton.textContent = app.state.isRunning ? "Pause" : "Start";
		toggleButton.setAttribute(
			"aria-label",
			app.state.isRunning ? "Pause timer" : "Start timer",
		);
	};

	async function toggleTimerPip() {
		if (timerPipWindow && !timerPipWindow.closed) {
			closeTimerPip();
			return;
		}

		if (!("documentPictureInPicture" in window)) {
			app.showToast("Picture in Picture is not supported in this browser.");
			return;
		}

		try {
			timerPipWindow = await window.documentPictureInPicture.requestWindow({
				width: 360,
				height: 430,
			});

			timerPipWindow.document.body.innerHTML = getTimerPipMarkup();
			attachTimerPipEvents(timerPipWindow.document);
			timerPipWindow.addEventListener("pagehide", () => {
				timerPipWindow = null;
				updateTimerPipButton(false);
			});

			updateTimerPipButton(true);
			app.renderTimerPip();
		} catch (err) {
			timerPipWindow = null;
			updateTimerPipButton(false);
		}
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
		const progress = getTimerProgress();
		const timerRing = app.el.timerDisplay.closest(".timer-ring");

		app.el.timerDisplay.textContent = time;
		if (timerRing) {
			timerRing.style.setProperty("--timer-progress", `${progress}deg`);
		}
		updateDocumentTitle(time);
		updateTimerToggleButton();
		app.renderTimerPip();
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
		el.timerPipBtn.addEventListener("click", toggleTimerPip);
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
