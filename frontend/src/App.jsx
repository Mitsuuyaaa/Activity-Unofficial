import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/todos/");
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!title.trim()) return;
    const newTodo = { title, description, completed: false };
    setTodos(prev => [...prev, { ...newTodo, id: Date.now() }]);
    setTitle("");
    setDescription("");
    try {
      await axios.post("/api/todos/", newTodo);
      fetchTodos();
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Failed to add task.");
      fetchTodos();
    }
  };

  const toggleTodo = async (todo) => {
    const updated = { ...todo, completed: !todo.completed };
    setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));
    try {
      await axios.put(`/api/todos/${todo.id}/`, updated);
    } catch (err) {
      console.error("Error toggling todo:", err);
      setError("Failed to update task.");
      fetchTodos();
    }
  };

  const deleteTodo = async (id) => {
    const original = [...todos];
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await axios.delete(`/api/todos/${id}/`);
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete task.");
      setTodos(original);
    }
  };

  // Start editing a todo
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  // Save edited todo
  const saveEdit = async (todo) => {
    if (!editTitle.trim()) return;
    const updated = { ...todo, title: editTitle, description: editDescription };
    setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));
    setEditingId(null);
    try {
      await axios.put(`/api/todos/${todo.id}/`, updated);
    } catch (err) {
      console.error("Error saving edit:", err);
      setError("Failed to save changes.");
      fetchTodos();
    }
  };

  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const remaining = total - done;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f0e0c] font-mono flex items-start justify-center px-5 py-16">
      <div className="w-full max-w-xl">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber-400 mb-2">
            Task Manager
          </p>
          <h1
            className="text-5xl font-bold text-[#f0ead8] leading-tight tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            My <em className="text-amber-400 italic">Tasks</em>
          </h1>
          <p className="mt-2 text-[11px] text-[#8a7f6e] tracking-wide">
            Stay focused. Do the work.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div className="flex gap-6 py-4 border-t border-b border-[#2e2a24] mb-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-medium text-[#f0ead8]">{total}</span>
            <span className="text-[9px] tracking-widest uppercase text-[#8a7f6e]">Total</span>
          </div>
          <div className="w-px bg-[#2e2a24] self-stretch" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-medium text-[#f0ead8]">{remaining}</span>
            <span className="text-[9px] tracking-widest uppercase text-[#8a7f6e]">Remaining</span>
          </div>
          <div className="w-px bg-[#2e2a24] self-stretch" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-medium text-[#f0ead8]">{done}</span>
            <span className="text-[9px] tracking-widest uppercase text-[#8a7f6e]">Done</span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-0.5 bg-[#2e2a24] rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="px-4 py-3 mb-5 text-[11px] text-red-400 bg-red-950/30 border border-red-800/40 rounded">
            ⚠ {error}
          </div>
        )}

        {/* ── Add Form ── */}
        <div className="flex flex-col gap-2.5 mb-8">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTodo()}
              placeholder="New task title..."
              className="flex-1 bg-[#1a1815] border border-[#2e2a24] rounded px-4 py-3 text-xs text-[#f0ead8] font-mono placeholder-[#4a4237] outline-none focus:border-amber-700 transition-colors"
            />
            <button
              onClick={addTodo}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#0f0e0c] text-[10px] font-medium tracking-widest uppercase px-5 py-3 rounded cursor-pointer transition-all whitespace-nowrap"
            >
              + Add
            </button>
          </div>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="Description (optional)"
            className="w-full bg-[#1a1815] border border-[#2e2a24] rounded px-4 py-3 text-xs text-[#f0ead8] font-mono placeholder-[#4a4237] outline-none focus:border-amber-700 transition-colors"
          />
        </div>

        {/* ── Task list ── */}
        {loading ? (
          <div className="flex items-center gap-2 text-[11px] text-[#8a7f6e] tracking-wide">
            <span className="text-amber-400 animate-pulse">●</span>
            Loading tasks...
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3 text-[#4a4237]">✦</p>
            <p
              className="text-[#4a4237] text-base italic"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Nothing here yet.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#4a4237] mb-2.5 pb-2 border-b border-[#2e2a24]">
              Tasks
            </p>
            <ul className="flex flex-col gap-0.5 p-0 list-none">
              {todos.map((todo, i) => (
                <li
                  key={todo.id}
                  onMouseEnter={() => setHoveredId(todo.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex items-start gap-3 px-2.5 py-3.5 rounded transition-all duration-150 ${
                    hoveredId === todo.id ? "bg-[#1a1815]" : "bg-transparent"
                  } ${todo.completed && editingId !== todo.id ? "opacity-50" : "opacity-100"}`}
                >
                  {/* Number */}
                  <span className="text-[9px] text-[#4a4237] flex-shrink-0 mt-0.5 w-5 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Checkbox — hidden while editing */}
                  {editingId !== todo.id && (
                    <div
                      onClick={() => toggleTodo(todo)}
                      className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-sm border flex items-center justify-center cursor-pointer transition-all ${
                        todo.completed
                          ? "bg-[#5a7a52] border-[#5a7a52]"
                          : "border-[#2e2a24] hover:border-amber-700"
                      }`}
                    >
                      {todo.completed && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none"
                          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Content — edit mode or display mode */}
                  {editingId === todo.id ? (
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveEdit(todo);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="w-full bg-[#0f0e0c] border border-amber-700 rounded px-3 py-1.5 text-xs text-[#f0ead8] font-mono outline-none"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveEdit(todo);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        placeholder="Description (optional)"
                        className="w-full bg-[#0f0e0c] border border-[#2e2a24] rounded px-3 py-1.5 text-xs text-[#8a7f6e] font-mono outline-none focus:border-amber-700 transition-colors"
                      />
                      <div className="flex gap-2 mt-0.5">
                        <button
                          onClick={() => saveEdit(todo)}
                          className="text-[9px] tracking-widest uppercase px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#0f0e0c] font-medium rounded cursor-pointer transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-[9px] tracking-widest uppercase px-3 py-1.5 bg-transparent border border-[#2e2a24] hover:border-[#4a4237] text-[#8a7f6e] rounded cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 cursor-pointer min-w-0" onClick={() => toggleTodo(todo)}>
                      <p className={`text-[13px] leading-snug ${
                        todo.completed ? "line-through text-[#8a7f6e]" : "text-[#f0ead8]"
                      }`}>
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className={`mt-1 text-[11px] leading-relaxed ${
                          todo.completed ? "line-through text-[#4a4237]" : "text-[#8a7f6e]"
                        }`}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action buttons — edit & delete */}
                  {editingId !== todo.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(todo)}
                        className="bg-transparent border-none text-[#4a4237] hover:text-amber-400 text-xs px-1 cursor-pointer transition-colors"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="bg-transparent border-none text-[#4a4237] hover:text-red-500 text-lg leading-none px-1 cursor-pointer transition-colors"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

      </div>
    </div>
  );
}

export default App;