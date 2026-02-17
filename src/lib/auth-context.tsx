import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "./types";
import { mockUsers } from "./mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (_email: string, role: UserRole) => {
    const found = mockUsers.find((u) => u.role === role);
    if (found) setUser(found);
  };

  const logout = () => setUser(null);

  const switchRole = (role: UserRole) => {
    const found = mockUsers.find((u) => u.role === role);
    if (found) setUser(found);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
