import { useContext, createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { getUserId, getUserName, getUserRole } from "./auth.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const apiUrl = "http://localhost:5211/api";

  const [token, setToken] = useState(sessionStorage.getItem('token') || "");
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      setUser(getUserName());
      setUserId(getUserId());
      setRole(getUserRole());
    } else {
      delete axios.defaults.headers.common["Authorization"];
      sessionStorage.removeItem('token');
      setUser(null);
      setUserId(null);
      setRole(null);
    }
  }, [token]);

  const navigate = useNavigate();

  const loginAction = async (data) => {
    const payload = {
      userName: data.username,
      password: data.password
    };
    try {
      const res = await axios.post(`${apiUrl}/authorization/token`, payload);
      setToken(res.data);
      setTimeout(() => navigate("/"), 200);
    } catch (err) {
      alert("Failed to login");
    }
  };

  const logOutAction = () => {
    setToken("");
    setTimeout(() => navigate("/login"), 200);
  };

  return (
    <AuthContext.Provider value={{ token, user, userId, role, loginAction, logOutAction }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};