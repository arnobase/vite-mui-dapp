import React from 'react';

import { useContext } from "react";
import { AppContext } from "../context/ContextProvider";
import { useState, useEffect } from 'react';

import { Box } from '@mui/material';

export function Content() {
  
  const { account } = useContext(AppContext);
  const [localValue, setLocalValue] = useState()

  useEffect(()=>{
    //setLocalValue({account})
  },[account])

  return (<>
    <Box>{account?.name}</Box>
  </>);
  
}
