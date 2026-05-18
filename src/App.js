import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import { Toast } from './components/UI';
import { NAV } from './data';
import {
  authenticate,
  clearSession,
  EMPTY_DATABASE,
  getSession,
  loadDatabase,
  saveAudit,
  saveGoals,
  sendNotificationEvent,
  signupAccount,
} from './db';

// Employee pages
import { EmpDashboard, MyGoals, EmpCheckin } from './components/EmployeePages';
// Manager pages
import { MgrDashboard, TeamGoals, Approvals, MgrCheckin, SharedGoals } from './components/ManagerPages';
// Admin pages
import { AdminDashboard, AllGoals, AuditLog, Reports, CycleManagement } from './components/AdminPages';

// ─── Page registry ────────────────────────────────────────────────────────────
function usePages(goals, setGoals, auditLog, addAudit, showToast, navigate, currentUser, notifyEvent) {
  return {
    employee: {
      dashboard: () => <EmpDashboard goals={goals} onNavigate={navigate} currentUser={currentUser} />,
      'my-goals': () => <MyGoals goals={goals} setGoals={setGoals} addAudit={addAudit} showToast={showToast} currentUser={currentUser} notifyEvent={notifyEvent} />,
      checkin:   () => <EmpCheckin goals={goals} setGoals={setGoals} addAudit={addAudit} showToast={showToast} currentUser={currentUser} notifyEvent={notifyEvent} />,
    },
    manager: {
      dashboard:    () => <MgrDashboard goals={goals} onNavigate={navigate} />,
      'team-goals': () => <TeamGoals goals={goals} />,
      approvals:    () => <Approvals goals={goals} setGoals={setGoals} addAudit={addAudit} showToast={showToast} notifyEvent={notifyEvent} />,
      'checkin-mgr':() => <MgrCheckin goals={goals} setGoals={setGoals} addAudit={addAudit} showToast={showToast} />,
      'shared-goals':()=> <SharedGoals goals={goals} setGoals={setGoals} addAudit={addAudit} showToast={showToast} />,
    },
    admin: {
      dashboard:  () => <AdminDashboard goals={goals} auditLog={auditLog} onNavigate={navigate} />,
      'all-goals':() => <AllGoals goals={goals} setGoals={setGoals} addAudit={addAudit} showToast={showToast} />,
      audit:      () => <AuditLog auditLog={auditLog} />,
      reports:    () => <Reports goals={goals} showToast={showToast} />,
      'cycle-mgmt':()=> <CycleManagement showToast={showToast} />,
    },
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [database, setDatabase] = useState(EMPTY_DATABASE);
  const [session,  setSession]  = useState(() => getSession());
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState('dashboard');
  const [toast,    setToast]    = useState({ message: '', type: 'success' });

  const role = session?.role;
  const goals = database?.goals || EMPTY_DATABASE.goals;
  const auditLog = database?.auditLog || EMPTY_DATABASE.auditLog;
  const currentUser = database?.users?.find(user => user.email === session?.email || user.id === session?.id);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 2600);
  }, []);

  useEffect(() => {
    let active = true;

    loadDatabase()
      .then(nextDatabase => {
        if (active) setDatabase(nextDatabase || EMPTY_DATABASE);
      })
      .catch(error => {
        if (active) showToast(`Database unavailable: ${error.message}`, 'warn');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [showToast]);

  const setGoals = useCallback(updater => {
    setDatabase(prev => {
      const current = prev || EMPTY_DATABASE;
      const goals = typeof updater === 'function' ? updater(current.goals) : updater;
      const nextDatabase = { ...current, goals };

      saveGoals(goals)
        .then(savedDatabase => setDatabase(current => ({ ...(current || EMPTY_DATABASE), goals: savedDatabase.goals })))
        .catch(error => showToast(`Goal save failed: ${error.message}`, 'warn'));

      return nextDatabase;
    });
  }, [showToast]);

  const addAudit = useCallback(entry => {
    setDatabase(prev => {
      const current = prev || EMPTY_DATABASE;
      const nextDatabase = { ...current, auditLog: [entry, ...current.auditLog] };

      saveAudit(entry)
        .then(savedDatabase => setDatabase(current => ({ ...(current || EMPTY_DATABASE), auditLog: savedDatabase.auditLog })))
        .catch(error => showToast(`Audit save failed: ${error.message}`, 'warn'));

      return nextDatabase;
    });
  }, [showToast]);

  const notifyEvent = useCallback(event => {
    sendNotificationEvent(event).catch(error => {
      console.warn('Notification event failed', error);
    });
  }, []);

  const navigate = useCallback(id => setPage(id), []);

  const login = async ({ email, password }) => {
    try {
      const nextSession = await authenticate(email, password);
      const nextDatabase = await loadDatabase();
      setSession(nextSession);
      setDatabase(nextDatabase || EMPTY_DATABASE);
      setPage('dashboard');
      showToast(`Welcome, ${nextSession.name}`);
      return true;
    } catch (error) {
      showToast(error.message === 'Failed to fetch'
        ? 'Cannot reach backend API. Start npm run server first.'
        : 'Invalid email or password', 'warn');
      return false;
    }
  };

  const signup = async account => {
    try {
      const nextSession = await signupAccount(account);
      const nextDatabase = await loadDatabase();
      setSession(nextSession);
      setDatabase(nextDatabase || EMPTY_DATABASE);
      setPage('dashboard');
      showToast(`Welcome, ${nextSession.name}`);
      return true;
    } catch (error) {
      showToast(error.message === 'Failed to fetch'
        ? 'Cannot reach backend API. Start npm run server first.'
        : error.message, 'warn');
      return false;
    }
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setPage('dashboard');
  };

  const pages = usePages(goals, setGoals, auditLog, addAudit, showToast, navigate, currentUser, notifyEvent);

  // Get label for topbar
  const pageLabel = role ? (NAV[role]?.find(n => n.id === page)?.label || 'Dashboard') : '';

  if (loading) return (
    <>
      <div className="login-screen">
        <div className="login-box">
          <div className="login-logo">SeTrack</div>
          <div className="login-sub" style={{ marginBottom: 0 }}>Connecting to database...</div>
        </div>
      </div>
      <Toast message={toast.message} type={toast.type} />
    </>
  );

  if (!role) return (
    <>
      <LoginScreen onLogin={login} onSignup={signup} />
      <Toast message={toast.message} type={toast.type} />
    </>
  );

  const PageComponent = pages[role]?.[page];

  return (
    <div className="app-layout">
      <Sidebar role={role} user={currentUser} currentPage={page} onNavigate={navigate} onLogout={logout} />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">{pageLabel}</div>
        </div>
        <div className="page-content">
          {PageComponent ? <PageComponent /> : (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>Page not found.</div>
          )}
        </div>
      </main>
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
