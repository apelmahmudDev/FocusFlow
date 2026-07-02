(function (app) {
	"use strict";

	app.renderActiveTaskLine = function renderActiveTaskLine() {
		const { el, state } = app;
		const task = app.getActiveTask();

		if (state.mode === "focus") {
			el.activeTaskLine.textContent = task
				? `Active task: ${task.title}`
				: "No active task selected.";
		} else {
			el.activeTaskLine.textContent =
				"Take a break - step away from the screen.";
		}

		const nextInCycle =
			(state.sessionsCompletedInCycle % app.SESSIONS_UNTIL_LONG_BREAK) + 1;
		el.sessionCountLine.textContent = `Session ${nextInCycle} of ${app.SESSIONS_UNTIL_LONG_BREAK} before long break`;
	};
})(window.FocusFlow = window.FocusFlow || {});
