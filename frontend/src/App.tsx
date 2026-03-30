import ConnectWallet from './components/ConnectWallet';

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto pt-20 px-6">
        <ConnectWallet />
        {/* Password Generator and Vault components will go here later */}
      </div>
    </div>
  );
}
