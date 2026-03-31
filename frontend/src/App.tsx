import { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: "alta" | "media" | "baja";
  due_date: string | null;
}

type Filter = "todas" | "pendientes" | "completadas";

const API = "http://127.0.0.1:8000";

const PRIORITY_CONFIG = {
  alta:  { label: "Alta",  color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  media: { label: "Media", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  baja:  { label: "Baja",  color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"alta" | "media" | "baja">("media");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    const res = await fetch(`${API}/todos`);
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  };

  const createTodo = async () => {
    if (!newTitle.trim()) return;
    await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        priority: newPriority,
        due_date: newDueDate || null,
      }),
    });
    setNewTitle("");
    setNewDueDate("");
    setNewPriority("media");
    fetchTodos();
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    await fetch(`${API}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    fetchTodos();
  };

  const deleteTodo = async (id: number) => {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  const saveEdit = async (id: number) => {
    if (!editingText.trim()) return;
    await fetch(`${API}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingText }),
    });
    setEditingId(null);
    fetchTodos();
  };

  const isOverdue = (due_date: string | null, completed: boolean) => {
    if (!due_date || completed) return false;
    return new Date(due_date) < new Date(new Date().toDateString());
  };

  const filtered = todos.filter((t) => {
    if (filter === "pendientes") return !t.completed;
    if (filter === "completadas") return t.completed;
    return true;
  });

  const pending = todos.filter((t) => !t.completed).length;
  const overdue = todos.filter((t) => isOverdue(t.due_date, t.completed)).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#51516959",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "48px 16px",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#ebebeb",
          }}>
            📝 Mis Tareas
          </h1>
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: "#888" }}>
              {pending} pendiente{pending !== 1 ? "s" : ""}
            </span>
            {overdue > 0 && (
              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                ⚠️ {overdue} vencida{overdue !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          boxShadow: "0 2px 12px rgb(233, 228, 228)",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTodo()}
              placeholder="Nueva tarea..."
              style={{
                flex: 1, padding: "10px 14px", fontSize: 15,
                borderRadius: 10, border: "1.5px solid #e8e8f0",
                outline: "none", color: "#e4e4e9ab",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e8e8f0")}
            />
            <button
              onClick={createTodo}
              style={{
                padding: "10px 18px", fontSize: 20, borderRadius: 10,
                background: "#1a1a2e", color: "white",
                border: "none", cursor: "pointer", fontWeight: 700,
              }}
            >+</button>
          </div>

          {/* Prioridad y fecha */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["alta", "media", "baja"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                style={{
                  flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600,
                  borderRadius: 8, cursor: "pointer",
                  border: `1.5px solid ${newPriority === p ? PRIORITY_CONFIG[p].color : "#e8e8f0"}`,
                  background: newPriority === p ? PRIORITY_CONFIG[p].bg : "white",
                  color: newPriority === p ? PRIORITY_CONFIG[p].color : "#aaa",
                  transition: "all 0.15s",
                }}
              >
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              style={{
                flex: 1.5, padding: "6px 10px", fontSize: 12,
                borderRadius: 8, border: "1.5px solid #e8e8f0",
                outline: "none", color: "#555", cursor: "pointer",
              }}
            />
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 16,
          background: "white", borderRadius: 12, padding: 4,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {(["todas", "pendientes", "completadas"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1, padding: "8px 0", fontSize: 13, fontWeight: 600,
                borderRadius: 9, border: "none", cursor: "pointer",
                background: filter === f ? "#1a1a2e" : "transparent",
                color: filter === f ? "white" : "#888",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading && (
          <p style={{ textAlign: "center", color: "#aaa" }}>Cargando...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <p style={{ margin: 0, fontSize: 14 }}>
              {filter === "completadas" ? "Aún no has completado tareas." :
               filter === "pendientes" ? "¡No tienes tareas pendientes!" :
               "Agrega tu primera tarea arriba."}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((todo) => {
            const p = PRIORITY_CONFIG[todo.priority] ?? PRIORITY_CONFIG.media;
            const overdueTodo = isOverdue(todo.due_date, todo.completed);
            const isEditing = editingId === todo.id;

            return (
              <div key={todo.id} style={{
                background: "white",
                borderRadius: 14,
                padding: "14px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${todo.completed ? "#d1d5db" : p.color}`,
                opacity: todo.completed ? 0.7 : 1,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                  {/* Checkbox */}
                  <div
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${todo.completed ? "#22c55e" : "#d1d5db"}`,
                      background: todo.completed ? "#22c55e" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 12, color: "white", fontWeight: 700,
                      transition: "all 0.2s",
                    }}
                  >
                    {todo.completed ? "✓" : ""}
                  </div>

                  {/* Título o input de edición */}
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => saveEdit(todo.id)}
                      style={{
                        flex: 1, fontSize: 14, padding: "4px 8px",
                        borderRadius: 6, border: "1.5px solid #667eea",
                        outline: "none", color: "#1a1a2e",
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setEditingId(todo.id);
                        setEditingText(todo.title);
                      }}
                      style={{
                        flex: 1, fontSize: 14, color: "#1a1a2e",
                        textDecoration: todo.completed ? "line-through" : "none",
                        cursor: "text",
                      }}
                      title="Doble click para editar"
                    >
                      {todo.title}
                    </span>
                  )}

                  {/* Badge prioridad */}
                  {!todo.completed && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 20, background: p.bg,
                      color: p.color, border: `1px solid ${p.border}`,
                      flexShrink: 0,
                    }}>
                      {p.label}
                    </span>
                  )}

                  {/* Botón eliminar */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 14, color: "#d1d5db", padding: "2px 4px",
                      borderRadius: 6, transition: "color 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
                  >
                    🗑️
                  </button>
                </div>

                {/* Fecha límite */}
                {todo.due_date && (
                  <div style={{
                    marginTop: 8, marginLeft: 32, fontSize: 12,
                    color: overdueTodo ? "#ef4444" : "#aaa",
                    fontWeight: overdueTodo ? 600 : 400,
                  }}>
                    {overdueTodo ? "⚠️ Venció el " : "📅 "}
                    {new Date(todo.due_date + "T12:00:00").toLocaleDateString("es-CO", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div style={{
            marginTop: 20, display: "flex", justifyContent: "space-between",
            fontSize: 12, color: "#bbb", padding: "0 4px",
          }}>
            <span>{todos.filter(t => t.completed).length} completadas</span>
            <span>Doble click en una tarea para editarla</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;