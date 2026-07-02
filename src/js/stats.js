(function (app) {
	"use strict";

	const MIN_GOAL_MINUTES = 5;
	const MAX_GOAL_MINUTES = 1440;

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

	function normalizeGoal(value) {
		const goal = Number(value);

		if (!Number.isFinite(goal)) {
			return app.DEFAULT_GOAL_MINUTES;
		}

		return Math.min(
			MAX_GOAL_MINUTES,
			Math.max(MIN_GOAL_MINUTES, Math.round(goal)),
		);
	}

	function getGoalInputValue() {
		const value = Number(app.el.goalInput.value);

		if (
			!Number.isFinite(value) ||
			!Number.isInteger(value) ||
			value < MIN_GOAL_MINUTES ||
			value > MAX_GOAL_MINUTES
		) {
			return null;
		}

		return value;
	}

	function setGoalFormOpen(isOpen) {
		const { el, state } = app;

		el.goalForm.hidden = !isOpen;
		el.editGoalBtn.classList.toggle("is-editing", isOpen);
		el.editGoalBtn.setAttribute("aria-expanded", String(isOpen));
		el.editGoalBtn.setAttribute(
			"aria-label",
			isOpen ? "Close daily focus goal editor" : "Edit daily focus goal",
		);

		if (isOpen) {
			el.goalInput.value = state.dailyGoal;
			el.goalInput.removeAttribute("aria-invalid");
			el.goalInput.focus();
			el.goalInput.select();
		}
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

		const goal = normalizeGoal(state.dailyGoal);
		if (goal !== state.dailyGoal) {
			state.dailyGoal = goal;
			app.persistGoal();
		}

		const progressPercent = Math.min(
			100,
			Math.round((todaysMinutes / goal) * 100),
		);
		const remainingMinutes = Math.max(goal - todaysMinutes, 0);
		const overGoalMinutes = Math.max(todaysMinutes - goal, 0);
		const isComplete = todaysMinutes >= goal;

		el.goalCurrent.textContent = String(todaysMinutes);
		el.goalTarget.textContent = String(goal);
		el.goalPercent.textContent = `${progressPercent}%`;
		el.goalStatus.textContent = isComplete
			? overGoalMinutes > 0
				? `Goal complete. ${overGoalMinutes} min over target.`
				: "Goal complete for today."
			: `${remainingMinutes} min left to reach today's goal.`;
		el.goalProgressFill.style.width = `${progressPercent}%`;
		el.goalProgressBar.setAttribute("aria-valuemax", String(goal));
		el.goalProgressBar.setAttribute(
			"aria-valuenow",
			String(Math.min(todaysMinutes, goal)),
		);
		el.goalProgressBar.setAttribute(
			"aria-valuetext",
			`${todaysMinutes} of ${goal} minutes complete`,
		);
		el.goalProgressBar.classList.toggle("is-complete", isComplete);
	};

	app.initStats = function initStats() {
		const { el, state } = app;

		el.editGoalBtn.addEventListener("click", () => {
			setGoalFormOpen(el.goalForm.hidden);
		});

		el.goalInput.addEventListener("input", () => {
			el.goalInput.removeAttribute("aria-invalid");
		});

		el.goalInput.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				setGoalFormOpen(false);
			}
		});

		el.goalForm.addEventListener("submit", (event) => {
			event.preventDefault();

			const value = getGoalInputValue();

			if (value === null) {
				el.goalInput.setAttribute("aria-invalid", "true");
				app.showToast("Enter a goal between 5 and 1440 minutes.");
				return;
			}

			state.dailyGoal = value;
			app.persistGoal();
			app.renderStats();
			setGoalFormOpen(false);
			app.showToast("Daily goal updated.");
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
