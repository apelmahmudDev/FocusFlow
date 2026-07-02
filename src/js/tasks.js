(function (app) {
	"use strict";

	app.renderTaskList = function renderTaskList() {
		const { el, state } = app;
		el.taskList.innerHTML = "";

		if (state.tasks.length === 0) {
			el.taskEmptyState.hidden = false;
			return;
		}

		el.taskEmptyState.hidden = true;

		state.tasks.forEach((task) => {
			el.taskList.appendChild(createTaskItem(task));
		});
	};

	function createTaskItem(task) {
		const listItem = document.createElement("li");
		listItem.className = "task-item";
		listItem.classList.toggle("is-active", task.id === app.state.activeTaskId);
		listItem.classList.toggle("is-completed", task.completed);

		const icon = document.createElement("span");
		icon.className = "task-item-icon";
		icon.setAttribute("aria-hidden", "true");
		icon.innerHTML =
			'<svg viewBox="0 0 24 24" focusable="false"><path d="M8.7 16.3 4.4 12l4.3-4.3 1.4 1.4L7.2 12l2.9 2.9-1.4 1.4Zm6.6 0-1.4-1.4 2.9-2.9-2.9-2.9 1.4-1.4 4.3 4.3-4.3 4.3ZM12.8 6l1.9.6-3.5 11.4-1.9-.6L12.8 6Z"></path></svg>';
		listItem.appendChild(icon);
		listItem.appendChild(createTaskHeader(task));
		listItem.appendChild(createTaskMeta(task));
		listItem.appendChild(createTaskActions(task));

		return listItem;
	}

	function createTaskHeader(task) {
		const top = document.createElement("div");
		top.className = "task-item-top";

		const title = document.createElement("span");
		title.className = "task-title" + (task.completed ? " is-strike" : "");
		title.textContent = (task.completed ? "Done: " : "") + task.title;
		top.appendChild(title);

		if (task.id === app.state.activeTaskId) {
			const badge = document.createElement("span");
			badge.className = "badge badge-active";
			badge.textContent = "Active";
			top.appendChild(badge);
		}

		return top;
	}

	function createTaskMeta(task) {
		const meta = document.createElement("p");
		const category = document.createElement("span");

		meta.className = "task-meta";
		category.className = "badge badge-category";
		category.textContent = task.category;

		meta.appendChild(category);
		meta.appendChild(
			document.createTextNode(
				` - ${task.completedPomodoros} / ${task.estimatedPomodoros} pomodoros`,
			),
		);

		return meta;
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
		button.className = "btn btn-secondary btn-small";
		button.innerHTML =
			'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13a.9.9 0 0 0 1.42.74l9.1-6.5a.9.9 0 0 0 0-1.48l-9.1-6.5A.9.9 0 0 0 8 5.5Z"></path></svg>' +
			(task.id === app.state.activeTaskId ? "Active" : "Set Active");
		button.disabled = task.id === app.state.activeTaskId || task.completed;
		button.setAttribute("aria-label", `Set "${task.title}" as active task`);
		button.addEventListener("click", () => setActiveTask(task.id));

		return button;
	}

	function createCompleteButton(task) {
		const button = document.createElement("button");
		button.className = "btn btn-ghost btn-small";
		button.innerHTML =
			'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.6 16.6 4.9 11.9l1.4-1.4 3.3 3.3 8.1-8.1 1.4 1.4-9.5 9.5Z"></path></svg>' +
			(task.completed ? "Undo" : "Complete");
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
		button.innerHTML =
			'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 9h2v9H8V9Zm6 0h2v9h-2V9ZM5 6h14v2H5V6Zm3-3h8v2H8V3Zm-1 6h2v11h6V9h2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9Z"></path></svg>Delete';
		button.setAttribute("aria-label", `Delete task "${task.title}"`);
		button.addEventListener("click", () => deleteTask(task.id));

		return button;
	}

	function setActiveTask(taskId) {
		app.state.activeTaskId = taskId;
		app.persistActiveTask();
		app.renderTaskList();
		app.renderActiveTaskLine();
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
		app.state.tasks = app.state.tasks.filter((task) => task.id !== taskId);

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

		const title = el.taskTitleInput.value.trim();
		if (!title) return;

		const category = el.taskCategoryInput.value;
		const estimatedPomodoros = Math.max(
			1,
			parseInt(el.taskEstimateInput.value, 10) || 1,
		);

		const newTask = {
			id: app.uid(),
			title,
			category,
			estimatedPomodoros,
			completedPomodoros: 0,
			completed: false,
			createdAt: new Date().toISOString(),
		};

		state.tasks.push(newTask);
		app.persistTasks();

		if (!state.activeTaskId) {
			setActiveTask(newTask.id);
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
		app.el.taskForm.addEventListener("submit", handleTaskSubmit);
	};
})(window.FocusFlow = window.FocusFlow || {});
