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

	function padTimePart(value) {
		return String(value).padStart(2, "0");
	}

	function getLocalDateKey(date) {
		return [
			date.getFullYear(),
			padTimePart(date.getMonth() + 1),
			padTimePart(date.getDate()),
		].join("-");
	}

	function addDays(date, days) {
		const nextDate = new Date(date);
		nextDate.setDate(nextDate.getDate() + days);
		return nextDate;
	}

	function normalizeCleanupTime(value) {
		const match = typeof value === "string" ? value.match(/^(\d{2}):(\d{2})$/) : null;
		const hour = match ? Number(match[1]) : NaN;
		const minute = match ? Number(match[2]) : NaN;

		if (
			!Number.isInteger(hour) ||
			!Number.isInteger(minute) ||
			hour < 0 ||
			hour > 23 ||
			minute < 0 ||
			minute > 59
		) {
			return app.DEFAULT_DAILY_CLEANUP_TIME;
		}

		return `${padTimePart(hour)}:${padTimePart(minute)}`;
	}

	function cleanupTimeToParts(value) {
		const [hourText, minuteText] = normalizeCleanupTime(value).split(":");
		const hour24 = Number(hourText);
		const minute = Number(minuteText);
		const period = hour24 >= 12 ? "PM" : "AM";
		const hour12 = hour24 % 12 || 12;

		return {
			hour: hour12,
			minute,
			period,
		};
	}

	function getCleanupInputTime() {
		const hour = Number(app.el.cleanupHourInput.value);
		const minute = Number(app.el.cleanupMinuteInput.value);
		const period = app.el.cleanupPeriodInput.value;

		if (
			!Number.isInteger(hour) ||
			!Number.isInteger(minute) ||
			hour < 1 ||
			hour > 12 ||
			minute < 0 ||
			minute > 59 ||
			(period !== "AM" && period !== "PM")
		) {
			return null;
		}

		const hour24 =
			period === "AM" ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;

		return `${padTimePart(hour24)}:${padTimePart(minute)}`;
	}

	function setCleanupInputs(value) {
		const { el } = app;
		const parts = cleanupTimeToParts(value);

		el.cleanupHourInput.value = String(parts.hour);
		el.cleanupMinuteInput.value = padTimePart(parts.minute);
		el.cleanupPeriodInput.value = parts.period;
	}

	function syncOpenState(isOpen) {
		const { settingsToggle, settingsPanel, settingsBackdrop } = app.el;

		settingsToggle.setAttribute("aria-expanded", String(isOpen));
		settingsPanel.hidden = !isOpen;
		settingsBackdrop.hidden = !isOpen;
		document.body.classList.toggle("settings-modal-open", isOpen);
	}

	function openSettings() {
		const { el } = app;

		setSettingsInputs(app.DURATIONS);
		setCleanupInputs(app.state.dailyCleanup.time);

		syncOpenState(true);
		el.settingsFocusInput.focus();
	}

	function closeSettings() {
		syncOpenState(false);
	}

	function setSettingsInputs(durations) {
		const { el } = app;

		el.settingsFocusInput.value = secondsToMinutes(durations.focus);
		el.settingsShortInput.value = secondsToMinutes(durations.short);
		el.settingsLongInput.value = secondsToMinutes(durations.long);
	}

	function applyDurations(nextDurations, message) {
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
		app.showToast(message);
		closeSettings();
	}

	function saveSettings() {
		const { el } = app;
		const cleanupTime = getCleanupInputTime();
		const now = new Date();
		const nextDurations = {
			focus: minutesToSeconds(el.settingsFocusInput.value, app.DURATIONS.focus),
			short: minutesToSeconds(el.settingsShortInput.value, app.DURATIONS.short),
			long: minutesToSeconds(el.settingsLongInput.value, app.DURATIONS.long),
		};

		if (cleanupTime === null) {
			app.showToast("Enter a valid cleanup time.");
			el.cleanupHourInput.focus();
			return;
		}

		app.state.dailyCleanup.time = cleanupTime;
		app.state.dailyCleanup.lastRunDate = getCleanupDueDateKey(
			now,
			getCleanupMinutes(cleanupTime),
		);
		app.persistDailyCleanup();
		applyDurations(nextDurations, "Timer durations updated.");
	}

	function resetSettings() {
		const defaultDurations = { ...app.DEFAULT_DURATIONS };

		setSettingsInputs(defaultDurations);
		setCleanupInputs(app.DEFAULT_DAILY_CLEANUP_TIME);
		app.state.dailyCleanup.time = app.DEFAULT_DAILY_CLEANUP_TIME;
		app.state.dailyCleanup.lastRunDate = getCleanupDueDateKey(
			new Date(),
			getCleanupMinutes(app.DEFAULT_DAILY_CLEANUP_TIME),
		);
		app.persistDailyCleanup();
		applyDurations(defaultDurations, "Timer durations reset to defaults.");
	}

	function getCleanupMinutes(value) {
		const [hourText, minuteText] = normalizeCleanupTime(value).split(":");
		return Number(hourText) * 60 + Number(minuteText);
	}

	function getCleanupDueDateKey(date, cleanupMinutes) {
		const currentMinutes = date.getHours() * 60 + date.getMinutes();
		const dueDate = currentMinutes >= cleanupMinutes ? date : addDays(date, -1);

		return getLocalDateKey(dueDate);
	}

	function clearDailyActivity({ showToast = false } = {}) {
		const previousTaskCount = app.state.tasks.length;

		app.state.history = [];
		app.state.sessionsCompletedInCycle = 0;
		app.state.tasks = app.state.tasks
			.filter((task) => !task.completed)
			.map((task) => ({
				...task,
				completedPomodoros: 0,
			}));

		if (
			app.state.activeTaskId &&
			!app.state.tasks.some((task) => task.id === app.state.activeTaskId)
		) {
			app.state.activeTaskId = null;
			app.persistActiveTask();
			app.renderActiveTaskLine();
		}

		app.persistHistory();
		app.persistCycle();
		app.persistTasks();
		app.renderHistory();
		app.renderTaskList();
		app.renderStats();

		if (showToast) {
			const removedTasks = previousTaskCount - app.state.tasks.length;
			app.showToast(
				removedTasks > 0
					? `Daily progress cleared. ${removedTasks} completed task${removedTasks === 1 ? "" : "s"} removed.`
					: "Daily progress cleared.",
			);
		}
	}

	app.runDailyCleanup = function runDailyCleanup({ showToast = false } = {}) {
		const now = new Date();
		const cleanupMinutes = getCleanupMinutes(app.state.dailyCleanup.time);
		const dueDateKey = getCleanupDueDateKey(now, cleanupMinutes);

		app.state.dailyCleanup.time = normalizeCleanupTime(app.state.dailyCleanup.time);

		if (app.state.dailyCleanup.lastRunDate === dueDateKey) return;

		clearDailyActivity({ showToast });
		app.state.dailyCleanup.lastRunDate = dueDateKey;
		app.persistDailyCleanup();
	};

	app.initDailyCleanup = function initDailyCleanup() {
		app.state.dailyCleanup.time = normalizeCleanupTime(app.state.dailyCleanup.time);
		if (!app.state.dailyCleanup.lastRunDate) {
			app.state.dailyCleanup.lastRunDate = getCleanupDueDateKey(
				new Date(),
				getCleanupMinutes(app.state.dailyCleanup.time),
			);
		}
		app.persistDailyCleanup();
		app.runDailyCleanup();

		setInterval(() => {
			app.runDailyCleanup({ showToast: true });
		}, 60 * 1000);
	};

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
		el.settingsResetBtn.addEventListener("click", resetSettings);
		el.settingsBackdrop.addEventListener("click", closeSettings);

		document.addEventListener("click", (event) => {
			if (el.settingsPanel.hidden) return;
			if (el.settingsPanel.contains(event.target)) return;
			if (el.settingsToggle.contains(event.target)) return;
			if (el.settingsBackdrop.contains(event.target)) return;

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
