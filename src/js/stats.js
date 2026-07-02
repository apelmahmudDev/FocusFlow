(function (app) {
	"use strict";

	function computeBestCategory() {
		const tally = {};

		app.state.tasks.forEach((task) => {
			tally[task.category] =
				(tally[task.category] || 0) + task.completedPomodoros;
		});

		let bestCategory = null;
		let bestCount = 0;

		Object.entries(tally).forEach(([category, count]) => {
			if (count > bestCount) {
				bestCategory = category;
				bestCount = count;
			}
		});

		return bestCategory || "-";
	}

	app.renderStats = function renderStats() {
		const { el, state } = app;
		const now = new Date();
		const todaysFocusHistory = state.history.filter(
			(item) => item.mode === "focus" && app.isSameDay(item.completedAt, now),
		);

		const todaysSessions = todaysFocusHistory.length;
		const todaysMinutes = todaysFocusHistory.reduce(
			(sum, item) => sum + item.durationMinutes,
			0,
		);
		const totalSessions = state.history.filter(
			(item) => item.mode === "focus",
		).length;

		el.statSessions.textContent = String(todaysSessions);
		el.statMinutes.textContent = String(todaysMinutes);
		el.statTotal.textContent = String(totalSessions);
		el.statBestCategory.textContent = computeBestCategory();

		const goal = state.dailyGoal;
		const progressPercent = Math.min(
			100,
			Math.round((todaysMinutes / goal) * 100),
		);

		el.goalCurrent.textContent = String(todaysMinutes);
		el.goalTarget.textContent = String(goal);
		el.goalProgressFill.style.width = `${progressPercent}%`;
		el.goalProgressBar.setAttribute("aria-valuemax", String(goal));
		el.goalProgressBar.setAttribute("aria-valuenow", String(todaysMinutes));
	};

	app.initStats = function initStats() {
		const { el, state } = app;

		el.editGoalBtn.addEventListener("click", () => {
			el.goalInput.value = state.dailyGoal;
			el.goalForm.hidden = !el.goalForm.hidden;
			if (!el.goalForm.hidden) el.goalInput.focus();
		});

		el.saveGoalBtn.addEventListener("click", () => {
			const value = parseInt(el.goalInput.value, 10);

			if (!Number.isFinite(value) || value <= 0) {
				app.showToast("Enter a valid goal in minutes.");
				return;
			}

			state.dailyGoal = value;
			app.persistGoal();
			app.renderStats();
			el.goalForm.hidden = true;
			app.showToast("Daily goal updated.");
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
