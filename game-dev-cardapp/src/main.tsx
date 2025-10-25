import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider, useSuiClientContext } from "@mysten/dapp-kit";
import { WalletProvider as CustomWalletProvider } from "./contexts/WalletContext";
import "@mysten/dapp-kit/dist/index.css";
import "./index.css";
import App from "./App";
import { useEffect } from 'react';
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki';
import { networkConfig } from "./config/networkConfig";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

function RegisterEnokiWallets() 
{
	const { client, network } = useSuiClientContext();
	useEffect(() => 
  {
		if (!isEnokiNetwork(network)) 
    {
      console.log("not enoki network => ", network)
      return;
    }
    console.log("is enoki network => ", network)
		const { unregister } = registerEnokiWallets(
    {
			apiKey: 'enoki_public_4da3416a611e1f1a101655899890dfba',
			providers: 
      {
				// Provide the client IDs for each of the auth providers you want to use:
				google: 
        {
					clientId: '551636460599-cj9i3aqcup5a14983ri5g48a4u1nba6g.apps.googleusercontent.com',
				}
			},
			client,
			network,
		});
    console.log("✅ Enoki wallets registered");
		return unregister;
	}, [client, network]);
	return null;
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <RegisterEnokiWallets />
          <WalletProvider autoConnect>
            <CustomWalletProvider>
              <App />
            </CustomWalletProvider>
          </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>
);
