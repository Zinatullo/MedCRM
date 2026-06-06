import { useState } from "react";

const AUTH_KEY = "med_crm_auth";

function loadAuth() {
  try { 
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; 
  } catch { 
    return null; 
  }
}

function saveAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

// 1. Экспортируем функцию-хук. Внутри неё лежит useState.
export function useAuth() {
  const [auth, setAuth] = useState(() => loadAuth());

  const handleLogin = async ({ login, password }) => {
    if (login === "admin" && password === "demo") {
      const user = { login, name: "Администратор", role: "admin" };
      saveAuth(user);
      setAuth(user);
    } else {
      throw new Error("Неверный логин или пароль");
    }
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
  };

  const clinic   = { name: "PROlab Medical", shortName: "PROlab", logo: "" };
  const counters = {};

  // Возвращаем объект со всеми данными
  return { auth, handleLogin, handleLogout, clinic, counters };
}