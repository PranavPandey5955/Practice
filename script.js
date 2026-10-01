const form = document.getElementById("form");
const input = document.getElementById("newTask");
const list = document.getElementById("list");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clear");
const filterBtns = document.querySelectorAll("[data-filter]");
const KEY = "todo-tasks-v1";

let tasks = load();
let filter = "all";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {}
}

const checkSvg = '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>';
const editSvg = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
const delSvg = '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

function render() {
  const visible = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done);

  list.innerHTML = "";
  if (!visible.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = tasks.length
      ? "Nothing in this view."
      : "No tasks yet. Add your first one above.";
    list.appendChild(li);
  }

  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = "task";
    li.dataset.id = t.id;
    li.innerHTML =
      '<label><input type="checkbox"' + (t.done ? " checked" : "") + '>' +
      '<span class="box">' + checkSvg + '</span><span class="text"></span></label>' +
      '<button class="icon edit-btn" type="button" aria-label="Edit task">' + editSvg + '</button>' +
      '<button class="icon del" type="button" aria-label="Delete task">' + delSvg + '</button>';
    li.querySelector(".text").textContent = t.text;
    list.appendChild(li);
  });

  const left = tasks.filter(t => !t.done).length;
  count.textContent = tasks.length ? left + " left of " + tasks.length : "";
  clearBtn.hidden = !tasks.some(t => t.done);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text, done: false });
  input.value = "";
  save(); render();
});

list.addEventListener("change", e => {
  if (e.target.type !== "checkbox") return;
  const t = tasks.find(x => x.id === e.target.closest("li").dataset.id);
  if (t) { t.done = e.target.checked; save(); render(); }
});

list.addEventListener("click", e => {
  const li = e.target.closest("li.task");
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.closest(".del")) {
    tasks = tasks.filter(x => x.id !== id);
    save(); render();
  } else if (e.target.closest(".edit-btn")) {
    startEdit(li, id);
  }
});

function startEdit(li, id) {
  const t = tasks.find(x => x.id === id);
  const field = document.createElement("input");
  field.className = "edit";
  field.value = t.text;
  field.maxLength = 200;
  field.setAttribute("aria-label", "Edit task text");
  li.querySelector("label").replaceWith(field);
  field.focus();
  field.select();
  let finished = false;
  const finish = commit => {
    if (finished) return;
    finished = true;
    const v = field.value.trim();
    if (commit && v) t.text = v;
    save(); render();
  };
  field.addEventListener("keydown", e => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  field.addEventListener("blur", () => finish(true));
}

filterBtns.forEach(btn => btn.addEventListener("click", () => {
  filter = btn.dataset.filter;
  filterBtns.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
  render();
}));

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});

render();
