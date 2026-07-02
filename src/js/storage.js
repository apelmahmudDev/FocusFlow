(function (app) {
	"use strict";

	app.loadJSON = function loadJSON(key, fallback) {
		try {
			const raw = localStorage.getItem(key);
			return raw === null ? fallback : JSON.parse(raw);
		} catch (err) {
			return fallback;
		}
	};

	app.saveJSON = function saveJSON(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (err) {
			// localStorage may be unavailable in private mode or after quota errors.
		}
	};
})(window.FocusFlow = window.FocusFlow || {});
