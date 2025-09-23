'use client';
import { client } from "@/app/client";
import Link from "next/link";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

// Custom Sepolia chain configuration with explicit RPC
const customSepolia = {
  ...sepolia,
  rpc: "https://ethereum-sepolia.publicnode.com"
};

type CampaignCardProps = {
    campaignAddress: string;
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaignAddress }) => {
    const contract = getContract({
        client: client,
        chain: customSepolia,
        address: campaignAddress,
    });

    // Get Campaign Name
    const {data: campaignName} = useReadContract({
        contract: contract,
        method: "function name() view returns (string)",
        params: []
    });

    // Get Campaign Description
    const {data: campaignDescription} = useReadContract({
        contract: contract,
        method: "function description() view returns (string)",
        params: []
    });

    // Goal amount of the campaign
    const { data: goal, isLoading: isLoadingGoal } = useReadContract({
        contract: contract,
        method: "function goal() view returns (uint256)",
        params: [],
    });

    // Total funded balance of the campaign
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract: contract,
        method: "function getContractBalance() view returns (uint256)",
        params: [],
    });

    // Get campaign status
    const { data: status, isLoading: isLoadingStatus } = useReadContract({
        contract: contract,
        method: "function getCampaignStatus() view returns (uint8)",
        params: [],
    });

    // Calulate the total funded balance percentage
    const totalBalance = balance?.toString();
    const totalGoal = goal?.toString();
    let balancePercentage = (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

    // If balance is greater than or equal to goal, percentage should be 100
    if (balancePercentage >= 100) {
        balancePercentage = 100;
    }

    return (
        <div className="glass-card glass-card-hover p-8 max-w-sm flex flex-col justify-between min-h-[400px] group">
            <div className="flex-1">
                {!isLoadingBalance && (
                    <div className="mb-6">
                        <div className="glass-progress relative w-full h-8 mb-2">
                            <div 
                                className="glass-progress-fill h-8 flex items-center justify-end pr-3 transition-all duration-1000 ease-out" 
                                style={{ width: `${balancePercentage?.toString()}%`}}
                            >
                                <span className="text-white text-sm font-semibold drop-shadow-lg">
                                    ${balance?.toString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-white/70 font-medium">Progress</span>
                            <span className="text-emerald-400 font-bold">
                                {balancePercentage >= 100 ? "100%" : `${balancePercentage?.toFixed(1)}%`}
                            </span>
                        </div>
                    </div>
                )}
                
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <h5 className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors duration-300">
                            {campaignName}
                        </h5>
                        {!isLoadingStatus && (
                            <div className={`glass-card px-3 py-1 ${
                                status === 1 && balance && balance > 0n
                                    ? "border border-emerald-400/30" 
                                    : "border border-orange-400/30"
                            }`}>
                                <span className={`text-xs font-semibold ${
                                    status === 1 && balance && balance > 0n
                                        ? "text-emerald-300" 
                                        : "text-orange-300"
                                }`}>
                                    Status: {status === 1 && balance && balance > 0n ? "Successful" : "Active"}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-white/80 leading-relaxed line-clamp-3">
                        {campaignDescription}
                    </p>
                </div>
            </div>
            
            <div className="mt-6">
                <Link href={`/campaign/${campaignAddress}`} passHref={true}>
                    <button className="glass-button w-full inline-flex items-center justify-center group/btn">
                        <span>View Campaign</span>
                        <svg 
                            className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </Link>
            </div>
        </div>
    )
};