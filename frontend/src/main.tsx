import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Wagmi + Viem imports
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, injected } from 'wagmi/connectors';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Wagmi Configuration
const config = createConfig({
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http('https://rpc.sepolia.org'),           // Public Sepolia RPC
    [hardhat.id]: http('http://127.0.0.1:8545'),            // Local Hardhat node
  },
  connectors: [
    injected(),          // Generic injected wallet (MetaMask, etc.)
    metaMask(),          // MetaMask specific
  ],
  ssr: false,
});

// Optional: Add more connectors if needed
// coinbaseWallet(), walletConnect(), etc.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
