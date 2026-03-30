// frontend/src/App.tsx
import { useState } from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from './components/ConnectWallet';
import PasswordGenerator from './components/PasswordGenerator';
import PasswordVault from './components/PasswordVault';

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'vault'>('generator');
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-2xl flex items-center justify-center">
              🔐
            </div>
            <div>
              <h1 className="text-2xl font-bold">CryptoPassword</h1>
              <p className="text-xs text-gray-500">Decentralized Password Vault</p>
            </div>
          </div>

          <nav className="flex gap-8 text-sm">
            <button
              onClick={() => setActiveTab('generator')}
              className={`pb-1 transition-colors ${
                activeTab === 'generator' 
                  ? 'text-violet-400 border-b-2 border-violet-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`pb-1 transition-colors ${
                activeTab === 'vault' 
                  ? 'text-violet-400 border-b-2 border-violet-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Vault
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {!isConnected ? (
          <div className="flex justify-center pt-20">
            <ConnectWallet />
          </div>
        ) : (
          <div>
            {activeTab === 'generator' && <PasswordGenerator />}
            {activeTab === 'vault' && <PasswordVault />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-gray-500 mt-20">
        Passwords are encrypted client-side • Built with Solidity + React + Wagmi
      </footer>
    </div>
  );
}

export default App;
