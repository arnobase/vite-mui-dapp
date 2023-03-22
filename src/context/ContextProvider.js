import React, { useEffect, useState } from "react";
import { setToStorage, getFromStorage } from "../lib/storage";
import { Keyring } from '@polkadot/api'

import { DAPP_NAME } from "../lib/constants"

export const AppContext = React.createContext();

export const ContextProvider = ({ children }) => {
  
  const [account, setStateAccount] = useState(undefined);
  const [dappName, setDappName] = useState(DAPP_NAME);
  const [queryPair, setQueryPair] = useState(new Keyring({ type: 'sr25519' }).addFromUri("//Alice"));
  
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

  const getInjector = async (account) => {
      const { getWalletBySource} = await import('@talismn/connect-wallets');
      const injector = await getWalletBySource(account.source);
      await injector.enable(dappName)
      return injector
  }
    
  const getSigner = async (account) => {
      const injector = await getInjector(account)
      const signer = injector.signer;
      return signer;
  };

  return (
    <AppContext.Provider
      value={{
        account,
        setAccount,
        queryPair,
        setQueryPair,
        getSigner,
        dappName, 
        setDappName
      }}
    >
      {children}
    </AppContext.Provider>
  );
};