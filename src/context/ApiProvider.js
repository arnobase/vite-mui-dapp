import { ApiPromise, WsProvider } from "@polkadot/api";
import { typeDefinitions } from '@polkadot/types'
import { types} from "@phala/sdk";
import React, { useState, useEffect } from "react";

export const ApiContext = React.createContext();

const WS_PROVIDER = "wss://phat-beta-node.phala.network/khala/ws";

export const ApiProvider = ({ children }) => {
  
  const [api, setapi] = useState();
  const [provider, setLocalProvider] = useState(new WsProvider(WS_PROVIDER));

  useEffect(() => {
    connectApi();
  }, []);

  const setProvider = (p) => {
    setLocalProvider(new WsProvider(p))
  }

  const connectApi = async () => {
    try { 
      //const provider = ;
      const api = await ApiPromise.create({ 
        provider,
        types: { ...types, ...typeDefinitions }
      });
      setapi(api);
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ApiContext.Provider
      value={{
        api,
        setProvider
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};