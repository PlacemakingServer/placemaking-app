import { createContext, useContext, useEffect, useState } from "react";
import { initAuthDB } from "@/lib/db";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchFromIndexedDB = async (storeName, key) => {
    const db = await initAuthDB();
    return await db.get(storeName, key);
  };

  const saveToIndexedDB = async (storeName, key, data) => {
    const db = await initAuthDB();
    await db.put(storeName, { id: key, ...data });
  };

  const loadAuthState = async () => {
    const creds = await fetchFromIndexedDB("user-creds", "user-creds");
    const user = await fetchFromIndexedDB("user-data", "user-data");
    if (creds) setAuthToken(creds);
    if (user) setUserData(user.user);
  };

  const saveCredentials = async ({ access_token, token_type, expires_at }) => {
    const data = { access_token, token_type, expires_at };
    await saveToIndexedDB("user-creds", "user-creds", data);
    setAuthToken(data);
  };
  
  const saveUserInfo = async (user) => {
    await saveToIndexedDB("user-data", "user-data", { user });
    setUserData(user);
  };
  
  const syncUserDataFromAPI = async () => {
    try {
      if (!userData?.id) return;

      const res = await fetch(`/api/users/${userData.id}`);
      if (!res.ok) throw new Error("Erro ao buscar dados do usuário");

      const data = await res.json();
      if (data.user) {
        await saveUserInfo(data.user);
      }
    } catch (err) {
      console.error("[syncUserDataFromAPI]", err);
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userCreds: authToken,
        userData,
        saveCredentials,
        saveUserInfo,
        syncUserData: syncUserDataFromAPI,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
