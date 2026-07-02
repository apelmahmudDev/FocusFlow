(function (app) {
	"use strict";

	function applyTheme(theme) {
		const { el } = app;
		const isDark = theme === "dark";

		document.documentElement.setAttribute("data-theme", theme);
		el.themeToggle.setAttribute("aria-pressed", String(isDark));
		el.themeToggle.querySelector(".toggle-icon").textContent = isDark
			? "Light"
			: "Dark";
		el.themeToggle.querySelector(".toggle-label").textContent = "Mode";
	}

	app.initTheme = function initTheme() {
		const { el, STORAGE_KEYS } = app;
		const saved = app.loadJSON(STORAGE_KEYS.theme, null);
		const theme =
			saved ||
			(window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light");

		applyTheme(theme);

		el.themeToggle.addEventListener("click", () => {
			const current = document.documentElement.getAttribute("data-theme");
			const next = current === "dark" ? "light" : "dark";

			applyTheme(next);
			app.saveJSON(STORAGE_KEYS.theme, next);
		});
	};
})(window.FocusFlow = window.FocusFlow || {});
