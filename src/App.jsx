import * as React from "react";
import Container from "@mui/material/Container";
import { Content } from "./components/Content"
import { ContextProvider } from "./context/ContextProvider";
import { AccountSelect } from "./components/AccountSelect";
import { ContractCall } from "./components/ContractCall";
import { Grid } from "@mui/material";
import Typography from '@mui/material/Typography';
import { ApiProvider } from "./context/ApiProvider";


export default function App() {
  return (
      <ContextProvider>
        <ApiProvider>
          <Container sx={{
          pt: 2
          //backgroundColor: 'primary.dark',
          
        }} maxWidth="md">
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="h3" gutterBottom>
                  Dapp template
                </Typography>
              </Grid>
              <Grid item container justifyContent="flex-end" xs={4}>
                <AccountSelect />
              </Grid>
              <Grid item xs={12}>
                <Content />
                <ContractCall />
              </Grid>
            </Grid>
          </Container>
        </ApiProvider>
      </ContextProvider>
  );
}
