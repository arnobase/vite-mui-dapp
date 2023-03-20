import React from 'react';

// Phala sdk beta!!
// install with `yarn add @phala/sdk@beta`
import { signCertificate, create } from "@phala/sdk";
import { PinkContractPromise, OnChainRegistry, types as PhalaTypes } from '@phala/sdk'

import { Keyring } from '@polkadot/api'

import { useContext } from "react";
import { useEffect, useState } from "react";

import { AppContext } from "../context/ContextProvider";
import { ApiContext } from '../context/ApiProvider';

import metadata from "../metadata/phat2meet.json";

export function ContractCall() {

  const [certificateData, setCertificateData] = useState();
  const [contract, setContract] = useState();
  const { account } = useContext(AppContext);
  const { api, setProvider } = useContext(ApiContext);

  useEffect(()=>{
    if (api) {
      loadContract()
    }
  }, [api])

  useEffect(() => {
    setCertificateData(undefined);
  }, [account]);

  const getInjector = async (account) => {
    console.log("getinjector")
      const { getWalletBySource} = await import('@talismn/connect-wallets');
      const injector = await getWalletBySource(account.source);
      await injector.enable('My dapp')
      return injector
  }
    
  const getSigner = async (account) => {
    console.log("getSigner")
      const injector = await getInjector(account)
      const signer = injector.signer;
      return signer;
  };
  
  const loadContract = async () => {
    try {
      setProvider('wss://phat-beta-node.phala.network/khala/ws')
      
      const pruntimeURL="https://phat-fr.01.do/node-1/"
      const codeHash = "0xcab37b387b2e15c6758dcade3f340d16aca3e0c0f18c94e485c103442a8bbcfa"
      /*
      const contractKeyQuery = await api.query.phalaRegistry.contractKeys(codeHash)
      const contractKey = contractKeyQuery.toString()
      console.log("contractKey",contractKey)
      //const contractKey="0x1a83b5232d06181c5056d150623e24865b32dc91a6e1baa742087a005ff8fb1b"
      const contractInstance = await create({ api, baseURL: pruntimeURL, contractKey })
      console.log("instance", contractInstance)
      const contractPromise = new ContractPromise(
        contractInstance.api,
        JSON.parse(metadata),
        contractId
      );
      console.log("promise", contractPromise)*/

      console.log(OnChainRegistry)
      //const phatRegistry = await OnChainRegistry.create(api)
      const phatRegistry = await OnChainRegistry.create(api, { 
        //pruntimeURL: 'https://phat-qc.01.do/node-1-1/'
        //pruntimeURL: 'https://phat-qc.01.do/node-1-2/'
        //pruntimeURL: 'https://phat-qc.01.do/node-3-1/'
        //pruntimeURL: 'https://phat-qc.01.do/node-3-2/'
        //pruntimeURL: 'https://phat-fr.01.do/node-1/'
        pruntimeURL: 'https://phat-fr.01.do/node-2/'
      })
      const contractId = '0x1a83b5232d06181c5056d150623e24865b32dc91a6e1baa742087a005ff8fb1b'
      //const abi = JSON.parse(fs.readFileSync('../metadatas/phat2meet.json'))
      const abi = JSON.parse(JSON.stringify(metadata))
      const contractKey = await phatRegistry.getContractKey(contractId)
      //console.log("phatRegistry",phatRegistry)
      const contract = new PinkContractPromise(api, phatRegistry, abi, contractId, contractKey)
      console.log("contract:",contract)
      setContract(contract)
      console.log("Contract loaded successfully");
    } catch (err) {
      console.log("Error in contract loading",err);
      throw err;
    }
  };


  // query vith beta sdk
  const doQuery = async () => {
  
      const keyring = new Keyring({ type: 'sr25519' });
      const pair = keyring.addFromUri("//Alice");
    
      const message = await contract.query.get(pair)
      console.log('message:', message)
  }
  
  const onSignCertificate = async () => {
    console.log("onSignCertificate")
    if (account && api) {
      try {
        const signer = await getSigner(account);
        console.log("setCertificateData")
        // Save certificate data to state, or anywhere else you want like local storage
        const keyring = new Keyring()
        const alice_pair = keyring.addFromUri("//Alice");
        setCertificateData(
          await signCertificate({
            api,
            account,
            signer,
          })
        );
        console.log("Certificate signed")
        //toaster.positive("Certificate signed", {});
      } catch (err) {
        console.log(err)
        //toaster.negative((err).message, {});
      }
    }
  };

  const doTx = async () => {
    if (!contract) return;

    const signer = await getSigner(account);
    // costs estimation
    console.log("1")
    const { gasRequired, storageDeposit } = await contract.query.setValue({ account: account, signer }, 'coucou les toutous')
    console.log('gasRequired & storageDeposit: ', gasRequired, storageDeposit)
    // transaction / extrinct
    const options = {
        gasLimit: gasRequired.refTime,
        storageDepositLimit: storageDeposit.isCharge ? storageDeposit.asCharge : null,
    }
    await contract.tx
    .setValue(options, 'Coucou les toutous')
    .signAndSend(account.address, { signer }, (status) => {
      if (status.isInBlock) {
          console.log("In Block")
      }
      if (status.isCompleted) {
          console.log("Completed")
      }
    })
  };

  return (<>
        <button disabled={!contract} onClick={doQuery}>
          do Query
        </button>
        <button disabled={!contract} onClick={doTx}>
          do Tx
        </button>
    </>)
};

