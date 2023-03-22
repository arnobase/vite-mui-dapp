import React, { useRef, useContext, useEffect, useState } from 'react';

// Phala sdk beta!!
// install with `yarn add @phala/sdk@beta`
// tested and working with @phala/sdk@0.4.0-nightly-20230318
import { PinkContractPromise, OnChainRegistry } from '@phala/sdk'

import { AppContext } from "../context/ContextProvider";
import { ApiContext } from '../context/ApiProvider';

import metadata from "../metadata/phat2meet.json";

import { Box } from '@mui/material';

export function ContractCall() {

  const [contract, setContract] = useState();
  const [phatMessage, setPhatMessage] = useState();
  const { account, queryPair, getSigner } = useContext(AppContext);

  const { api, setProvider } = useContext(ApiContext);

  const messageInput = useRef();

  useEffect(()=>{
    if (api) {
      loadContract()
    }
  }, [api])
  
  const loadContract = async () => {
    
        try {
          setProvider('wss://phat-beta-node.phala.network/khala/ws')
          
          //const pruntimeURL="https://phat-fr.01.do/node-1/"

          // contract ID on phat-cb (contract address on polkadot.js.org/apps)
          const contractId = "0xcab37b387b2e15c6758dcade3f340d16aca3e0c0f18c94e485c103442a8bbcfa"
          // codeHash on phat-cb
          //   const codeHash = "0x021907a3b977388df0cf9d098438c42d0369cc0791ddf6b4043d69de11d57dd8"

          const phatRegistry = await OnChainRegistry.create(api)

          const abi = JSON.parse(JSON.stringify(metadata))
          const contractKey = await phatRegistry.getContractKey(contractId)

          console.log("contractKey",contractKey)
          // --> 0x1a83b5232d06181c5056d150623e24865b32dc91a6e1baa742087a005ff8fb1b

          const contract = new PinkContractPromise(api, phatRegistry, abi, contractId, contractKey)

          console.log("contract:",contract.abi.messages.map((e)=>{return e.method}))
          // contract: Array [ "get", "setValue" ]

          setContract(contract)
          console.log("Contract loaded successfully");
        } catch (err) {
          console.log("Error in contract loading",err);
          throw err;
        }
      
  };

  // query vith beta sdk
  const doQuery = async () => {
      // for a query (readonly) we use the "queryPair" account, init with "//Alice"
      const message = await contract.query.get(queryPair);
      setPhatMessage(message.output.toHuman());
      console.log('message:', message.output.toHuman())
  }

  // function to send a tx, in this example we call setValue
  const doTx = async (message) => {
    console.log(message)
    if (!contract) return;

    const signer = await getSigner(account);
    // costs estimation
    const { gasRequired, storageDeposit } = await contract.query['setValue']({ account: account, signer }, message)
    console.log('gasRequired & storageDeposit: ', gasRequired, storageDeposit)
    // transaction / extrinct
    const options = {
        gasLimit: gasRequired.refTime,
        storageDepositLimit: storageDeposit.isCharge ? storageDeposit.asCharge : null,
    }

    const tx = await contract.tx
    .setValue(options, message)
    .signAndSend(account.address, { signer }, ({ events = [], status, txHash }) => {
      if (status.isInBlock) {
          console.log("In Block")
      }
      if (status.isCompleted) {
          console.log("Completed")
      }
      if (status.isFinalized) {
        console.log(`Transaction included at blockHash ${status.asFinalized}`);
        console.log(`Transaction hash ${txHash.toHex()}`);
  
        // Loop through Vec<EventRecord> to display all events
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
        });
      }
    })
  };

  return (<>
        <Box>
          <button disabled={!(contract)} onClick={doQuery}>
            do Query
          </button>
          <span>{phatMessage}</span>
        </Box>
        <Box>
          <input type="text" ref={messageInput}></input>
          <button disabled={!(contract&&account?.address)} onClick={() => doTx(messageInput.current.value)}>
            do Tx
          </button>
        </Box>
    </>)
};

