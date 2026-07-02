(function (app) {
	"use strict";

	app.STORAGE_KEYS = {
		tasks: "focusflow_tasks",
		history: "focusflow_history",
		goal: "focusflow_goal",
		theme: "focusflow_theme",
		sound: "focusflow_sound",
		durations: "focusflow_durations",
		activeTaskId: "focusflow_active_task_id",
		sessionsBeforeLongBreak: "focusflow_sessions_completed_cycle",
		timer: "focusflow_timer",
	};

	app.DEFAULT_DURATIONS = {
		focus: 25 * 60,
		short: 5 * 60,
		long: 15 * 60,
	};

	app.DURATIONS = { ...app.DEFAULT_DURATIONS };

	app.MODE_LABELS = {
		focus: "Focus period",
		short: "Short break",
		long: "Long break",
	};

	app.SESSIONS_UNTIL_LONG_BREAK = 4;
	app.DEFAULT_GOAL_MINUTES = 120;
	app.CATEGORIES = ["Study", "Coding", "Reading", "Writing", "Other"];
	app.APP_TITLE = "FocusFlow - Pomodoro Focus Timer";
})((window.FocusFlow = window.FocusFlow || {}));
