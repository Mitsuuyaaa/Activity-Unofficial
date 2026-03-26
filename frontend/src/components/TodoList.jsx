import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!title.trim()) return;
    const newTask = { title, description, completed: false };
    setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
    setTitle('');
    setDescription('');
    try {
      await axios.post('/api/tasks/', newTask);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task.');
      fetchTasks();
    }
  };

  const toggleTask = async (task) => {
    const updated = { ...task, completed: !task.completed };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    try {
      await axios.put(`/api/tasks/${task.id}/`, updated);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task.');
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    const original = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await axios.delete(`/api/tasks/${id}/`);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
      setTasks(original);
    }
  };

  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
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
          <h1 className="text-5xl font-bold text-[#f0ead8] leading-tight tracking-tight font-playfair">
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

        {/* ── Form ── */}
        <div className="flex flex-col gap-2.5 mb-8">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createTask()}
              placeholder="New task title..."
              className="flex-1 bg-[#1a1815] border border-[#2e2a24] rounded px-4 py-3 text-xs text-[#f0ead8] font-mono placeholder-[#4a4237] outline-none focus:border-amber-700 transition-colors"
            />
            <button
              onClick={createTask}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#0f0e0c] text-[10px] font-medium tracking-widest uppercase px-5 py-3 rounded cursor-pointer transition-all whitespace-nowrap"
            >
              + Add
            </button>
          </div>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTask()}
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
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3 text-[#4a4237]">✦</p>
            <p className="text-[#4a4237] text-base italic font-playfair">
              Nothing here yet.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#4a4237] mb-2.5 pb-2 border-b border-[#2e2a24]">
              Tasks
            </p>
            <ul className="flex flex-col gap-0.5 p-0 list-none">
              {tasks.map((task, i) => (
                <li
                  key={task.id}
                  onMouseEnter={() => setHoveredId(task.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex items-start gap-3 px-2.5 py-3.5 rounded transition-all duration-150 ${
                    hoveredId === task.id ? 'bg-[#1a1815]' : 'bg-transparent'
                  } ${task.completed ? 'opacity-50' : 'opacity-100'}`}
                >
                  {/* Number */}
                  <span className="text-[9px] text-[#4a4237] flex-shrink-0 mt-0.5 w-5 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Checkbox */}
                  <div
                    onClick={() => toggleTask(task)}
                    className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-sm border flex items-center justify-center cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-[#5a7a52] border-[#5a7a52]'
                        : 'border-[#2e2a24] hover:border-amber-700'
                    }`}
                  >
                    {task.completed && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"
                        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 cursor-pointer min-w-0" onClick={() => toggleTask(task)}>
                    <p className={`text-[13px] leading-snug ${
                      task.completed ? 'line-through text-[#8a7f6e]' : 'text-[#f0ead8]'
                    }`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className={`mt-1 text-[11px] leading-relaxed ${
                        task.completed ? 'line-through text-[#4a4237]' : 'text-[#8a7f6e]'
                      }`}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 bg-transparent border-none text-[#4a4237] hover:text-red-500 text-lg leading-none px-1 cursor-pointer transition-colors"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

      </div>
    </div>
  );
}

export default TodoList;