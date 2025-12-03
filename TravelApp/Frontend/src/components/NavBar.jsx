import React from 'react';
import { Link , useLocation} from 'react-router-dom';
import { useAuth } from "./authProvider";
import './Navbar.css';

function Navbar() {
  const {role, logOutAction}=useAuth();
  const location =useLocation();
  const hideRequestLink= location.pathname ==="/login";
  return (
    <nav className="navbar">
      {hideRequestLink ?(
        <span className="navbar-brand" >🌍 TravelUp</span> 
      ):(
        <Link className="navbar-brand" to="/">🌍 TravelUp</Link> )}
        <ul className="navbar-links">
          {role === 'facilitator' && (
          <>
          <li>
            <Link to="/facilitator/agencies">Agencies</Link>
          </li>
          </>
          )}
          {role === 'manager' && (
          <>
          <li>
            <Link  to="/manager/projects">Projects</Link>
          </li>
          </>)}
          {role === 'traveler' && (
          <>
          <li>
            <Link to="/traveler/new-request">Create Request</Link>
          </li>
          </>)}
        </ul>
        <ul className="navbar-links">
          {!hideRequestLink &&(
          <li >
            <Link  to="/requests">Requests</Link>
          </li>)}
          {role === 'facilitator' && (
          <>
          <li >
            <Link  to="/facilitator/requests">Dashboard</Link>
          </li>
          </>)}
          {role === 'manager' && (
          <>
          <li >
            <Link  to="/manager/requests">Dashboard</Link>
          </li>
          </>)}
        </ul>
        {!hideRequestLink && (
          <li><button onClick={logOutAction} className="logout-button">Logout</button></li>)}
    </nav>
  );
}

export default Navbar;
