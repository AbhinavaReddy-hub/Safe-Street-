import React, { createContext, useState, useContext } from "react";

const CollapsedContext = createContext();

export const useCollapsed = () => useContext(CollapsedContext);

export const CollapsedProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <CollapsedContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </CollapsedContext.Provider>
  );
};
