import React, { useState } from 'react';

export default function LoginScreen({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState('Sales');

  const isSignup = mode === 'signup';

  const submit = event => {
    event.preventDefault();
    if (isSignup) {
      onSignup({ name, email, password, dept });
      return;
    }
    onLogin({ email, password });
  };

  const switchMode = nextMode => {
    setMode(nextMode);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-screen">
      <form className="login-box" onSubmit={submit}>
        <div className="login-logo">Goal Setting &amp; Tracking Portal</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
          SeTrack
        </div>
        <div className="login-sub">
          {isSignup ? 'Create an employee account' : 'Sign in with your account'}
        </div>

        {isSignup && (
          <>
            <label className="login-label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="form-input login-input"
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              autoComplete="name"
              required
            />

            <label className="login-label" htmlFor="dept">Department</label>
            <input
              id="dept"
              className="form-input login-input"
              type="text"
              value={dept}
              onChange={event => setDept(event.target.value)}
              required
            />
          </>
        )}

        <label className="login-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="form-input login-input"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          autoComplete="username"
          required
        />

        <label className="login-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="form-input login-input"
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
        />

        <button className="btn btn-primary login-submit" type="submit">
          {isSignup ? 'Create Account' : 'Sign in'}
        </button>

        <button
          className="btn btn-ghost login-submit"
          type="button"
          onClick={() => switchMode(isSignup ? 'login' : 'signup')}
        >
          {isSignup ? 'Back to Sign in' : 'Sign up for new account'}
        </button>
      </form>
    </div>
  );
}
