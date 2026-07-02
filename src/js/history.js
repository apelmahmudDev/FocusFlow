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

			const icon = document.createElement("span");
			icon.className = "history-item-icon";
			icon.setAttribute("aria-hidden", "true");
			icon.innerHTML =
				'<svg viewBox="0 0 24 24" focusable="false"><path d="M12 2 15 5h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V5h4l3-3Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"></path></svg>';
			listItem.appendChild(icon);

			const content = document.createElement("div");
			content.className = "history-item-content";

			const badge = document.createElement("span");
			badge.className =
				"badge " + (item.mode === "focus" ? "badge-focus" : "badge-break");
			badge.textContent = item.mode === "focus" ? "Focus" : "Break";

			const title = document.createElement("p");
			title.className = "history-item-title";
			title.textContent = item.taskName;

			content.appendChild(badge);
			content.appendChild(title);

			const time = document.createElement("p");
			time.className = "history-item-time";
			time.textContent = app.formatHistoryDate(item.completedAt);
			content.appendChild(time);
			listItem.appendChild(content);

			const duration = document.createElement("span");
			duration.className = "history-item-duration";
			duration.textContent = `${item.durationMinutes} min`;
			listItem.appendChild(duration);

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
