'use client';
import { ConnectButton, lightTheme } from "thirdweb/react";
import { client } from "@/app/client";

export default function ConnectWalletPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
            <div className="max-w-md w-full bg-green-800/50 backdrop-blur-md rounded-lg shadow-xl p-8 text-center border border-green-600/30">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
                    <p className="text-green-200 mb-6">
                        Connect your wallet to access your dashboard and manage your conservation campaigns.
                    </p>
                </div>
                
                <div className="mb-6">
                    <ConnectButton 
                        client={client}
                        theme={lightTheme()}
                        connectButton={{
                            label: "Connect Wallet",
                            style: {
                                backgroundColor: "#16a34a",
                                color: "white",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "600",
                            }
                        }}
                    />
                </div>
                
                <div className="text-sm text-green-300">
                    <p>Once connected, you'll be able to:</p>
                    <ul className="mt-2 space-y-1 text-left">
                        <li>• Create conservation campaigns</li>
                        <li>• Manage your projects</li>
                        <li>• Track funding progress</li>
                        <li>• Withdraw funds when successful</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}


