import { createContext, useContext, useState, ReactNode } from "react";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  skills: string[];
  learningInterests: string[];
  proficiency: "beginner" | "intermediate" | "advanced";
  language: string;
  location: string;
  bio: string;
}

const mockUser: MockUser = {
  id: "1",
  name: "Alex Rivera",
  email: "alex@skillswap.io",
  avatar: "AR",
  skills: ["JavaScript", "React", "UI Design"],
  learningInterests: ["Python", "Machine Learning", "Guitar"],
  proficiency: "intermediate",
  language: "English",
  location: "San Francisco, CA",
  bio: "Full-stack developer passionate about teaching web development and learning music on the side.",
};

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  const login = (_email: string, _password: string) => {
    setUser(mockUser);
  };

  const signup = (name: string, email: string, _password: string) => {
    setUser({ ...mockUser, name, email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
