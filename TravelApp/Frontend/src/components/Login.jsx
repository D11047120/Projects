import React, { useState } from 'react';
import { useAuth } from './authProvider';
import './Login.css';

function Login() {
  const { loginAction } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginAction({ username, password });
    } catch (error) {
      setErrorMsg("Invalid credentials. Please try again.");
    }
  };

  const fillCredentials = (user) => {
    if (user === 'traveler') {
      setUsername('trish.voyager@example.com');
    } else if (user === 'facilitator') {
      setUsername('frank.helper@example.com');
    } else if (user === 'manager') {
      setUsername('mary.decisor@example.com');
    }
    setPassword('Password1!');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to TravelUp</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          <button type="submit">Login</button>
        </form>
<div className="demo-buttons">
          <button onClick={() => fillCredentials('traveler')}>Login as Traveler</button>
          <button onClick={() => fillCredentials('facilitator')}>Login as Facilitator</button>
          <button onClick={() => fillCredentials('manager')}>Login as Manager</button>
        </div>
      </div>
    </div>
  );
}

export default Login;