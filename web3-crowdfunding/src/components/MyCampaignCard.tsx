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

type MyCampaignCardProps = {
    contractAddress: string;
};

export const MyCampaignCard: React.FC<MyCampaignCardProps> = ({ contractAddress }) => {
    const contract = getContract({
        client: client,
        chain: customSepolia,
        address: contractAddress,
    });

    // Get Campaign Name
    const { data: name } = useReadContract({
        contract, 
        method: "function name() view returns (string)", 
        params: []
    });

    const { data: description } = useReadContract({ 
        contract, 
        method: "function description() view returns (string)", 
        params: [] 
    });

    // Get campaign balance and status
    const { data: balance } = useReadContract({
        contract: contract,
        method: "function getContractBalance() view returns (uint256)",
        params: [],
    });

    const { data: status, isLoading: isLoadingStatus } = useReadContract({
        contract: contract,
        method: "function getCampaignStatus() view returns (uint8)",
        params: [],
    });

    return (
        <div className="glass-card glass-card-hover p-8 max-w-sm flex flex-col justify-between min-h-[350px] group">
            <div className="flex-1">
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">Your Campaign</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <h5 className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors duration-300">
                            {name}
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
                    <p className="text-white/80 leading-relaxed line-clamp-4">
                        {description}
                    </p>
                </div>
            </div>
            
            <div className="mt-6">
                <Link href={`/campaign/${contractAddress}`} passHref={true}>
                    <button className="glass-button w-full inline-flex items-center justify-center group/btn">
                        <span>Manage Campaign</span>
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