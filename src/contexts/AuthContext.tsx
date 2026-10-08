/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import type { ReactNode } from "react";

type User = {
  id: number;
  name: string;
  role: "PATIENT" | "NUTRITIONIST";
};

type AuthContextData = {
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("@VitaTech:user");
    const storedToken = localStorage.getItem("@VitaTech:token");

    if (storedUser && storedToken) {
      return JSON.parse(storedUser);
    }
    return null;
  });

  const signIn = (token: string, loggedUser: User) => {
    localStorage.setItem("@VitaTech:token", token);
    localStorage.setItem("@VitaTech:user", JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const signOut = () => {
    localStorage.removeItem("@VitaTech:token");
    localStorage.removeItem("@VitaTech:user");
    setUser(null);

    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
