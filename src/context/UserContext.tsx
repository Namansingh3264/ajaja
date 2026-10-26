'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { SEED_USERS } from '@/lib/constants';

interface UserContextValue {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const UserContext = createContext<UserContextValue>({
  currentUser: SEED_USERS[0],
  users: SEED_USERS,
  switchUser: () => {},
  fetchWithAuth: fetch,
});

const STORAGE_KEY = 'ajaia_active_user_id';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);

  useEffect(() => {
    // Fetch users list from server to stay in sync
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          const savedId = localStorage.getItem(STORAGE_KEY);
          if (savedId) {
            const found = data.users.find((u: User) => u.id === savedId);
            if (found) {
              setCurrentUser(found);
              return;
            }
          }
          // Default to Alice Chen
          setCurrentUser(data.users[0]);
        }
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  const switchUser = useCallback(
    (userId: string) => {
      const target = users.find((u) => u.id === userId);
      if (target) {
        setCurrentUser(target);
        localStorage.setItem(STORAGE_KEY, target.id);
        document.cookie = `x-user-id=${target.id}; path=/; max-age=864000`;
      }
    },
    [users]
  );

  const fetchWithAuth = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers || {});
      headers.set('x-user-id', currentUser.id);

      return fetch(input, {
        ...init,
        headers,
      });
    },
    [currentUser]
  );

  return (
    <UserContext.Provider value={{ currentUser, users, switchUser, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
