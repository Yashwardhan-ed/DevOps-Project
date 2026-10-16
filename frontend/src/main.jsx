import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CYCLE = { OPEN: 'IN_PROGRESS', IN_PROGRESS: 'RESOLVED', RESOLVED: 'CLOSED', CLOSED: 'OPEN' };
const STATUS_LABELS = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const PRIORITY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`stat stat--${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>Live count</span>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  return <span className={`priority priority--${priority.toLowerCase()}`}>{priority}</span>;
}

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  return <span className={`status status--${status.toLowerCase().replace('_', '-')}`}>{label}</span>;
}

function ActivityItem({ icon, text, time }) {
  return (
    <div className="activity-row">
      <span className="activity-icon">{icon}</span>
      <div>
        <b>{text}</b>
        <small>{time}</small>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const [a, b] = await Promise.all([
        fetch(`${API}/tickets`),
        fetch(`${API}/tickets/stats`),
      ]);
      if (!a.ok || !b.ok) throw new Error('Backend unavailable');
      setTickets(await a.json());
      setStats(await b.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  const advanceStatus = async (ticket) => {
    const nextStatus = STATUS_CYCLE[ticket.status] || 'OPEN';
    await fetch(`${API}/tickets/${ticket.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  };

  const createTicket = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await fetch(`${API}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: f.get('title'),
        description: f.get('description'),
        priority: f.get('priority'),
        assignee: f.get('assignee'),
        status: 'OPEN',
      }),
    });
    e.currentTarget.reset();
    setShowForm(false);
    load();
  };

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <b>Helpdesk</b>
            <small>DevOps Capstone</small>
          </div>
        </div>
        <nav>
          <a className="active">▦ <span>Dashboard</span></a>
          <a>✉ <span>My Tickets</span></a>
          <a>◫ <span>Teams</span></a>
          <a>◌ <span>Reports</span></a>
        </nav>
        <div className="side-bottom">
          <div className="upgrade">
            <strong>Support excellence.</strong>
            <p>Track, resolve and monitor every support ticket end-to-end.</p>
          </div>
          <div className="profile">
            <div className="avatar">HD</div>
            <div>
              <b>Helpdesk Admin</b>
              <small>Administrator</small>
            </div>
            <span>⋮</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        <header>
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Good morning, Admin 👋</h1>
            <p className="muted">Here's your support queue for today.</p>
          </div>
          <button className="primary" onClick={() => setShowForm(true)}>＋ New Ticket</button>
        </header>

        {error && (
          <div className="alert">
            ⚠ {error}. Start the backend and PostgreSQL, then refresh.
          </div>
        )}

        {/* ── KPI Cards ── */}
        <section className="stats">
          <StatCard label="Total Tickets" value={stats.total} icon="▦" accent="default" />
          <StatCard label="Open" value={stats.open} icon="○" accent="open" />
          <StatCard label="In Progress" value={stats.inProgress} icon="◔" accent="progress" />
          <StatCard label="Resolved" value={stats.resolved} icon="✓" accent="resolved" />
        </section>

        {/* ── Ticket Table + Activity ── */}
        <section className="content-grid">
          <div className="panel tasks-panel">
            <div className="panel-head">
              <div>
                <h2>Support Tickets</h2>
                <p className="muted">All incoming and in-flight support requests.</p>
              </div>
              <div className="filters">
                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(x => (
                  <button
                    key={x}
                    className={filter === x ? 'selected' : ''}
                    onClick={() => setFilter(x)}
                  >
                    {x === 'ALL' ? 'All' : STATUS_LABELS[x] || x}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="empty">Loading tickets…</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(t => (
                      <tr key={t.id}>
                        <td>
                          <div className="task-title">
                            <span className={`dot dot--${t.status.toLowerCase().replace('_', '-')}`} />
                            <div>
                              <b>#{t.id} — {t.title}</b>
                              <small>{t.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>{t.assignee}</td>
                        <td><PriorityBadge priority={t.priority} /></td>
                        <td><StatusBadge status={t.status} /></td>
                        <td>
                          <button
                            className="icon-btn"
                            onClick={() => advanceStatus(t)}
                            title="Advance status"
                          >
                            ↻
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && <div className="empty">No tickets in this filter.</div>}
              </div>
            )}
          </div>

          {/* ── Activity Panel ── */}
          <aside className="panel activity">
            <div className="panel-head">
              <div>
                <h2>Recent Activity</h2>
                <p className="muted">Latest helpdesk events.</p>
              </div>
            </div>
            <ActivityItem icon="✓" text="Ticket #3 resolved" time="12 min ago" />
            <ActivityItem icon="◔" text="Ticket #7 assigned to Senior Engineer" time="38 min ago" />
            <ActivityItem icon="＋" text="New critical ticket opened" time="1 hr ago" />
            <ActivityItem icon="↗" text="CI/CD pipeline deployed successfully" time="2 hrs ago" />
            <div className="pipeline">
              <span>CI</span><i></i>
              <span>Build</span><i></i>
              <span>Scan</span><i></i>
              <span>Deploy</span>
            </div>
          </aside>
        </section>

        {/* ── Create Ticket Modal ── */}
        {showForm && (
          <div className="modal-backdrop">
            <form className="modal" onSubmit={createTicket}>
              <div className="modal-head">
                <div>
                  <p className="eyebrow">CREATE TICKET</p>
                  <h2>Open a new support ticket</h2>
                </div>
                <button type="button" className="close" onClick={() => setShowForm(false)}>×</button>
              </div>

              <label>
                Ticket title
                <input name="title" required placeholder="e.g. Users cannot reset password" />
              </label>

              <label>
                Description
                <textarea name="description" placeholder="Describe the issue in detail…" />
              </label>

              <div className="form-row">
                <label>
                  Priority
                  <select name="priority">
                    {PRIORITY_ORDER.map(p => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label>
                  Assignee
                  <input name="assignee" defaultValue="Support Agent" />
                </label>
              </div>

              <button className="primary full">Open Ticket</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
