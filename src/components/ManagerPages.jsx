import React, { useState } from 'react';
import {
  StatCard, Alert, Badge, ProgressBar, Btn, Modal,
  FormGroup, Input, Select, Textarea, SectionHeader,
} from './UI';
import { nowStr } from '../utils';
import { THRUST_AREAS, USERS } from '../data';

const TEAM_EMP_IDS = ['emp1', 'emp2', 'emp3'];
const EMP_MAP = { emp1: 'Arjun Sharma', emp2: 'Neha Patel', emp3: 'Rohit Kumar' };
const ID_MAP  = { 'Arjun Sharma': 'emp1', 'Neha Patel': 'emp2', 'Rohit Kumar': 'emp3' };

// ── Manager Dashboard ─────────────────────────────────────────────────────────
export function MgrDashboard({ goals, onNavigate }) {
  const teamGoals = goals.filter(g => TEAM_EMP_IDS.includes(g.empId));
  const pending   = teamGoals.filter(g => g.status === 'Pending').length;
  const approved  = teamGoals.filter(g => g.status === 'Approved').length;

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Team Members"   value={3}         color="var(--accent2)" />
        <StatCard label="Goals Pending"  value={pending}   sub="awaiting review"  color="var(--amber)" />
        <StatCard label="Goals Approved" value={approved}  color="var(--green)"   />
        <StatCard label="Check-in Rate"  value="67%"       sub="2 of 3 completed" color="var(--teal)"  />
      </div>

      {pending > 0 && (
        <Alert type="warn">
          ⚠️ {pending} goal(s) are awaiting your approval.{' '}
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onNavigate('approvals')}>Review now →</span>
        </Alert>
      )}

      <div className="card">
        <SectionHeader title="Team Summary" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Goals</th><th>Pending</th>
                <th>Weight Sum</th><th>Q1 Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(EMP_MAP).map(emp => {
                const eg   = goals.filter(g => g.emp === emp);
                const pw   = eg.reduce((s, g) => s + Number(g.weightage), 0);
                const pend = eg.filter(g => g.status === 'Pending').length;
                const ci   = eg.filter(g => g.checkStatus !== 'Not Started').length;
                return (
                  <tr key={emp}>
                    <td style={{ fontWeight: 500 }}>{emp}</td>
                    <td>{eg.length}</td>
                    <td>{pend > 0
                      ? <Badge label="Pending" />
                      : <Badge label="Approved" />}
                    </td>
                    <td><span style={{ color: pw === 100 ? 'var(--green)' : 'var(--amber)', fontWeight: 500 }}>{pw}%</span></td>
                    <td>
                      {ci >= eg.length
                        ? <Badge label="Completed" />
                        : ci > 0 ? <span className="badge badge-amber">{ci}/{eg.length}</span>
                        : <Badge label="Not Started" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Team Goals ────────────────────────────────────────────────────────────────
export function TeamGoals({ goals }) {
  const [filter, setFilter] = useState('All');
  const emps = ['All', ...Object.values(EMP_MAP)];
  const shown = filter === 'All' ? Object.values(EMP_MAP) : [filter];

  return (
    <div>
      <div className="chip-row">
        {emps.map(e => (
          <div key={e} className={`chip${filter === e ? ' active' : ''}`} onClick={() => setFilter(e)}>{e}</div>
        ))}
      </div>
      {shown.map(emp => {
        const eg = goals.filter(g => g.emp === emp);
        return (
          <div key={emp} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>{emp}</div>
            {eg.map(g => (
              <div key={g.id} className="goal-item" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {g.thrust} · UoM: {g.uom} · Target: {g.target} {g.unit}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge label={g.status} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent2)' }}>{g.weightage}%</span>
                  </div>
                </div>
                {g.actual != null && <ProgressBar goal={g} />}
              </div>
            ))}
            {eg.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 13 }}>No goals submitted yet.</div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Approvals ─────────────────────────────────────────────────────────────────
export function Approvals({ goals, setGoals, addAudit, showToast }) {
  const pending = goals.filter(g => g.status === 'Pending');
  const [edits, setEdits] = useState(
    Object.fromEntries(pending.map(g => [g.id, { target: g.target, weightage: g.weightage }]))
  );
  const mgrName = USERS.manager.name;

  const approve = id => {
    const e = edits[id] || {};
    const g = goals.find(x => x.id === id);
    setGoals(prev => prev.map(x =>
      x.id === id ? { ...x, target: e.target ?? x.target, weightage: Number(e.weightage) || x.weightage, status: 'Approved', locked: true } : x
    ));
    addAudit({ time: nowStr(), user: mgrName, action: `Approved goal "${g.title}" for ${g.emp}` });
    showToast('Goal approved and locked');
  };

  const returnGoal = id => {
    const g = goals.find(x => x.id === id);
    setGoals(prev => prev.map(x => x.id === id ? { ...x, status: 'Draft', locked: false } : x));
    addAudit({ time: nowStr(), user: mgrName, action: `Returned goal "${g.title}" to ${g.emp} for rework` });
    showToast('Goal returned to employee');
  };

  if (pending.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 15 }}>No pending approvals</div>
      </div>
    );
  }

  return (
    <div>
      <Alert type="warn">⚠️ {pending.length} goal(s) from your team await your review.</Alert>
      {pending.map(g => {
        const e = edits[g.id] || { target: g.target, weightage: g.weightage };
        return (
          <div key={g.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{g.emp} · {g.thrust} · UoM: {g.uom}</div>
              </div>
              <Badge label="Pending" />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, background: 'var(--surface3)', padding: '8px 12px', borderRadius: 6 }}>
              {g.desc}
            </div>
            <div className="form-row">
              <FormGroup label="Target (editable)">
                <Input
                  type={g.uom === 'Timeline' ? 'date' : 'number'}
                  value={e.target}
                  onChange={ev => setEdits(p => ({ ...p, [g.id]: { ...e, target: ev.target.value } }))}
                />
              </FormGroup>
              <FormGroup label="Weightage % (editable)">
                <Input
                  type="number" min="10" max="100"
                  value={e.weightage}
                  onChange={ev => setEdits(p => ({ ...p, [g.id]: { ...e, weightage: ev.target.value } }))}
                />
              </FormGroup>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="success" size="sm" onClick={() => approve(g.id)}>✓ Approve</Btn>
              <Btn variant="danger"  size="sm" onClick={() => returnGoal(g.id)}>↩ Return for Rework</Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Manager Check-in ──────────────────────────────────────────────────────────
export function MgrCheckin({ goals, setGoals, addAudit, showToast }) {
  const teamGoals = goals.filter(g => TEAM_EMP_IDS.includes(g.empId) && g.status === 'Approved');
  const [comments, setComments] = useState(
    Object.fromEntries(teamGoals.map(g => [g.id, g.managerComment || '']))
  );
  const mgrName = USERS.manager.name;

  const save = id => {
    const g = goals.find(x => x.id === id);
    setGoals(prev => prev.map(x => x.id === id ? { ...x, managerComment: comments[id] } : x));
    addAudit({ time: nowStr(), user: mgrName, action: `Added check-in comment for ${g.emp} — "${g.title}"` });
    showToast('Comment saved');
  };

  return (
    <div>
      <Alert type="info">📋 Review your team's Q1 actual achievements and log check-in comments.</Alert>
      {teamGoals.map(g => (
        <div key={g.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{g.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{g.emp} · {g.thrust} · {g.weightage}%</div>
            </div>
            <Badge label={g.checkStatus} />
          </div>
          <div className="form-row" style={{ marginBottom: 10 }}>
            <FormGroup label="Planned Target">
              <div className="form-input" style={{ background: 'var(--surface3)', cursor: 'default' }}>{g.target} {g.unit}</div>
            </FormGroup>
            <FormGroup label="Actual Achievement">
              <div className="form-input" style={{ background: 'var(--surface3)', cursor: 'default', color: g.actual != null ? 'var(--text)' : 'var(--text3)' }}>
                {g.actual != null ? `${g.actual} ${g.unit}` : 'Not submitted yet'}
              </div>
            </FormGroup>
          </div>
          {g.actual != null && <ProgressBar goal={g} />}
          <FormGroup label="Check-in Comment">
            <Textarea
              value={comments[g.id] || ''}
              onChange={e => setComments(p => ({ ...p, [g.id]: e.target.value }))}
              placeholder="Document your check-in discussion..."
              rows={2}
            />
          </FormGroup>
          <Btn variant="primary" size="sm" onClick={() => save(g.id)}>Save Comment</Btn>
        </div>
      ))}
    </div>
  );
}

// ── Shared Goals ──────────────────────────────────────────────────────────────
export function SharedGoals({ goals, setGoals, addAudit, showToast }) {
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ title: '', thrust: THRUST_AREAS[0], uom: 'Zero', target: 0, recipients: ['Arjun Sharma', 'Neha Patel', 'Rohit Kumar'] });
  const mgrName = USERS.manager.name;

  const toggleRecipient = name => {
    setForm(f => ({
      ...f,
      recipients: f.recipients.includes(name)
        ? f.recipients.filter(r => r !== name)
        : [...f.recipients, name],
    }));
  };

  const push = () => {
    if (!form.title.trim()) { showToast('Goal title is required', 'warn'); return; }
    form.recipients.forEach(name => {
      setGoals(prev => [...prev, {
        id: Date.now() + Math.random(),
        emp: name, empId: ID_MAP[name],
        thrust: form.thrust, title: form.title,
        desc: 'Departmental KPI — shared goal',
        uom: form.uom, target: Number(form.target), unit: 'Count',
        weightage: 10, status: 'Approved', quarter: 'Q1',
        actual: null, checkStatus: 'Not Started',
        managerComment: '', locked: true, shared: true, sharedFrom: mgrName,
      }]);
    });
    addAudit({ time: nowStr(), user: mgrName, action: `Pushed shared goal "${form.title}" to ${form.recipients.join(', ')}` });
    showToast(`Shared goal pushed to ${form.recipients.length} employee(s)`);
    setModal(false);
  };

  const sharedGoals = goals.filter(g => g.shared);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Push a departmental KPI to multiple employees. Recipients can only adjust their weightage.
        </p>
        <Btn variant="primary" onClick={() => setModal(true)}>+ Push Shared Goal</Btn>
      </div>

      {modal && (
        <Modal
          title="Push Shared Goal to Team"
          onClose={() => setModal(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={push}>Push Goal →</Btn>
            </>
          }
        >
          <FormGroup label="Goal Title">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Zero Safety Incidents" />
          </FormGroup>
          <FormGroup label="Thrust Area">
            <Select value={form.thrust} onChange={e => setForm(f => ({ ...f, thrust: e.target.value }))} options={THRUST_AREAS} />
          </FormGroup>
          <div className="form-row">
            <FormGroup label="UoM">
              <Select value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} options={['Zero','Min','Max','Timeline']} />
            </FormGroup>
            <FormGroup label="Target">
              <Input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            </FormGroup>
          </div>
          <FormGroup label="Push To">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {Object.values(EMP_MAP).map(name => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.recipients.includes(name)} onChange={() => toggleRecipient(name)} />
                  {name}
                </label>
              ))}
            </div>
          </FormGroup>
        </Modal>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Goal</th><th>Thrust</th><th>Target</th><th>Pushed To</th><th>UoM</th></tr></thead>
          <tbody>
            {sharedGoals.map(g => (
              <tr key={g.id}>
                <td style={{ fontWeight: 500 }}>{g.title}</td>
                <td><span className="badge badge-purple">{g.thrust}</span></td>
                <td>{g.target} {g.unit}</td>
                <td>{g.emp}</td>
                <td>{g.uom}</td>
              </tr>
            ))}
            {sharedGoals.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No shared goals pushed yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
