(function (app) {
	"use strict";

	function normalizeStoredTasks() {
		let didChange = false;

		app.state.tasks.forEach((task) => {
			const completedPomodoros = Number(task.completedPomodoros);
			const estimatedPomodoros = Number(task.estimatedPomodoros);
			const title = typeof task.title === "string" ? task.title.trim() : "";

			if (
				!Number.isFinite(completedPomodoros) ||
				completedPomodoros < 0 ||
				!Number.isInteger(completedPomodoros)
			) {
				task.completedPomodoros = 0;
				didChange = true;
			} else if (task.completedPomodoros !== completedPomodoros) {
				task.completedPomodoros = completedPomodoros;
				didChange = true;
			}

			if (typeof task.completed !== "boolean") {
				task.completed = false;
				didChange = true;
			}

			if (
				!Number.isFinite(estimatedPomodoros) ||
				estimatedPomodoros < 1 ||
				!Number.isInteger(estimatedPomodoros)
			) {
				task.estimatedPomodoros = 1;
				didChange = true;
			} else if (task.estimatedPomodoros !== estimatedPomodoros) {
				task.estimatedPomodoros = estimatedPomodoros;
				didChange = true;
			}

			if (!app.CATEGORIES.includes(task.category)) {
				task.category = "Coding";
				didChange = true;
			}

			if (!title) {
				task.title = "Untitled task";
				didChange = true;
			} else if (task.title !== title) {
				task.title = title;
				didChange = true;
			}
		});

		if (app.state.activeTaskId && !app.getActiveTask()) {
			app.state.activeTaskId = null;
			app.persistActiveTask();
		}

		if (didChange) {
			app.persistTasks();
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
		app.initDailyCleanup();
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
