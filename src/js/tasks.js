(function (app) {
	"use strict";

	const MIN_ESTIMATE = 1;
	const MAX_ESTIMATE = 20;
	const MAX_TITLE_LENGTH = 80;

	function getOrderedTasks() {
		const activeTaskId = app.state.activeTaskId;

		return app.state.tasks
			.map((task, index) => ({ task, index }))
			.sort((left, right) => {
				const leftActive = left.task.id === activeTaskId;
				const rightActive = right.task.id === activeTaskId;

				if (leftActive !== rightActive) return leftActive ? -1 : 1;
				if (left.task.completed !== right.task.completed) {
					return left.task.completed ? 1 : -1;
				}

				return left.index - right.index;
			})
			.map((item) => item.task);
	}

	function normalizeTaskTitle(value) {
		return value.trim().replace(/\s+/g, " ");
	}

	function getTaskEstimateValue() {
		const value = Number(app.el.taskEstimateInput.value);

		if (
			!Number.isFinite(value) ||
			!Number.isInteger(value) ||
			value < MIN_ESTIMATE ||
			value > MAX_ESTIMATE
		) {
			return null;
		}

		return value;
	}

	function setTaskFormError(message, field) {
		const { el } = app;

		el.taskTitleInput.removeAttribute("aria-invalid");
		el.taskEstimateInput.removeAttribute("aria-invalid");

		if (!message) {
			el.taskFormError.hidden = true;
			el.taskFormError.textContent = "";
			return;
		}

		el.taskFormError.hidden = false;
		el.taskFormError.textContent = message;

		if (field) {
			field.setAttribute("aria-invalid", "true");
			field.focus();
		}
	}

	function getTaskProgress(task) {
		const completed = Math.max(0, Number(task.completedPomodoros) || 0);
		const estimate = Math.max(MIN_ESTIMATE, Number(task.estimatedPomodoros) || 1);
		const percent = Math.min(100, Math.round((completed / estimate) * 100));

		return {
			completed,
			estimate,
			percent,
			isOverEstimate: completed > estimate,
		};
	}

	app.renderTaskList = function renderTaskList() {
		const { el, state } = app;
		const taskCount = state.tasks.length;

		el.taskList.innerHTML = "";
		el.taskCount.textContent = `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`;

		if (state.tasks.length === 0) {
			el.taskEmptyState.hidden = false;
			return;
		}

		el.taskEmptyState.hidden = true;

		getOrderedTasks().forEach((task) => {
			el.taskList.appendChild(createTaskItem(task));
		});
	};

	function createTaskItem(task) {
		const listItem = document.createElement("li");
		const progress = getTaskProgress(task);

		listItem.className = "task-item";
		listItem.classList.toggle("is-active", task.id === app.state.activeTaskId);
		listItem.classList.toggle("is-completed", task.completed);
		listItem.classList.toggle("is-over-estimate", progress.isOverEstimate);
		listItem.dataset.taskId = task.id;

		const icon = document.createElement("span");
		icon.className = "task-item-icon";
		icon.setAttribute("aria-hidden", "true");
		icon.innerHTML =
			'<svg viewBox="0 0 24 24" focusable="false"><path d="M8.7 16.3 4.4 12l4.3-4.3 1.4 1.4L7.2 12l2.9 2.9-1.4 1.4Zm6.6 0-1.4-1.4 2.9-2.9-2.9-2.9 1.4-1.4 4.3 4.3-4.3 4.3ZM12.8 6l1.9.6-3.5 11.4-1.9-.6L12.8 6Z"></path></svg>';
		listItem.appendChild(icon);
		listItem.appendChild(createTaskHeader(task));
		listItem.appendChild(createTaskMeta(task, progress));
		listItem.appendChild(createTaskProgress(task, progress));
		listItem.appendChild(createTaskActions(task));

		return listItem;
	}

	function createTaskHeader(task) {
		const top = document.createElement("div");
		top.className = "task-item-top";

		const title = document.createElement("span");
		title.className = "task-title" + (task.completed ? " is-strike" : "");
		title.textContent = task.title;
		top.appendChild(title);

		if (task.id === app.state.activeTaskId) {
			const badge = document.createElement("span");
			badge.className = "badge badge-active";
			badge.textContent = "Active";
			top.appendChild(badge);
		}

		if (task.completed) {
			const badge = document.createElement("span");
			badge.className = "badge badge-completed";
			badge.textContent = "Done";
			top.appendChild(badge);
		}

		return top;
	}

	function createTaskMeta(task, progress) {
		const meta = document.createElement("p");
		const category = document.createElement("span");
		const count = document.createElement("span");

		meta.className = "task-meta";
		category.className = "badge badge-category";
		category.textContent = task.category;
		count.className = "task-pomodoro-count";
		count.textContent = `${progress.completed} / ${progress.estimate} pomodoros`;

		meta.appendChild(category);
		meta.appendChild(count);

		return meta;
	}

	function createTaskProgress(task, progress) {
		const wrap = document.createElement("div");
		const bar = document.createElement("div");
		const fill = document.createElement("div");

		wrap.className = "task-progress";
		bar.className = "task-progress-track";
		bar.setAttribute("role", "progressbar");
		bar.setAttribute("aria-label", `${task.title} progress`);
		bar.setAttribute("aria-valuemin", "0");
		bar.setAttribute("aria-valuemax", String(progress.estimate));
		bar.setAttribute(
			"aria-valuenow",
			String(Math.min(progress.completed, progress.estimate)),
		);
		bar.setAttribute(
			"aria-valuetext",
			`${progress.completed} of ${progress.estimate} pomodoros complete`,
		);

		fill.className = "task-progress-fill";
		fill.style.width = `${progress.percent}%`;

		bar.appendChild(fill);
		wrap.appendChild(bar);

		return wrap;
	}

	function createTaskActions(task) {
		const actions = document.createElement("div");
		actions.className = "task-actions";

		actions.appendChild(createSetActiveButton(task));
		actions.appendChild(createCompleteButton(task));
		actions.appendChild(createDeleteButton(task));

		return actions;
	}

	function createSetActiveButton(task) {
		const button = document.createElement("button");
		const isActive = task.id === app.state.activeTaskId;

		button.className = "btn btn-secondary btn-small";
		button.type = "button";
		button.innerHTML =
			'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13a.9.9 0 0 0 1.42.74l9.1-6.5a.9.9 0 0 0 0-1.48l-9.1-6.5A.9.9 0 0 0 8 5.5Z"></path></svg>' +
			(isActive ? "Active" : "Set Active");
		button.disabled = isActive || task.completed;
		button.setAttribute(
			"aria-label",
			isActive ? `"${task.title}" is the active task` : `Set "${task.title}" as active task`,
		);
		button.addEventListener("click", () => setActiveTask(task.id));

		return button;
	}

	function createCompleteButton(task) {
		const button = document.createElement("button");
		button.className = "btn btn-ghost btn-small";
		button.type = "button";
		button.innerHTML =
			'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.6 16.6 4.9 11.9l1.4-1.4 3.3 3.3 8.1-8.1 1.4 1.4-9.5 9.5Z"></path></svg>' +
			`<span class="visually-hidden">${task.completed ? "Undo" : "Complete"}</span>`;
		button.setAttribute(
			"aria-label",
			`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`,
		);
		button.addEventListener("click", () => toggleTaskComplete(task.id));

		return button;
	}

	function createDeleteButton(task) {
		const button = document.createElement("button");
		button.className = "btn btn-danger btn-small";
		button.type = "button";
		button.innerHTML =
			'<svg class="task-delete-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M6 7L7 20C7.08 21.13 7.94 22 9 22H15C16.06 22 16.92 21.13 17 20L18 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 7V4C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="visually-hidden">Delete</span>';
		button.setAttribute("aria-label", `Delete task "${task.title}"`);
		button.addEventListener("click", () => deleteTask(task.id));

		return button;
	}

	function setActiveTask(taskId) {
		const task = app.state.tasks.find((item) => item.id === taskId);

		if (!task || task.completed) return;

		app.state.activeTaskId = task.id;
		app.persistActiveTask();
		app.renderTaskList();
		app.renderActiveTaskLine();
		app.showToast("Active task updated.");
	}

	function toggleTaskComplete(taskId) {
		const task = app.state.tasks.find((item) => item.id === taskId);
		if (!task) return;

		task.completed = !task.completed;

		if (task.completed && app.state.activeTaskId === taskId) {
			app.state.activeTaskId = null;
			app.persistActiveTask();
			app.renderActiveTaskLine();
		}

		app.persistTasks();
		app.renderTaskList();
		app.showToast(task.completed ? "Task completed." : "Task marked incomplete.");
	}

	function deleteTask(taskId) {
		const task = app.state.tasks.find((item) => item.id === taskId);
		if (!task) return;

		const confirmed = window.confirm(`Delete "${task.title}"?`);
		if (!confirmed) return;

		app.state.tasks = app.state.tasks.filter((item) => item.id !== taskId);

		if (app.state.activeTaskId === taskId) {
			app.state.activeTaskId = null;
			app.persistActiveTask();
			app.renderActiveTaskLine();
		}

		app.persistTasks();
		app.renderTaskList();
		app.renderStats();
		app.showToast("Task deleted.");
	}

	function handleTaskSubmit(event) {
		const { el, state } = app;
		event.preventDefault();

		const title = normalizeTaskTitle(el.taskTitleInput.value);
		const duplicateTask = state.tasks.find(
			(task) => !task.completed && task.title.toLowerCase() === title.toLowerCase(),
		);

		if (!title) {
			setTaskFormError("Enter a task title.", el.taskTitleInput);
			return;
		}

		if (title.length > MAX_TITLE_LENGTH) {
			setTaskFormError(
				`Keep the task title under ${MAX_TITLE_LENGTH} characters.`,
				el.taskTitleInput,
			);
			return;
		}

		if (duplicateTask) {
			setTaskFormError("That task already exists in your active list.", el.taskTitleInput);
			return;
		}

		const category = app.CATEGORIES.includes(el.taskCategoryInput.value)
			? el.taskCategoryInput.value
			: "Coding";
		const estimatedPomodoros = getTaskEstimateValue();

		if (estimatedPomodoros === null) {
			setTaskFormError("Estimated pomodoros must be a whole number from 1 to 20.", el.taskEstimateInput);
			return;
		}

		const newTask = {
			id: app.uid(),
			title,
			category,
			estimatedPomodoros,
			completedPomodoros: 0,
			completed: false,
			createdAt: new Date().toISOString(),
		};

		setTaskFormError("");
		state.tasks.push(newTask);
		app.persistTasks();

		if (!state.activeTaskId) {
			state.activeTaskId = newTask.id;
			app.persistActiveTask();
			app.renderActiveTaskLine();
		}

		app.renderTaskList();
		app.renderStats();
		app.showToast("Task added successfully.");
		resetTaskForm(category);
	}

	function resetTaskForm(category) {
		const { el } = app;

		el.taskForm.reset();
		el.taskCategoryInput.value = app.CATEGORIES.includes(category)
			? category
			: "Coding";
		el.taskEstimateInput.value = "4";
		el.taskTitleInput.focus();
	}

	app.initTasks = function initTasks() {
		const { el } = app;

		el.taskForm.addEventListener("submit", handleTaskSubmit);
		el.taskTitleInput.addEventListener("input", () => setTaskFormError(""));
		el.taskEstimateInput.addEventListener("input", () => setTaskFormError(""));
	};
})(window.FocusFlow = window.FocusFlow || {});
