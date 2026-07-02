(function (app) {
	"use strict";

	app.renderHistory = function renderHistory() {
		const { el, state } = app;
		el.historyList.innerHTML = "";

		if (state.history.length === 0) {
			el.historyEmptyState.hidden = false;
			return;
		}

		el.historyEmptyState.hidden = true;

		state.history.slice(0, 25).forEach((item) => {
			const listItem = document.createElement("li");
			listItem.className = "history-item";

			const top = document.createElement("div");
			top.className = "history-item-top";

			const badge = document.createElement("span");
			badge.className =
				"badge " + (item.mode === "focus" ? "badge-focus" : "badge-break");
			badge.textContent = item.mode === "focus" ? "Focus" : "Break";

			const title = document.createElement("p");
			title.className = "history-item-title";
			title.textContent = `${item.taskName} - ${item.durationMinutes} min`;

			top.appendChild(badge);
			listItem.appendChild(top);
			listItem.appendChild(title);

			const time = document.createElement("p");
			time.className = "history-item-time";
			time.textContent = app.formatHistoryDate(item.completedAt);
			listItem.appendChild(time);

			el.historyList.appendChild(listItem);
		});
	};

	app.initHistory = function initHistory() {
		const { el, state } = app;

		el.clearHistoryBtn.addEventListener("click", () => {
			if (state.history.length === 0) return;

			const confirmed = window.confirm(
				"Clear all session history? This cannot be undone.",
			);

			if (!confirmed) return;

			state.history = [];
			app.persistHistory();
			app.renderHistory();
			app.renderStats();
			app.showToast("History cleared.");
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
