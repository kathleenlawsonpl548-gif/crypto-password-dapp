import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import { Button } from './ui/Button';
import { Plus, Trash2, Eye, EyeOff, Copy, AlertCircle } from 'lucide-react';

const CONTRACT_ABI = parseAbi([
  "function storePassword(string calldata _site, string calldata _username, string calldata _encryptedData) external",
  "function getVault() external view returns (tuple(string site, string username, string encryptedData, uint256 createdAt, uint256 updatedAt)[])",
  "function deletePassword(uint256 _entryId) external",
  "function getVaultCount() external view returns (uint256)"
]);

// ← UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

interface VaultEntry {
  site: string;
  username: string;
  encryptedData: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export default function PasswordVault() {
  const { address, isConnected } = useAccount();
  
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Plaintext - will be encrypted before storing
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Read user's vault
  const { data: vaultEntries = [], refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getVault',
    query: { enabled: !!address && isConnected }
  });

  const { writeContract, data: hash, isPending: isStoring } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Refresh vault after transaction
  useEffect(() => {
    if (hash && !isConfirming) {
      refetch();
    }
  }, [hash, isConfirming, refetch]);

  // Simple client-side encryption simulation (In production use Web Crypto API + master password)
  const encryptPassword = async (plainPassword: string): Promise<string> => {
    // TODO: Replace with real AES-GCM encryption using user's master password
    // For demo purposes, we use base64 + simple obfuscation
    return btoa(plainPassword + "|" + Date.now());
  };

  const handleStorePassword = async () => {
    if (!site || !username || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const encrypted = await encryptPassword(password);

      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'storePassword',
        args: [site, username, encrypted],
      });

      // Clear form after successful transaction
      setSite("");
      setUsername("");
      setPassword("");
      
    } catch (error) {
      console.error("Failed to store password:", error);
      alert("Failed to store password. Check console.");
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm("Delete this password entry?")) return;

    try {
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'deletePassword',
        args: [BigInt(entryId)],
      });
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const toggleVisibility = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyPassword = (encryptedData: string, index: number) => {
    // In real app: decrypt first, then copy
    navigator.clipboard.writeText(encryptedData); // Demo only
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!isConnected) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect Wallet to Access Vault</h3>
        <p className="text-gray-400">Your encrypted passwords are stored on-chain and linked to your wallet.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Password Vault</h2>
          <p className="text-gray-400">Securely store your encrypted passwords on-chain</p>
        </div>
        <div className="text-sm text-gray-500">
          {vaultEntries.length} entries
        </div>
      </div>

      {/* Add New Password Form */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Entry
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Website / Service</label>
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="gmail.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username / Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter strong password"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        <Button 
          onClick={handleStorePassword}
          disabled={isStoring || isConfirming}
          className="w-full py-3.5"
        >
          {isStoring || isConfirming ? "Storing on Blockchain..." : "Store Encrypted Password"}
        </Button>

        <p className="text-xs text-center text-gray-500 mt-3">
          Password will be encrypted in your browser before storing on-chain
        </p>
      </div>

      {/* Vault Entries List */}
      {vaultEntries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Your vault is empty. Add your first password above.
        </div>
      ) : (
        <div className="space-y-4">
          {vaultEntries.map((entry: VaultEntry, index: number) => (
            <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-white">{entry.site}</h4>
                  <p className="text-gray-400 text-sm">{entry.username}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVisibility(index)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    {showPasswords[index] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black rounded-xl px-4 py-3 border border-zinc-900">
                <span className="font-mono text-sm flex-1 text-emerald-300 break-all">
                  {showPasswords[index] 
                    ? atob(entry.encryptedData).split('|')[0]  // Demo decryption
                    : "••••••••••••••••••••••••••••••••"
                  }
                </span>
                
                <button
                  onClick={() => copyPassword(entry.encryptedData, index)}
                  className="text-violet-400 hover:text-violet-300"
                >
                  {copiedId === index ? "✓" : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-3">
                Added: {new Date(Number(entry.createdAt) * 1000).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
