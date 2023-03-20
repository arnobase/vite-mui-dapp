import React, { useEffect, useState } from "react";
import { setToStorage, getFromStorage } from "../lib/storage";

export const AppContext = React.createContext();

export const ContextProvider = ({ children }) => {
  
  const [account, setStateAccount] = useState(undefined);
  let lsAccount = undefined;

  useEffect(()=>{
    loadContext()
  },[])
  
  const loadContext = () => {
    lsAccount = getFromStorage("wallet-account",true)
    if (typeof lsAccount !== "undefined") {
      setStateAccount(lsAccount)
    }
  }

  const setAccount = (e) => {
    setToStorage("wallet-account",e,true)
    setStateAccount(e)
  }

  return (
    <AppContext.Provider
      value={{
        account,
        setAccount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};