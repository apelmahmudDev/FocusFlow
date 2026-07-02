(function (app) {
	"use strict";

	app.uid = function uid() {
		return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
	};

	app.formatTime = function formatTime(totalSeconds) {
		const minutes = Math.floor(totalSeconds / 60)
			.toString()
			.padStart(2, "0");
		const seconds = Math.floor(totalSeconds % 60)
			.toString()
			.padStart(2, "0");

		return `${minutes}:${seconds}`;
	};

	app.isSameDay = function isSameDay(isoString, reference) {
		const date = new Date(isoString);

		return (
			date.getFullYear() === reference.getFullYear() &&
			date.getMonth() === reference.getMonth() &&
			date.getDate() === reference.getDate()
		);
	};

	app.formatHistoryDate = function formatHistoryDate(isoString) {
		const date = new Date(isoString);
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(now.getDate() - 1);

		const time = date.toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit",
		});

		if (app.isSameDay(isoString, now)) return `Today, ${time}`;
		if (app.isSameDay(isoString, yesterday)) return `Yesterday, ${time}`;

		return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
	};

	app.showToast = function showToast(message) {
		const { el } = app;

		el.toast.textContent = message;
		el.toast.classList.add("show");

		clearTimeout(app.showToast.timer);
		app.showToast.timer = setTimeout(() => {
			el.toast.classList.remove("show");
		}, 2800);
	};
})(window.FocusFlow = window.FocusFlow || {});
