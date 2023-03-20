import { khalaDev } from "@phala/typedefs";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { types} from "@phala/sdk";

export const createApi = async (endpoint) => {
  const wsProvider = new WsProvider(endpoint);

  const api = await ApiPromise.create({
    provider: wsProvider,
    types: {
      ...khalaDev,
      ...types,
    },
  });

  return api;
};