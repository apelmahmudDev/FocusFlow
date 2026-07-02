(function (app) {
	"use strict";

	function getThemeIconMarkup(theme) {
		if (theme === "dark") {
			return `
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M20.2 14.7A8.8 8.8 0 1 1 9.3 3.8a.8.8 0 0 1 .9 1 6.9 6.9 0 0 0 8.9 8.9.8.8 0 0 1 1 .9Z" />
				</svg>
			`;
		}

		return `
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					focusable="false"
				>
					<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
					<path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M17.66 17.66L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M4.93 19.07L6.34 17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		`;
	}

	function applyTheme(theme) {
		const { el } = app;
		const isDark = theme === "dark";

		document.documentElement.setAttribute("data-theme", theme);
		el.themeToggle.setAttribute("aria-pressed", String(isDark));
		el.themeToggle.querySelector(".toggle-icon").innerHTML =
			getThemeIconMarkup(theme);
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
})((window.FocusFlow = window.FocusFlow || {}));
