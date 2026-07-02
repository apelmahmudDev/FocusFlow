(function (app) {
	"use strict";

	app.el = {
		themeToggle: document.getElementById("themeToggle"),
		soundToggle: document.getElementById("soundToggle"),
		settingsToggle: document.getElementById("settingsToggle"),
		settingsPanel: document.getElementById("settingsPanel"),
		settingsFocusInput: document.getElementById("settingsFocusInput"),
		settingsShortInput: document.getElementById("settingsShortInput"),
		settingsLongInput: document.getElementById("settingsLongInput"),
		settingsResetBtn: document.getElementById("settingsResetBtn"),
		settingsSaveBtn: document.getElementById("settingsSaveBtn"),

		modeButtons: Array.from(document.querySelectorAll(".mode-btn")),
		timerCardTitle: document.getElementById("timerCardTitle"),
		timerDisplay: document.getElementById("timerDisplay"),
		activeTaskLine: document.getElementById("activeTaskLine"),
		sessionCountLine: document.getElementById("sessionCountLine"),

		timerToggleBtn: document.getElementById("timerToggleBtn"),
		resetBtn: document.getElementById("resetBtn"),
		skipBtn: document.getElementById("skipBtn"),

		statSessions: document.getElementById("statSessions"),
		statMinutes: document.getElementById("statMinutes"),
		statTotal: document.getElementById("statTotal"),
		statBestCategory: document.getElementById("statBestCategory"),

		editGoalBtn: document.getElementById("editGoalBtn"),
		goalForm: document.getElementById("goalForm"),
		goalInput: document.getElementById("goalInput"),
		saveGoalBtn: document.getElementById("saveGoalBtn"),
		goalCurrent: document.getElementById("goalCurrent"),
		goalTarget: document.getElementById("goalTarget"),
		goalProgressBar: document.getElementById("goalProgressBar"),
		goalProgressFill: document.getElementById("goalProgressFill"),

		taskForm: document.getElementById("taskForm"),
		taskTitleInput: document.getElementById("taskTitleInput"),
		taskCategoryInput: document.getElementById("taskCategoryInput"),
		taskEstimateInput: document.getElementById("taskEstimateInput"),
		taskList: document.getElementById("taskList"),
		taskEmptyState: document.getElementById("taskEmptyState"),

		historyList: document.getElementById("historyList"),
		historyEmptyState: document.getElementById("historyEmptyState"),
		clearHistoryBtn: document.getElementById("clearHistoryBtn"),

		toast: document.getElementById("toast"),
	};
})((window.FocusFlow = window.FocusFlow || {}));
