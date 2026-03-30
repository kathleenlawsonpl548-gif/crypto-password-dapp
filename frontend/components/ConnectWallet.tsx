









import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Button } from './ui/Button'; // We'll create this simple button later
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (connector: any) => {
    try {
      setError(null);
      await connect({ connector });
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error(err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError(null);
  };

  // Auto-switch to Sepolia if on wrong network (recommended for this dApp)
  const targetChainId = 11155111; // Sepolia Testnet

  const isWrongNetwork = isConnected && chain?.id !== targetChainId;

  const switchToSepolia = () => {
    if (switchChain) {
      switchChain({ chainId: targetChainId });
    }
  };

  // Format address (e.g., 0x1234...abcd)
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isConnected ? (
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400 text-center mb-6 max-w-xs">
            Connect your wallet to generate passwords and access your secure vault
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className="flex items-center justify-center gap-3 py-3 text-base"
              >
                <Wallet className="w-5 h-5" />
                {connector.name === 'MetaMask' ? 'MetaMask' : connector.name}
              </Button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-3">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Connected as</p>
              <p className="font-mono text-white font-medium">
                {formatAddress(address!)}
              </p>
            </div>
          </div>

          {isWrongNetwork && (
            <div className="bg-amber-500/10 border border-amber-500 text-amber-400 px-4 py-3 rounded-xl text-sm w-full text-center">
              You are on the wrong network. Please switch to Sepolia Testnet.
              <button
                onClick={switchToSepolia}
                className="underline ml-2 hover:text-amber-300"
              >
                Switch Network
              </button>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
