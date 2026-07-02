(function (app) {
	"use strict";

	function normalizeStoredTasks() {
		app.state.tasks.forEach((task) => {
			if (typeof task.completedPomodoros !== "number") {
				task.completedPomodoros = 0;
			}

			if (typeof task.completed !== "boolean") {
				task.completed = false;
			}
		});

		if (app.state.activeTaskId && !app.getActiveTask()) {
			app.state.activeTaskId = null;
			app.persistActiveTask();
		}
	}

	function init() {
		app.initTheme();
		app.initSound();
		app.initSettings();
		app.initTimer();
		app.initStats();
		app.initTasks();
		app.initHistory();

		normalizeStoredTasks();
		app.restoreTimer();
		app.renderTaskList();
		app.renderHistory();
		app.renderStats();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})((window.FocusFlow = window.FocusFlow || {}));
