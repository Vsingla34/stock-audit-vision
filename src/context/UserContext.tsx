
import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "auditor" | "client";
  name: string;
  companyId?: string;
  assignedLocations?: string[]; // Location IDs that this user can access
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (user: Omit<User, "id">) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  assignLocationToUser: (userId: string, locationId: string) => void;
  removeLocationFromUser: (userId: string, locationId: string) => void;
  hasPermission: (permission: string) => boolean;
  getUsersForLocation: (locationId: string) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USERS: 'inventory-users',
  CURRENT_USER: 'inventory-current-user',
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    if (savedData) {
      return JSON.parse(savedData);
    }
    // Sample users for demonstration
    return [
      {
        id: "user1",
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
      {
        id: "user2",
        username: "auditor1",
        email: "auditor1@example.com",
        role: "auditor",
        name: "Auditor One",
        assignedLocations: ["loc-1", "loc-2"]
      },
      {
        id: "user3",
        username: "client1",
        email: "client1@example.com",
        role: "client",
        name: "Client Company",
        companyId: "company1",
        assignedLocations: ["loc-1", "loc-2", "loc-3"]
      },
      {
        id: "user4",
        username: "auditor2",
        email: "auditor2@example.com",
        role: "auditor",
        name: "Auditor Two",
        assignedLocations: ["loc-3"]
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!currentUser);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    // In a real app, this would validate credentials against a backend
    // For demo purposes, we'll just find the user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    // Simulate successful login
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const registerUser = (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: `user${Date.now()}`,
    };
    
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => 
      prev.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    
    // Update current user if it's the same user
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const assignLocationToUser = (userId: string, locationId: string) => {
    setUsers(prev => 
      prev.map(user => {
        if (user.id === userId) {
          const locations = user.assignedLocations || [];
          if (!locations.includes(locationId)) {
            return {
              ...user,
              assignedLocations: [...locations, locationId]
            };
          }
        }
        return user;
      })
    );
  };

  const removeLocationFromUser = (userId: string, locationId: string) => {
    setUsers(prev => 
      prev.map(user => {
        if (user.id === userId && user.assignedLocations) {
          return {
            ...user,
            assignedLocations: user.assignedLocations.filter(id => id !== locationId)
          };
        }
        return user;
      })
    );
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    // Very simple permission system for demo
    // In a real app, this would be more sophisticated
    switch (permission) {
      case "viewAllLocations":
        return currentUser.role === "admin";
      case "manageUsers":
        return currentUser.role === "admin";
      case "viewReports":
        return ["admin", "client"].includes(currentUser.role);
      case "conductAudits":
        return ["admin", "auditor"].includes(currentUser.role);
      default:
        return false;
    }
  };

  const getUsersForLocation = (locationId: string): User[] => {
    return users.filter(
      user => user.assignedLocations?.includes(locationId) || user.role === "admin"
    );
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        login,
        logout,
        registerUser,
        updateUser,
        deleteUser,
        assignLocationToUser,
        removeLocationFromUser,
        hasPermission,
        getUsersForLocation
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
