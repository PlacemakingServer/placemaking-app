import { createContext, useState, useContext } from "react";

const LoadingContext = createContext();

export function LoadingContextProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
export function useLoading() {
  return useContext(LoadingContext);
}
