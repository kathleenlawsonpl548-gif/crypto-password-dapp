






import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { Button } from './ui/Button';
import { Copy, RefreshCw, AlertCircle, Check } from 'lucide-react';

const CONTRACT_ABI = parseAbi([
  "function generatePassword(uint256 length, uint256 userSeed, bool includeUpper, bool includeLower, bool includeNumbers, bool includeSymbols) external returns (string)"
]);

// Replace with your deployed contract address after deployment
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // ← Update this!

export default function PasswordGenerator() {
  const { address, isConnected } = useAccount();
  
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [userSeed, setUserSeed] = useState<string>("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const generatePassword = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    // Use current timestamp + user input as seed for better entropy
    const seed = userSeed 
      ? BigInt(userSeed) 
      : BigInt(Date.now() + Math.floor(Math.random() * 1000000));

    try {
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'generatePassword',
        args: [
          BigInt(length),
          seed,
          includeUpper,
          includeLower,
          includeNumbers,
          includeSymbols
        ],
      });
    } catch (error) {
      console.error("Failed to generate password:", error);
      alert("Transaction failed. Check console for details.");
    }
  };

  // Listen for the PasswordGenerated event and update UI (simplified version)
  // In production, better to use useWatchContractEvent from wagmi

  const copyToClipboard = async () => {
    if (!generatedPassword) return;
    
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = () => {
    setGeneratedPassword("");
    generatePassword();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Password Generator</h2>
          <p className="text-gray-400">On-chain crypto password generator</p>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500 text-amber-400 p-4 rounded-2xl mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          Connect your wallet to generate passwords on-chain
        </div>
      )}

      <div className="space-y-6">
        {/* Password Length */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Password Length: <span className="font-mono text-white">{length}</span>
          </label>
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>8</span>
            <span>32</span>
          </div>
        </div>

        {/* Character Options */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="w-5 h-5 accent-violet-500"
            />
            <span className="text-white">Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="w-5 h-5 accent-violet-500"
            />
            <span className="text-white">Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-5 h-5 accent-violet-500"
            />
            <span className="text-white">Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-5 h-5 accent-violet-500"
            />
            <span className="text-white">Symbols (!@#$...)</span>
          </label>
        </div>

        {/* Custom Seed (Optional) */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Custom Seed (Optional - for extra entropy)
          </label>
          <input
            type="text"
            value={userSeed}
            onChange={(e) => setUserSeed(e.target.value)}
            placeholder="Enter any number or leave empty"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Using timestamp + randomness by default
          </p>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generatePassword}
          disabled={isPending || isConfirming || !isConnected}
          className="w-full py-4 text-lg font-semibold"
        >
          {isPending || isConfirming ? (
            "Generating on Blockchain..."
          ) : (
            "Generate Secure Password"
          )}
        </Button>

        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="mt-8 p-6 bg-zinc-950 border border-zinc-700 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">Your Generated Password</p>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            
            <div className="font-mono text-lg break-all bg-black p-4 rounded-xl border border-zinc-800 text-emerald-400">
              {generatedPassword}
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={regenerate} variant="outline" className="flex-1">
                Generate New
              </Button>
              <Button onClick={() => setGeneratedPassword("")} variant="outline" className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-center text-gray-500 mt-6">
          ⚠️ On-chain generation is for demonstration. 
          For maximum security, generate passwords client-side using Web Crypto API.
        </div>
      </div>
    </div>
  );
}
