import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FaKey, FaTrash, FaPlus, FaCopy, FaCheck } from "react-icons/fa";
import styles from "./admin-pages.module.css";
// Reuse styles from admin pages or create inline if needed

export function ApiKeysManagement() {
    const keys = useQuery(api.apiKeys.listKeys);
    const generateKey = useMutation(api.apiKeys.generateKey);
    const revokeKey = useMutation(api.apiKeys.revokeKey);

    const [newKey, setNewKey] = useState<string | null>(null);
    const [keyName, setKeyName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyName.trim()) return;

        setIsGenerating(true);
        try {
            const key = await generateKey({ name: keyName });
            setNewKey(key);
            setKeyName("");
        } catch (err) {
            console.error("Failed to generate key", err);
            alert("Failed to generate key. Are you an admin?");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevoke = async (id: any) => {
        if (confirm("Are you sure you want to revoke this key? It will stop working immediately.")) {
            try {
                await revokeKey({ id });
            } catch (err) {
                console.error("Failed to revoke key", err);
            }
        }
    };

    const copyToClipboard = () => {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!keys) {
        return <div className="text-gray-400">Loading keys...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">API Keys Management</h2>
                <p className="text-sm text-gray-400">
                    Manage API keys for external devices (IoT/Python Scripts)
                </p>
            </div>

            {/* New Key Modal / Display */}
            {newKey && (
                <div className="bg-green-900/30 border border-green-500/50 p-4 rounded-lg mb-6 animate-fade-in">
                    <h3 className="text-green-400 font-bold mb-2">New Key Generated!</h3>
                    <p className="text-sm text-gray-300 mb-2">
                        Please copy this key now. You will not be able to see it again.
                    </p>
                    <div className="flex items-center gap-2 bg-black/50 p-3 rounded font-mono text-lg text-white break-all">
                        <span className="flex-1">{newKey}</span>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                        </button>
                    </div>
                    <button
                        onClick={() => setNewKey(null)}
                        className="mt-4 text-sm text-gray-400 hover:text-white underline"
                    >
                        Done (I have copied it)
                    </button>
                </div>
            )}

            {/* Generate Form */}
            <form onSubmit={handleGenerate} className="bg-[#1a1f2e] p-4 rounded-lg border border-gray-800 flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">New Key Description</label>
                    <input
                        type="text"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="e.g. Main Gate Python Script"
                        className="w-full bg-black/30 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isGenerating || !keyName.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2 transition-colors h-[42px]"
                >
                    {isGenerating ? "Generating..." : <><FaPlus /> Generate Key</>}
                </button>
            </form>

            {/* Keys List */}
            <div className="bg-[#1a1f2e] rounded-lg border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black/20 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Key Prefix</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Last Used</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {keys.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                    No API keys found.
                                </td>
                            </tr>
                        ) : (
                            keys.map((key) => (
                                <tr key={key._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{key.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {key.key.substring(0, 7)}...
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${key.isActive
                                                    ? "bg-green-500/10 text-green-500"
                                                    : "bg-red-500/10 text-red-500"
                                                }`}
                                        >
                                            {key.isActive ? "ACTIVE" : "REVOKED"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {key.lastUsed
                                            ? new Date(key.lastUsed).toLocaleString()
                                            : "Never"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {key.isActive && (
                                            <button
                                                onClick={() => handleRevoke(key._id)}
                                                className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-900/20 transition-colors"
                                                title="Revoke Key"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
