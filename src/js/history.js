(function (app) {
	"use strict";

	const HISTORY_LIMIT = 25;
	const MODE_DETAILS = {
		focus: {
			label: "Focus",
			badgeClass: "badge-focus",
		},
		short: {
			label: "Short break",
			badgeClass: "badge-break",
		},
		long: {
			label: "Long break",
			badgeClass: "badge-break",
		},
	};

	function getModeDetails(mode) {
		return MODE_DETAILS[mode] || {
			label: "Session",
			badgeClass: "badge-neutral",
		};
	}

	function getCompletedTime(item) {
		const time = new Date(item.completedAt).getTime();
		return Number.isFinite(time) ? time : 0;
	}

	function formatDuration(minutes) {
		const value = Number(minutes);

		if (!Number.isFinite(value) || value <= 0) return "0 min";
		if (Number.isInteger(value)) return `${value} min`;

		return `${value.toFixed(1)} min`;
	}

	function getHistoryItems() {
		return app.state.history
			.filter((item) => item && typeof item === "object")
			.slice()
			.sort((left, right) => getCompletedTime(right) - getCompletedTime(left));
	}

	function updateHistoryControls(totalCount) {
		const hasHistory = totalCount > 0;

		if (app.el.historyCount) {
			if (!hasHistory) {
				app.el.historyCount.textContent = "No sessions logged";
			} else if (totalCount > HISTORY_LIMIT) {
				app.el.historyCount.textContent = `Showing latest ${HISTORY_LIMIT} of ${totalCount} sessions`;
			} else {
				app.el.historyCount.textContent = `${totalCount} session${totalCount === 1 ? "" : "s"} logged`;
			}
		}

		app.el.clearHistoryBtn.disabled = !hasHistory;
		app.el.clearHistoryBtn.setAttribute("aria-disabled", String(!hasHistory));
	}

	function createHistoryItem(item) {
		const listItem = document.createElement("li");
		const modeDetails = getModeDetails(item.mode);
		const content = document.createElement("div");
		const meta = document.createElement("div");
		const badge = document.createElement("span");
		const time = document.createElement("time");
		const title = document.createElement("p");
		const duration = document.createElement("span");
		const completedAt = new Date(item.completedAt);

		listItem.className = "history-item";
		content.className = "history-item-content";
		meta.className = "history-item-meta";

		badge.className = `badge ${modeDetails.badgeClass}`;
		badge.textContent = modeDetails.label;

		time.className = "history-item-time";
		time.textContent = app.formatHistoryDate(item.completedAt);
		if (!Number.isNaN(completedAt.getTime())) {
			time.dateTime = item.completedAt;
		}

		title.className = "history-item-title";
		title.textContent = item.taskName || "No active task";

		duration.className = "history-item-duration";
		duration.textContent = formatDuration(item.durationMinutes);

		meta.appendChild(badge);
		meta.appendChild(time);
		content.appendChild(meta);
		content.appendChild(title);
		listItem.appendChild(content);
		listItem.appendChild(duration);

		return listItem;
	}

	app.renderHistory = function renderHistory() {
		const { el } = app;
		const historyItems = getHistoryItems();
		const visibleItems = historyItems.slice(0, HISTORY_LIMIT);
		const fragment = document.createDocumentFragment();

		el.historyList.innerHTML = "";
		updateHistoryControls(historyItems.length);

		if (historyItems.length === 0) {
			el.historyEmptyState.hidden = false;
			return;
		}

		el.historyEmptyState.hidden = true;

		visibleItems.forEach((item) => {
			fragment.appendChild(createHistoryItem(item));
		});

		el.historyList.appendChild(fragment);
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
