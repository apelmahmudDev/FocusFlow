(function (app) {
	"use strict";

	const { DEFAULT_GOAL_MINUTES, DURATIONS, STORAGE_KEYS } = app;

	app.state = {
		mode: "focus",
		secondsLeft: DURATIONS.focus,
		isRunning: false,
		intervalId: null,

		tasks: app.loadJSON(STORAGE_KEYS.tasks, []),
		history: app.loadJSON(STORAGE_KEYS.history, []),
		activeTaskId: app.loadJSON(STORAGE_KEYS.activeTaskId, null),
		dailyGoal: app.loadJSON(STORAGE_KEYS.goal, DEFAULT_GOAL_MINUTES),
		soundOn: app.loadJSON(STORAGE_KEYS.sound, true),
		sessionsCompletedInCycle: app.loadJSON(
			STORAGE_KEYS.sessionsBeforeLongBreak,
			0,
		),
	};

	app.getActiveTask = function getActiveTask() {
		return (
			app.state.tasks.find((task) => task.id === app.state.activeTaskId) || null
		);
	};

	app.persistTasks = function persistTasks() {
		app.saveJSON(STORAGE_KEYS.tasks, app.state.tasks);
	};

	app.persistHistory = function persistHistory() {
		app.saveJSON(STORAGE_KEYS.history, app.state.history);
	};

	app.persistActiveTask = function persistActiveTask() {
		app.saveJSON(STORAGE_KEYS.activeTaskId, app.state.activeTaskId);
	};

	app.persistGoal = function persistGoal() {
		app.saveJSON(STORAGE_KEYS.goal, app.state.dailyGoal);
	};

	app.persistSound = function persistSound() {
		app.saveJSON(STORAGE_KEYS.sound, app.state.soundOn);
	};

	app.persistCycle = function persistCycle() {
		app.saveJSON(
			STORAGE_KEYS.sessionsBeforeLongBreak,
			app.state.sessionsCompletedInCycle,
		);
	};

	app.persistTimer = function persistTimer() {
		app.saveJSON(STORAGE_KEYS.timer, {
			mode: app.state.mode,
			secondsLeft: app.state.secondsLeft,
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
