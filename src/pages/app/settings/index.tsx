import { useEffect, useState } from "react";
import { BLOCKFROST_KEY_NAME, PRISM_RESOLVER_URL_KEY, FEATURES, MEDIATOR_DID } from "@/config";
import { useDatabase } from "@trust0/identus-react/hooks";
import { ThemeToggle } from "@/components/ThemeToggle";
import withLayout from "@/components/withLayout";

function SettingsPage() {
    const { state: dbState, getFeatures, getSettingsByKey, storeSettingsByKey } = useDatabase();
    const [blockfrostKey, setBlockfrostKey] = useState("");
    const [resolverUrl, setResolverUrl] = useState("");
    const [mediatorDID, setMediatorDID] = useState("");
    const [features, setFeatures] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);

    useEffect(() => {
        async function load() {
            if (dbState === "loaded") {
                const [blockfrost, prism, mediatorDID] = await Promise.all([
                    getSettingsByKey(BLOCKFROST_KEY_NAME),
                    getSettingsByKey(PRISM_RESOLVER_URL_KEY),
                    getSettingsByKey(MEDIATOR_DID)
                ]);
                if (blockfrost) {
                    setBlockfrostKey(blockfrost);
                }
                if (prism) {
                    setResolverUrl(prism);
                }
                if (mediatorDID) {
                    setMediatorDID(mediatorDID);
                }
            }
        }
        load();
    }, [dbState, getSettingsByKey]);

    const handleFeatureChange = (feature: string, checked: boolean) => {
        setFeatures(prev => {
            if (checked) {
                return [...prev, feature];
            } else {
                return prev.filter(f => f !== feature);
            }
        });
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            await Promise.all([
                storeSettingsByKey(BLOCKFROST_KEY_NAME, blockfrostKey),
                storeSettingsByKey(PRISM_RESOLVER_URL_KEY, resolverUrl),
                storeSettingsByKey(FEATURES, features.join(",")),
                storeSettingsByKey(MEDIATOR_DID, mediatorDID)
            ]);
            await getFeatures();
            setResult({
                success: true,
                message: "All settings successfully saved"
            });
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred"
            });
        } finally {
            setLoading(false);
        }
    };

    return (


            <div className="space-y-6">
                <div className="bg-background-light dark:bg-background-dark shadow-sm rounded-lg p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Theme
                            </label>
                            <div className="flex items-center gap-4">
                                <ThemeToggle />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Toggle between light and dark mode
                                </p>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="blockfrostKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Blockfrost API Key
                            </label>
                            <div className="mt-1 flex gap-4">
                                <input
                                    type="password"
                                    id="blockfrostKey"
                                    value={blockfrostKey}
                                    onChange={(e) => setBlockfrostKey(e.target.value)}
                                    placeholder="Enter your Blockfrost API key"
                                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                This API key is required for interacting with the Cardano blockchain.
                            </p>
                        </div>
                        <div>
                            <label htmlFor="resolverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mediator DID
                            </label>
                            <div className="mt-1 flex gap-4">
                                <input
                                    type="text"
                                    id="resolverUrl"
                                    value={mediatorDID}
                                    onChange={(e) => setMediatorDID(e.target.value)}
                                    placeholder="Enter the Mediator DID"
                                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                This URL is required for resolving PRISM DIDs.
                            </p>
                        </div>
                        <div>
                            <label htmlFor="resolverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                PRISM DID Resolver URL
                            </label>
                            <div className="mt-1 flex gap-4">
                                <input
                                    type="text"
                                    id="resolverUrl"
                                    value={resolverUrl}
                                    onChange={(e) => setResolverUrl(e.target.value)}
                                    placeholder="Enter the PRISM DID resolver URL"
                                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                This URL is required for resolving PRISM DIDs.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveAll}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save All Settings"}
                            </button>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
                        <p>{result.message}</p>
                    </div>
                )}
            </div>
      
    );
}


// Export the component wrapped with layout
export default withLayout(SettingsPage, {
    title: "Settings",
    description: "Configure your agent settings for blockchain interactions and DID resolution",
    pageHeader: true
}); 