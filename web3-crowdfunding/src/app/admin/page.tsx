'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from "@/app/client";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { lightTheme, TransactionButton, useReadContract, useActiveAccount } from "thirdweb/react";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import { TierCard } from "@/components/TierCard";

// Withdrawable Campaign Card Component
const WithdrawableCampaignCard = ({ campaign, account, customSepolia, client }: {
    campaign: any;
    account: any;
    customSepolia: any;
    client: any;
}) => {
    const contract = getContract({
        client: client,
        chain: customSepolia,
        address: campaign.campaignAddress,
    });

    // Get campaign balance
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract: contract,
        method: "function getContractBalance() view returns (uint256)",
        params: [],
    });

    // Get campaign goal
    const { data: goal, isLoading: isLoadingGoal } = useReadContract({
        contract: contract,
        method: "function goal() view returns (uint256)",
        params: [],
    });

    // Get campaign status
    const { data: status, isLoading: isLoadingStatus } = useReadContract({
        contract: contract,
        method: "function getCampaignStatus() view returns (uint8)",
        params: [],
    });

    const isLoading = isLoadingBalance || isLoadingGoal || isLoadingStatus;
    const isSuccessful = status === 1 && balance && balance > 0n; // CampaignState.Successful = 1 AND has funds
    const canWithdraw = isSuccessful;

    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <div className="h-6 bg-white/10 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                    <div className="h-10 bg-white/10 rounded w-32"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                        <div className={`glass-card px-3 py-1 ${
                            isSuccessful 
                                ? "border border-emerald-400/30" 
                                : "border border-orange-400/30"
                        }`}>
                            <span className={`text-xs font-semibold ${
                                isSuccessful 
                                    ? "text-emerald-300" 
                                    : "text-orange-300"
                            }`}>
                                Status: {isSuccessful ? "Successful" : "Active"}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1 text-sm text-white/70">
                        <p><span className="font-medium">Balance:</span> {balance?.toString() || "0"} ETH</p>
                        <p><span className="font-medium">Goal:</span> {goal?.toString() || "0"} ETH</p>
                        <p><span className="font-medium">Progress:</span> {goal && balance ? `${(Number(balance) / Number(goal) * 100).toFixed(1)}%` : "0%"}</p>
                    </div>
                </div>
                <div className="ml-4 flex gap-3">
                    {/* View on Explorer Button */}
                    <button
                        onClick={() => window.open(`https://sepolia.etherscan.io/address/${campaign.campaignAddress}`, '_blank')}
                        className="glass-button px-4 py-2"
                    >
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View on Explorer
                        </span>
                    </button>

                    {/* Withdraw Button */}
                    {canWithdraw ? (
                        <TransactionButton
                            transaction={() => prepareContractCall({
                                contract: contract,
                                method: "function withdraw()",
                                params: [],
                            })}
                            onTransactionConfirmed={async () => {
                                alert(`Successfully withdrew ${balance?.toString()} ETH to your wallet!`);
                            }}
                            onError={(error) => {
                                alert(`Error withdrawing funds: ${error.message}`);
                            }}
                            theme={lightTheme()}
                            className="glass-button px-4 py-2"
                        >
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Withdraw {balance?.toString()} ETH
                            </span>
                        </TransactionButton>
                    ) : (
                        <div className="glass-card px-4 py-2 opacity-50">
                            <span className="flex items-center text-white/70">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {!isSuccessful ? "Goal Not Reached" : "No Funds Available"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Custom Sepolia chain configuration with explicit RPC
const customSepolia = {
  ...sepolia,
  rpc: "https://ethereum-sepolia.publicnode.com"
};

const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

export default function AdminPage() {
    const [mounted, setMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newTierName, setNewTierName] = useState('');
    const [newTierAmount, setNewTierAmount] = useState('');
    const router = useRouter();
    const account = useActiveAccount();

    useEffect(() => {
        setMounted(true);
    }, []);

    const factoryContract = getContract({
        client: client,
        chain: customSepolia,
        address: CROWDFUNDING_FACTORY,
    });

    // Get all campaigns
    const { data: campaigns, isLoading: isLoadingCampaigns, refetch } = useReadContract({
        contract: factoryContract,
        method: "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
        params: []
    });

    // Get tiers for the campaign being edited
    const editingContract = editingCampaign ? getContract({
        client: client,
        chain: customSepolia,
        address: editingCampaign,
    }) : null;

    const { data: editingTiers, isLoading: isLoadingEditingTiers, refetch: refetchTiers } = useReadContract({
        contract: editingContract || getContract({
            client: client,
            chain: customSepolia,
            address: "0x0000000000000000000000000000000000000000", // Dummy address when no campaign is selected
        }),
        method: "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])",
        params: []
    });

    const handleLogin = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid password');
        }
    }, [password]);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setPassword('');
        setError('');
    }, []);

    const handleEditCampaign = useCallback((campaignAddress: string) => {
        setEditingCampaign(campaignAddress);
        setShowEditModal(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setShowEditModal(false);
        setEditingCampaign(null);
        setNewTierName('');
        setNewTierAmount('');
    }, []);

    const handleRemoveCampaign = useCallback(async (campaignAddress: string) => {
        if (confirm('Are you sure you want to remove this campaign? This action cannot be undone.')) {
            // The actual removal will be handled by the TransactionButton
            console.log('Removing campaign:', campaignAddress);
        }
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
                <div className="glass-card p-8 text-center">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
                        <h1 className="text-2xl font-bold text-white mb-2">Loading Admin Panel...</h1>
                        <p className="text-white/70">Please wait while we initialize the admin interface</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
                </div>
                
                <div className="relative z-10 max-w-md w-full mx-4">
                    <div className="glass-card p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
                            <p className="text-white/70">Enter your credentials to access the admin panel</p>
                        </div>
                        
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-3">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 glass-card border-0 text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300"
                                    placeholder="Enter admin password"
                                    required
                                />
                            </div>
                            {error && (
                                <div className="glass-card p-3 border border-red-400/30">
                                    <p className="text-red-300 text-sm flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </p>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="glass-button w-full py-3 text-lg font-semibold"
                            >
                                <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Login to Admin Panel
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
                            <p className="text-white/70">Manage campaigns and system settings</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/')}
                                className="glass-button px-4 py-2"
                            >
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Back to Home
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 backdrop-blur-md bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl text-red-300 font-semibold transition-all duration-300 hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/50"
                            >
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Total Campaigns</h3>
                        </div>
                        <p className="text-3xl font-bold text-emerald-400">
                            {isLoadingCampaigns ? '...' : campaigns?.length || 0}
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Active Campaigns</h3>
                        </div>
                        <p className="text-3xl font-bold text-blue-400">
                            {isLoadingCampaigns ? '...' : campaigns?.length || 0}
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">System Status</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-400">Online</p>
                    </div>
                </div>

                {/* Campaigns Management */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Campaign Management</h2>
                    
                    {!account && (
                        <div className="glass-card p-4 mb-6 border border-yellow-400/30">
                            <p className="text-yellow-200 text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <strong>Connect Wallet:</strong> To manage campaigns, please connect your wallet first. 
                                You can only remove campaigns that you created.
                            </p>
                        </div>
                    )}
                    
                    <div className="glass-card p-4 mb-6 border border-blue-400/30">
                        <p className="text-blue-200 text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <strong>Admin Panel:</strong> You can view all campaigns and remove campaigns you created. 
                            {account ? " Your campaigns are marked with a green badge, others with orange." : " Connect your wallet to see campaign ownership."}
                        </p>
                    </div>
                    
                    {isLoadingCampaigns ? (
                        <div className="glass-card p-8 text-center">
                            <div className="animate-pulse">
                                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
                                <p className="text-white/70">Loading campaigns...</p>
                            </div>
                        </div>
                    ) : campaigns && campaigns.length > 0 ? (
                        <div className="space-y-4">
                            {campaigns.map((campaign, index) => {
                                const isOwner = account && campaign.owner.toLowerCase() === account.address.toLowerCase();
                                
                                return (
                                    <div key={index} className="glass-card p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                                                    {isOwner ? (
                                                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full font-semibold">
                                                            Your Campaign
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full font-semibold">
                                                            Other Campaign
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-sm text-white/70">
                                                    <p><span className="font-medium">Address:</span> {campaign.campaignAddress}</p>
                                                    <p><span className="font-medium">Owner:</span> {campaign.owner}</p>
                                                    <p><span className="font-medium">Created:</span> {new Date(parseInt(campaign.creationTime.toString()) * 1000).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${campaign.campaignAddress}`, '_blank')}
                                                    className="glass-button px-3 py-2 text-sm"
                                                >
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Explorer
                                                    </span>
                                                </button>
                                                
                                                {/* Edit campaign - only for campaigns you created */}
                                                <button
                                                    onClick={() => handleEditCampaign(campaign.campaignAddress)}
                                                    disabled={!isOwner}
                                                    className={`px-3 py-2 text-white rounded-xl text-sm transition-all duration-300 ${
                                                        isOwner 
                                                            ? "glass-button" 
                                                            : "bg-gray-500/50 cursor-not-allowed opacity-50"
                                                    }`}
                                                >
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        {isOwner ? "Edit" : "Cannot Edit"}
                                                    </span>
                                                </button>
                                                
                                                {/* Remove campaign - works for campaigns you created */}
                                                <TransactionButton
                                                    transaction={() => prepareContractCall({
                                                        contract: factoryContract,
                                                        method: "function removeCampaign(address _campaignAddress)",
                                                        params: [campaign.campaignAddress]
                                                    })}
                                                    onTransactionConfirmed={async () => {
                                                        alert("Campaign removed successfully!");
                                                        refetch();
                                                    }}
                                                    onError={(error) => {
                                                        if (error.message.includes("Not the campaign owner")) {
                                                            alert("You can only remove campaigns that you created. To remove other campaigns, you need to deploy the updated contract with admin functions.");
                                                        } else {
                                                            alert(`Error: ${error.message}`);
                                                        }
                                                    }}
                                                    theme={lightTheme()}
                                                    className={`px-3 py-2 text-white rounded-xl text-sm transition-all duration-300 ${
                                                        isOwner 
                                                            ? "backdrop-blur-md bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/50" 
                                                            : "bg-gray-500/50 cursor-not-allowed opacity-50"
                                                    }`}
                                                >
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        {isOwner ? "Remove" : "Not Yours"}
                                                    </span>
                                                </TransactionButton>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                                <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">No Campaigns Found</h3>
                            <p className="text-white/70">No campaigns have been created yet.</p>
                        </div>
                    )}
                </div>

                {/* Withdraw Funds Section */}
                <div className="glass-card p-6 mt-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h2>
                    <p className="text-white/70 mb-6">Withdraw funds from your successful campaigns that have reached their goal.</p>
                    
                    {!account && (
                        <div className="glass-card p-4 mb-6 border border-yellow-400/30">
                            <p className="text-yellow-200 text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <strong>Connect Wallet:</strong> Please connect your wallet to withdraw funds from your campaigns.
                            </p>
                        </div>
                    )}
                    
                    {account && campaigns && campaigns.length > 0 && (
                        <div className="space-y-4">
                            {campaigns
                                .filter(campaign => account && campaign.owner.toLowerCase() === account.address.toLowerCase())
                                .map((campaign, index) => (
                                    <WithdrawableCampaignCard
                                        key={index}
                                        campaign={campaign}
                                        account={account}
                                        customSepolia={customSepolia}
                                        client={client}
                                    />
                                ))}
                            
                            {campaigns.filter(campaign => account && campaign.owner.toLowerCase() === account.address.toLowerCase()).length === 0 && (
                                <div className="glass-card p-8 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Campaigns to Withdraw</h3>
                                    <p className="text-white/70">You don&apos;t have any campaigns that are eligible for withdrawal.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* System Actions */}
                <div className="glass-card p-6 mt-6">
                    <h2 className="text-2xl font-bold text-white mb-6">System Actions</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => refetch()}
                            className="glass-button px-4 py-2"
                        >
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to pause the factory? This will prevent new campaigns from being created.')) {
                                    // Add pause functionality here if needed
                                    alert('Factory pause functionality not implemented yet.');
                                }
                            }}
                            className="px-4 py-2 backdrop-blur-md bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl text-yellow-300 font-semibold transition-all duration-300 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400/50"
                        >
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pause Factory
                            </span>
                        </button>
                    </div>
                </div>

                {/* Edit Campaign Modal */}
                {showEditModal && editingCampaign && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="glass-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white">Edit Campaign</h3>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-white/70 hover:text-white text-2xl transition-colors duration-300"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-white/90 mb-2 font-medium">Campaign Address:</p>
                                <p className="text-emerald-400 text-sm font-mono break-all bg-white/5 p-3 rounded-lg">{editingCampaign}</p>
                            </div>

                            {/* Current Tiers */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-4">Current Tiers</h4>
                                {isLoadingEditingTiers ? (
                                    <div className="glass-card p-8 text-center">
                                        <div className="animate-pulse">
                                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
                                            <p className="text-white/70">Loading tiers...</p>
                                        </div>
                                    </div>
                                ) : editingTiers && editingTiers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {editingTiers.map((tier, index) => (
                                            <TierCard
                                                key={index}
                                                tier={tier}
                                                index={index}
                                                contract={editingContract!}
                                                isEditing={false}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="glass-card p-8 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <p className="text-white/70">No tiers available</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Tier */}
                            <div className="border-t border-white/10 pt-6">
                                <h4 className="text-lg font-semibold text-white mb-4">Add New Tier</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/90 mb-2">
                                            Tier Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newTierName}
                                            onChange={(e) => setNewTierName(e.target.value)}
                                            className="w-full px-4 py-3 glass-card border-0 text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300"
                                            placeholder="e.g., Bronze Supporter"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/90 mb-2">
                                            Amount (USD)
                                        </label>
                                        <input
                                            type="number"
                                            value={newTierAmount}
                                            onChange={(e) => setNewTierAmount(e.target.value)}
                                            className="w-full px-4 py-3 glass-card border-0 text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300"
                                            placeholder="e.g., 10"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                
                                <TransactionButton
                                    transaction={() => prepareContractCall({
                                        contract: editingContract!,
                                        method: "function addTier(string _name, uint256 _amount)",
                                        params: [newTierName, BigInt(newTierAmount)]
                                    })}
                                    onTransactionConfirmed={async () => {
                                        alert("Tier added successfully!");
                                        setNewTierName('');
                                        setNewTierAmount('');
                                        refetchTiers();
                                    }}
                                    onError={(error) => {
                                        alert(`Error adding tier: ${error.message}`);
                                    }}
                                    theme={lightTheme()}
                                    className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!newTierName.trim() || !newTierAmount.trim()}
                                >
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Tier
                                    </span>
                                </TransactionButton>
                            </div>

                            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-white/10">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="glass-button px-6 py-2"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
