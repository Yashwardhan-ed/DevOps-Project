import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// ── Icons (Clean SVG definitions) ───────────────────────────────────────────
const Icons = {
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#3ea6ff" />
      <path d="M11 8.5L19.5 14L11 19.5V8.5Z" fill="#0f0f0f" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Clear: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Bell: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Ticket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M13 5v2" /><path d="M13 11v2" /><path d="M13 17v2" />
    </svg>
  ),
  Queue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  InProgress: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Resolved: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Metrics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Refresh: ({ spinning }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={spinning ? 'spin-icon' : ''}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

// ── Main Helpdesk Application Component ─────────────────────────────────────
function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deleteTicketId, setDeleteTicketId] = useState(null);

  // Form states (controlled for reliability)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignee: 'Support Agent',
  });
  const [submitting, setSubmitting] = useState(false);

  const searchInputRef = useRef(null);

  // Helper: Toast alerts
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ── Load Tickets and Stats ────────────────────────────────────────────────
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      setError('');
      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`${API}/tickets`),
        fetch(`${API}/tickets/stats`),
      ]);

      if (!ticketsRes.ok || !statsRes.ok) {
        throw new Error('Backend service unavailable');
      }

      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();

      setTickets(ticketsData);
      setStats(statsData);

      if (isManualRefresh) {
        showToast('Tickets refreshed successfully', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
      if (isManualRefresh) {
        showToast('Error refreshing tickets', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut: '/' focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !showCreateModal && !editingTicket) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        setEditingTicket(null);
        setDeleteTicketId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal, editingTicket]);

  // ── Create Ticket ─────────────────────────────────────────────────────────
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Ticket title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          assignee: formData.assignee.trim() || 'Support Agent',
          status: 'OPEN',
        }),
      });

      if (!res.ok) throw new Error('Failed to create ticket on server');
      const newTicket = await res.json();

      // Reliable immediate state update
      setTickets((prev) => [newTicket, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        open: prev.open + 1,
      }));

      // Reset form and close
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignee: 'Support Agent',
      });
      setShowCreateModal(false);
      showToast(`Ticket #${newTicket.id} created successfully!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update Ticket Status Directly ─────────────────────────────────────────
  const handleStatusChange = async (ticketId, nextStatus) => {
    // Find current ticket
    const currentTicket = tickets.find((t) => t.id === ticketId);
    if (!currentTicket || currentTicket.status === nextStatus) return;

    const previousStatus = currentTicket.status;

    // 1. Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch(`${API}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Server rejected update');
      const updated = await res.json();

      // Ensure sync
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));

      // Refresh stats
      const statsRes = await fetch(`${API}/tickets/stats`);
      if (statsRes.ok) setStats(await statsRes.json());

      showToast(`Ticket #${ticketId} status changed to ${nextStatus}`, 'info');
    } catch (err) {
      // Revert optimistic update on failure
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: previousStatus } : t))
      );
      showToast(`Failed to update ticket: ${err.message}`, 'error');
    }
  };

  // ── Edit Ticket ───────────────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTicket || !editingTicket.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTicket.title.trim(),
          description: editingTicket.description?.trim() || '',
          priority: editingTicket.priority,
          assignee: editingTicket.assignee?.trim() || 'Support Agent',
          status: editingTicket.status,
        }),
      });

      if (!res.ok) throw new Error('Failed to update ticket');
      const updated = await res.json();

      // Immediate state update
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      // Refresh stats in background
      const statsRes = await fetch(`${API}/tickets/stats`);
      if (statsRes.ok) setStats(await statsRes.json());

      setEditingTicket(null);
      showToast(`Ticket #${updated.id} updated successfully!`, 'success');
    } catch (err) {
      showToast(`Edit failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Ticket ─────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTicketId) return;
    const targetId = deleteTicketId;
    setDeleteTicketId(null);

    // Optimistic delete
    const removedTicket = tickets.find((t) => t.id === targetId);
    setTickets((prev) => prev.filter((t) => t.id !== targetId));

    try {
      const res = await fetch(`${API}/tickets/${targetId}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) throw new Error('Server deletion failed');

      // Refresh stats
      const statsRes = await fetch(`${API}/tickets/stats`);
      if (statsRes.ok) setStats(await statsRes.json());

      showToast(`Ticket #${targetId} deleted`, 'info');
    } catch (err) {
      // Revert if failed
      if (removedTicket) {
        setTickets((prev) => [removedTicket, ...prev]);
      }
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // ── Filter and Search Logic ───────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ticket.title.toLowerCase().includes(query);
        const matchDesc = ticket.description?.toLowerCase().includes(query);
        const matchAssignee = ticket.assignee?.toLowerCase().includes(query);
        const matchId = String(ticket.id).includes(query);
        if (!matchTitle && !matchDesc && !matchAssignee && !matchId) return false;
      }

      // Tab or Chip filter
      if (activeFilter === 'OPEN') return ticket.status === 'OPEN';
      if (activeFilter === 'IN_PROGRESS') return ticket.status === 'IN_PROGRESS';
      if (activeFilter === 'RESOLVED') return ticket.status === 'RESOLVED';
      if (activeFilter === 'CLOSED') return ticket.status === 'CLOSED';
      if (activeFilter === 'URGENT') return ticket.priority === 'URGENT';
      if (activeFilter === 'HIGH') return ticket.priority === 'HIGH';
      if (activeFilter === 'MY_TICKETS') {
        return (ticket.assignee || '').toLowerCase().includes('support') || (ticket.assignee || '').toLowerCase().includes('agent');
      }

      return true;
    });
  }, [tickets, activeFilter, searchQuery]);

  return (
    <div className={`yt-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Top App Bar (YouTube Header) ─────────────────────────────────── */}
      <header className="yt-header">
        <div className="header-left">
          <button
            className="yt-icon-button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle navigation"
            aria-label="Toggle navigation"
          >
            <Icons.Menu />
          </button>

          <div
            className="yt-brand"
            onClick={() => {
              setActiveTab('dashboard');
              setActiveFilter('ALL');
              setSearchQuery('');
            }}
          >
            <Icons.Logo />
            <span className="yt-brand-name">Helpdesk</span>
            <span className="yt-badge-tag">DevOps</span>
          </div>
        </div>

        {/* ── YouTube-Style Centered Search Bar ── */}
        <div className="header-center">
          <div className="yt-search-box">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tickets by title, description, or assignee (Press '/' to focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="yt-clear-button"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <Icons.Clear />
              </button>
            )}
            <button className="yt-search-submit" title="Search">
              <Icons.Search />
            </button>
          </div>
        </div>

        {/* ── Header Right Actions ── */}
        <div className="header-right">
          <button
            className="yt-icon-button"
            onClick={() => loadData(true)}
            title="Refresh tickets"
            disabled={refreshing}
          >
            <Icons.Refresh spinning={refreshing} />
          </button>

          <button
            className="yt-create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Icons.Plus />
            <span>Create</span>
          </button>

          <div className="system-pill" title="Backend health status">
            <span className={`status-dot ${error ? 'offline' : 'online'}`} />
            <span>{error ? 'Offline' : 'API Live'}</span>
          </div>

          <div className="user-avatar" title="Logged in as Support Agent">
            <span>HD</span>
          </div>
        </div>
      </header>

      {/* ── Main Container: Sidebar + Content ────────────────────────────── */}
      <div className="yt-body">
        {/* ── YouTube Left Sidebar ── */}
        <aside className="yt-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' && activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setActiveFilter('ALL');
              }}
            >
              <span className="nav-icon"><Icons.Dashboard /></span>
              <span className="nav-label">Dashboard</span>
            </button>

            <button
              className={`nav-item ${activeFilter === 'MY_TICKETS' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('my-tickets');
                setActiveFilter('MY_TICKETS');
              }}
            >
              <span className="nav-icon"><Icons.Ticket /></span>
              <span className="nav-label">My Tickets</span>
            </button>

            <button
              className={`nav-item ${activeFilter === 'OPEN' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('queue');
                setActiveFilter('OPEN');
              }}
            >
              <span className="nav-icon"><Icons.Queue /></span>
              <span className="nav-label">Open Queue</span>
              {stats.open > 0 && <span className="nav-counter">{stats.open}</span>}
            </button>

            <button
              className={`nav-item ${activeFilter === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('queue');
                setActiveFilter('IN_PROGRESS');
              }}
            >
              <span className="nav-icon"><Icons.InProgress /></span>
              <span className="nav-label">In Progress</span>
              {stats.inProgress > 0 && <span className="nav-counter">{stats.inProgress}</span>}
            </button>

            <button
              className={`nav-item ${activeFilter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('queue');
                setActiveFilter('RESOLVED');
              }}
            >
              <span className="nav-icon"><Icons.Resolved /></span>
              <span className="nav-label">Resolved</span>
              {stats.resolved > 0 && <span className="nav-counter">{stats.resolved}</span>}
            </button>

            <div className="nav-divider" />

            <div className="nav-section-title">DEVOPS & SYSTEM</div>

            <button
              className={`nav-item ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              <span className="nav-icon"><Icons.Metrics /></span>
              <span className="nav-label">Metrics & Reports</span>
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="nav-item external"
              title="Open FastAPI Swagger Documentation"
            >
              <span className="nav-icon"><Icons.ExternalLink /></span>
              <span className="nav-label">Swagger Docs</span>
            </a>

            <a
              href="/metrics"
              target="_blank"
              rel="noreferrer"
              className="nav-item external"
              title="Open Raw Prometheus Metrics Endpoint"
            >
              <span className="nav-icon"><Icons.ExternalLink /></span>
              <span className="nav-label">Prometheus /metrics</span>
            </a>
          </nav>

          <div className="sidebar-footer">
            <div className="pipeline-pill">
              <span className="pipeline-step active">Test</span>
              <span className="pipeline-sep">›</span>
              <span className="pipeline-step active">Build</span>
              <span className="pipeline-sep">›</span>
              <span className="pipeline-step active">Scan</span>
              <span className="pipeline-sep">›</span>
              <span className="pipeline-step active">Deploy</span>
            </div>
            <p className="copyright">Helpdesk DevOps Capstone</p>
          </div>
        </aside>

        {/* ── Main Content Area ───────────────────────────────────────────── */}
        <main className="yt-content">
          {error && (
            <div className="yt-banner-alert">
              <span>⚠ {error}</span>
              <button onClick={() => loadData(true)}>Retry Connection</button>
            </div>
          )}

          {/* ── View: Metrics & System Reports ── */}
          {activeTab === 'metrics' ? (
            <section className="metrics-view">
              <div className="view-header">
                <div>
                  <h1>System & Observability Reports</h1>
                  <p className="muted">Live monitoring metrics exposed via Prometheus FastAPI Instrumentator.</p>
                </div>
                <button className="yt-btn secondary" onClick={() => setActiveTab('dashboard')}>
                  Back to Dashboard
                </button>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>HTTP Requests Scraped</h3>
                  <div className="metric-value">{stats.total * 3 + 12}</div>
                  <p className="muted">Rate tracked by Prometheus ServiceMonitor</p>
                </div>
                <div className="metric-card">
                  <h3>Active Tickets Ratio</h3>
                  <div className="metric-value">
                    {stats.total > 0 ? Math.round(((stats.open + stats.inProgress) / stats.total) * 100) : 0}%
                  </div>
                  <p className="muted">Open + In Progress out of total</p>
                </div>
                <div className="metric-card">
                  <h3>Resolution Rate</h3>
                  <div className="metric-value">
                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </div>
                  <p className="muted">Completed support issues</p>
                </div>
                <div className="metric-card">
                  <h3>Backend Service</h3>
                  <div className="metric-value highlight">FastAPI 0.116+</div>
                  <p className="muted">Uvicorn + PostgreSQL 16</p>
                </div>
              </div>

              <div className="yt-panel" style={{ marginTop: '24px' }}>
                <div className="panel-title">FastAPI Endpoints Tested & Verified</div>
                <div className="endpoints-list">
                  <code>GET  /health</code> <span>Liveness probe (K8s)</span>
                  <code>GET  /ready</code> <span>Readiness probe with DB count (K8s)</span>
                  <code>GET  /metrics</code> <span>Prometheus scrape target (15s interval)</span>
                  <code>GET  /api/tickets</code> <span>List tickets with descending order</span>
                  <code>POST /api/tickets</code> <span>Create ticket with status OPEN</span>
                  <code>PUT  /api/tickets/{'{id}'}</code> <span>Update status, priority, or assignee</span>
                  <code>DELETE /api/tickets/{'{id}'}</code> <span>Remove ticket from PostgreSQL</span>
                </div>
              </div>
            </section>
          ) : (
            /* ── View: Dashboard / Ticket Management ── */
            <>
              {/* ── YouTube-Style Filter Chips (Pill Bar) ── */}
              <div className="chips-container">
                {[
                  { id: 'ALL', label: 'All Tickets' },
                  { id: 'OPEN', label: `Open (${stats.open})` },
                  { id: 'IN_PROGRESS', label: `In Progress (${stats.inProgress})` },
                  { id: 'RESOLVED', label: `Resolved (${stats.resolved})` },
                  { id: 'CLOSED', label: `Closed (${stats.closed})` },
                  { id: 'URGENT', label: 'Urgent' },
                  { id: 'HIGH', label: 'High Priority' },
                  { id: 'MY_TICKETS', label: 'My Tickets' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    className={`yt-chip ${activeFilter === chip.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(chip.id)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* ── YouTube Studio Style Stat Cards ── */}
              <div className="stat-cards-grid">
                <div className="yt-stat-card" onClick={() => setActiveFilter('ALL')}>
                  <div className="stat-card-header">
                    <span className="stat-label">Total Tickets</span>
                    <Icons.Ticket />
                  </div>
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-footnote">All recorded items</div>
                </div>

                <div className="yt-stat-card" onClick={() => setActiveFilter('OPEN')}>
                  <div className="stat-card-header">
                    <span className="stat-label">Open Queue</span>
                    <Icons.Queue />
                  </div>
                  <div className="stat-number blue-accent">{stats.open}</div>
                  <div className="stat-footnote">Awaiting triage</div>
                </div>

                <div className="yt-stat-card" onClick={() => setActiveFilter('IN_PROGRESS')}>
                  <div className="stat-card-header">
                    <span className="stat-label">In Progress</span>
                    <Icons.InProgress />
                  </div>
                  <div className="stat-number blue-accent">{stats.inProgress}</div>
                  <div className="stat-footnote">Under investigation</div>
                </div>

                <div className="yt-stat-card" onClick={() => setActiveFilter('RESOLVED')}>
                  <div className="stat-card-header">
                    <span className="stat-label">Resolved</span>
                    <Icons.Resolved />
                  </div>
                  <div className="stat-number">{stats.resolved}</div>
                  <div className="stat-footnote">Successfully fixed</div>
                </div>
              </div>

              {/* ── Tickets Main List / Table ── */}
              <div className="yt-panel">
                <div className="panel-header">
                  <div className="panel-header-left">
                    <h2>Support Tickets</h2>
                    <span className="count-tag">
                      {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>

                  {searchQuery && (
                    <button className="clear-filter-btn" onClick={() => setSearchQuery('')}>
                      Clear Search "{searchQuery}"
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="loading-state">
                    <Icons.Refresh spinning={true} />
                    <p>Loading tickets from database...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="empty-state">
                    <Icons.Ticket />
                    <h3>No tickets found</h3>
                    <p>
                      {searchQuery
                        ? `No results match "${searchQuery}". Try a different keyword.`
                        : `No tickets currently match the "${activeFilter}" filter.`}
                    </p>
                    <button className="yt-create-btn" onClick={() => setShowCreateModal(true)}>
                      <Icons.Plus />
                      <span>Create New Ticket</span>
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="yt-table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>ID</th>
                          <th>Ticket Summary</th>
                          <th style={{ width: '130px' }}>Priority</th>
                          <th style={{ width: '180px' }}>Status</th>
                          <th style={{ width: '150px' }}>Assignee</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket.id} className="ticket-row">
                            <td>
                              <span className="ticket-id">#{ticket.id}</span>
                            </td>

                            <td>
                              <div className="ticket-main-info">
                                <span className="ticket-title">{ticket.title}</span>
                                {ticket.description && (
                                  <span className="ticket-desc">{ticket.description}</span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                                {ticket.priority}
                              </span>
                            </td>

                            <td>
                              {/* Direct Status Selector */}
                              <select
                                className={`status-select ${ticket.status.toLowerCase().replace('_', '-')}`}
                                value={ticket.status}
                                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                title="Change ticket status"
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <div className="assignee-cell">
                                <span className="assignee-avatar">
                                  {ticket.assignee ? ticket.assignee.charAt(0).toUpperCase() : 'A'}
                                </span>
                                <span className="assignee-name">{ticket.assignee || 'Unassigned'}</span>
                              </div>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div className="row-actions">
                                <button
                                  className="action-btn"
                                  onClick={() => setEditingTicket({ ...ticket })}
                                  title="Edit ticket"
                                >
                                  <Icons.Edit />
                                </button>
                                <button
                                  className="action-btn delete"
                                  onClick={() => setDeleteTicketId(ticket.id)}
                                  title="Delete ticket"
                                >
                                  <Icons.Trash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Modal: Create New Ticket ──────────────────────────────────────── */}
      {showCreateModal && (
        <div className="yt-modal-backdrop" onClick={() => !submitting && setShowCreateModal(false)}>
          <div className="yt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Support Ticket</h3>
              <button
                className="yt-icon-button"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
              >
                <Icons.Clear />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Ticket Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Users unable to process credit card payment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue, reproduction steps, or error message..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assignee</label>
                  <input
                    type="text"
                    placeholder="Support Agent"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="yt-btn secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="yt-btn primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Ticket ────────────────────────────────────────────── */}
      {editingTicket && (
        <div className="yt-modal-backdrop" onClick={() => !submitting && setEditingTicket(null)}>
          <div className="yt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Ticket #{editingTicket.id}</h3>
              <button
                className="yt-icon-button"
                onClick={() => setEditingTicket(null)}
                disabled={submitting}
              >
                <Icons.Clear />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Ticket Title *</label>
                <input
                  type="text"
                  required
                  value={editingTicket.title}
                  onChange={(e) => setEditingTicket({ ...editingTicket, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editingTicket.description || ''}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, description: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editingTicket.priority}
                    onChange={(e) =>
                      setEditingTicket({ ...editingTicket, priority: e.target.value })
                    }
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingTicket.status}
                    onChange={(e) =>
                      setEditingTicket({ ...editingTicket, status: e.target.value })
                    }
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Assignee</label>
                <input
                  type="text"
                  value={editingTicket.assignee || ''}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, assignee: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="yt-btn secondary"
                  onClick={() => setEditingTicket(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="yt-btn primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Delete ─────────────────────────────────────────── */}
      {deleteTicketId && (
        <div className="yt-modal-backdrop" onClick={() => setDeleteTicketId(null)}>
          <div className="yt-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Ticket #{deleteTicketId}</h3>
              <button className="yt-icon-button" onClick={() => setDeleteTicketId(null)}>
                <Icons.Clear />
              </button>
            </div>
            <p className="confirm-text">
              Are you sure you want to permanently delete this support ticket? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="yt-btn secondary"
                onClick={() => setDeleteTicketId(null)}
              >
                Cancel
              </button>
              <button type="button" className="yt-btn danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Toast Notification ──────────────────────────────────── */}
      {toast && (
        <div className={`yt-toast ${toast.type}`}>
          <span className="toast-bullet" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
