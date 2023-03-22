import React, { useEffect, useState } from "react";
import { setToStorage, getFromStorage } from "../lib/storage";
import { Keyring } from '@polkadot/api'
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { DAPP_NAME } from "../lib/constants"

export const AppContext = React.createContext();

export const ContextProvider = ({ children }) => {
  
  const [account, setStateAccount] = useState(undefined);
  const [dappName, setDappName] = useState(DAPP_NAME);
  const [queryPair, setQueryPair] = useState();
  
  let lsAccount = undefined;

  useEffect(()=>{
    const load = async () => {
      await cryptoWaitReady().catch(console.error);
      loadContext()
    }
    load().catch(console.error);
    
  },[])
  
  const loadContext = () => {
    setQueryPair(new Keyring({ type: 'sr25519' }).addFromUri("//Alice"))
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