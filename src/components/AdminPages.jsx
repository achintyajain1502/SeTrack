import React, { useState } from 'react';
import {
  StatCard, Alert, Badge, Btn, SectionHeader,
} from './UI';
import { computeProgress, progressColor, nowStr, exportToCSV } from '../utils';
import { USERS, SCHEDULE } from '../data';

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard({ goals, auditLog, onNavigate }) {
  const emps     = [...new Set(goals.map(g => g.emp))];
  const approved = goals.filter(g => g.status === 'Approved').length;
  const pending  = goals.filter(g => g.status === 'Pending').length;

  const thrustCounts = goals.reduce((acc, g) => {
    acc[g.thrust] = (acc[g.thrust] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Total Employees" value={emps.length}  color="var(--accent2)" />
        <StatCard label="Total Goals"     value={goals.length} color="var(--purple)"  />
        <StatCard label="Approved Goals"  value={approved}     color="var(--green)"   />
        <StatCard label="Pending Review"  value={pending}      color="var(--amber)"   />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <SectionHeader title="Check-in Completion" />
          {emps.map(emp => {
            const eg   = goals.filter(g => g.emp === emp);
            const done = eg.filter(g => g.checkStatus !== 'Not Started').length;
            const pct  = eg.length > 0 ? Math.round((done / eg.length) * 100) : 0;
            return (
              <div key={emp} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span>{emp}</span>
                  <span style={{ color: 'var(--text2)' }}>{done}/{eg.length} · {pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: progressColor(pct) }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <SectionHeader title="Goals by Thrust Area" />
          {Object.entries(thrustCounts).map(([t, c]) => (
            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{t}</span>
              <span style={{ fontWeight: 500 }}>{c} goal{c !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionHeader title="Recent Audit Activity" />
          <span style={{ fontSize: 12, color: 'var(--accent2)', cursor: 'pointer' }} onClick={() => onNavigate('audit')}>View all →</span>
        </div>
        {auditLog.slice(0, 4).map((e, i) => (
          <div key={i} className="audit-entry">
            <div className="audit-time">🕐 {e.time} · <strong>{e.user}</strong></div>
            <div className="audit-text">{e.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── All Goals ─────────────────────────────────────────────────────────────────
export function AllGoals({ goals, setGoals, addAudit, showToast }) {
  const adminName = USERS.admin.name;

  const unlock = id => {
    const g = goals.find(x => x.id === id);
    setGoals(prev => prev.map(x => x.id === id ? { ...x, locked: false, status: 'Draft' } : x));
    addAudit({ time: nowStr(), user: `${adminName} (Admin)`, action: `Unlocked goal "${g.title}" for ${g.emp} — allowing revision` });
    showToast('Goal unlocked for revision');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Btn variant="ghost" size="sm" onClick={() => { exportToCSV(goals); showToast('CSV exported'); }}>⬇ Export CSV</Btn>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Goal</th><th>Thrust</th><th>UoM</th>
              <th>Target</th><th>Actual</th><th>Weight</th>
              <th>Status</th><th>Check-in</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map(g => (
              <tr key={g.id}>
                <td style={{ fontWeight: 500 }}>{g.emp}</td>
                <td>{g.title}</td>
                <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{g.thrust}</span></td>
                <td>{g.uom}</td>
                <td>{g.target} {g.unit}</td>
                <td>{g.actual != null ? `${g.actual} ${g.unit}` : '—'}</td>
                <td><strong>{g.weightage}%</strong></td>
                <td><Badge label={g.status} /></td>
                <td><Badge label={g.checkStatus} /></td>
                <td>
                  {g.locked && (
                    <Btn variant="ghost" size="sm" onClick={() => unlock(g.id)}>Unlock</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export function AuditLog({ auditLog }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionHeader title="Audit Trail" />
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{auditLog.length} entries</span>
      </div>
      {auditLog.map((e, i) => (
        <div key={i} className="audit-entry">
          <div className="audit-time">🕐 {e.time} · <strong>{e.user}</strong></div>
          <div className="audit-text">{e.action}</div>
        </div>
      ))}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
export function Reports({ goals, showToast }) {
  const data = goals.filter(g => g.status === 'Approved');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Alert type="info">📊 Planned vs. Actual Achievement Report — Q1</Alert>
        <Btn variant="primary" size="sm" style={{ marginLeft: 12, flexShrink: 0 }} onClick={() => { exportToCSV(goals); showToast('CSV exported'); }}>
          ⬇ Export CSV
        </Btn>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Employee</th><th>Goal</th><th>UoM</th><th>Target</th><th>Actual</th><th>Progress</th><th>Weight</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.map(g => {
              const pct = computeProgress(g);
              return (
                <tr key={g.id}>
                  <td>{g.emp}</td>
                  <td>{g.title}</td>
                  <td>{g.uom}</td>
                  <td>{g.target} {g.unit}</td>
                  <td>{g.actual != null ? `${g.actual} ${g.unit}` : '—'}</td>
                  <td>
                    {g.actual != null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: progressColor(pct) }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text2)' }}>{Math.round(pct)}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>{g.weightage}%</td>
                  <td><Badge label={g.checkStatus} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Cycle Management ──────────────────────────────────────────────────────────
export function CycleMgmt({ showToast }) {
  const [config, setConfig] = useState({ cycle: 'Q1 Check-in (July)', status: 'Open', opens: '2025-07-01', closes: '2025-07-31' });

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionHeader title="Cycle Configuration" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Current Cycle</label>
            <select className="form-input" value={config.cycle} onChange={e => setConfig(f => ({ ...f, cycle: e.target.value }))}>
              {['Q1 Check-in (July)', 'Q2 Check-in (October)', 'Q3 Check-in (January)', 'Q4 / Annual (March-April)'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Cycle Status</label>
            <select className="form-input" value={config.status} onChange={e => setConfig(f => ({ ...f, status: e.target.value }))}>
              {['Open', 'Closed', 'Locked'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Window Opens</label>
            <input className="form-input" type="date" value={config.opens} onChange={e => setConfig(f => ({ ...f, opens: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Window Closes</label>
            <input className="form-input" type="date" value={config.closes} onChange={e => setConfig(f => ({ ...f, closes: e.target.value }))} />
          </div>
        </div>
        <Btn variant="primary" style={{ marginTop: 16 }} onClick={() => showToast('Cycle settings saved')}>Save Configuration</Btn>
      </div>

      <div className="card">
        <SectionHeader title="Schedule Overview" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Period</th><th>Window Opens</th><th>Action</th><th>Status</th></tr></thead>
            <tbody>
              {SCHEDULE.map(row => (
                <tr key={row.period}>
                  <td style={{ fontWeight: 500 }}>{row.period}</td>
                  <td>{row.window}</td>
                  <td style={{ color: 'var(--text2)' }}>{row.action}</td>
                  <td>
                    {row.status === 'done'   ? <span className="badge badge-green">Completed</span> :
                     row.status === 'active' ? <span className="badge badge-blue">Active</span>     :
                                               <span className="badge badge-gray">Upcoming</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
