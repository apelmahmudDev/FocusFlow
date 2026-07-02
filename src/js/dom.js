(function (app) {
	"use strict";

	app.el = {
		themeToggle: document.getElementById("themeToggle"),
		soundToggle: document.getElementById("soundToggle"),

		modeButtons: Array.from(document.querySelectorAll(".mode-btn")),
		timerDisplay: document.getElementById("timerDisplay"),
		activeTaskLine: document.getElementById("activeTaskLine"),
		sessionCountLine: document.getElementById("sessionCountLine"),

		startBtn: document.getElementById("startBtn"),
		pauseBtn: document.getElementById("pauseBtn"),
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
})(window.FocusFlow = window.FocusFlow || {});
