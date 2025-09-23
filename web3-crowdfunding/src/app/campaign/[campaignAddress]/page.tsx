'use client';
import { client } from "@/app/client";
import { TierCard } from "@/components/TierCard";
import { useParams, useRouter } from "next/navigation";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";

// Custom Sepolia chain configuration with explicit RPC
const customSepolia = {
  ...sepolia,
  rpc: "https://ethereum-sepolia.publicnode.com"
};

export default function CampaignPage() {
    const account = useActiveAccount();
    const { campaignAddress } = useParams();

    const contract = getContract({
        client: client,
        chain: customSepolia,
        address: campaignAddress as string,
    });

    // Name of the campaign
    const { data: name, isLoading: isLoadingName } = useReadContract({
        contract: contract,
        method: "function name() view returns (string)",
        params: [],
    });

    // Description of the campaign
    const { data: description } = useReadContract({ 
        contract, 
        method: "function description() view returns (string)", 
        params: [] 
      });

    // Campaign deadline
    const { data: deadline, isLoading: isLoadingDeadline } = useReadContract({
        contract: contract,
        method: "function deadline() view returns (uint256)",
        params: [],
    });
    // Convert deadline to a date
    const deadlineDate = new Date(parseInt(deadline?.toString() as string) * 1000);
    // Check if deadline has passed
    const hasDeadlinePassed = deadlineDate < new Date();

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

    // Calulate the total funded balance percentage
    const totalBalance = balance?.toString();
    const totalGoal = goal?.toString();
    let balancePercentage = (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

    // If balance is greater than or equal to goal, percentage should be 100
    if (balancePercentage >= 100) {
        balancePercentage = 100;
    }

    // Get tiers for the campaign
    const { data: tiers, isLoading: isLoadingTiers } = useReadContract({
        contract: contract,
        method: "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])",
        params: [],
    });

    // Get owner of the campaign
    const { data: owner, isLoading: isLoadingOwner } = useReadContract({
        contract: contract,
        method: "function owner() view returns (address)",
        params: [],
    });

    // Get status of the campaign
    const { data: status } = useReadContract({ 
        contract, 
        method: "function state() view returns (uint8)", 
        params: [] 
      });
    
    return (
        <div className="mx-auto max-w-7xl px-2 mt-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center">
                {!isLoadingName && (
                    <p className="text-4xl font-semibold text-white">{name}</p>
                )}
                <div className="flex flex-row gap-2">
                    <p className="px-4 py-2 bg-green-700 text-white rounded-md">
                        Status:  
                        {status === 0 ? " Active" : 
                        status === 1 ? " Successful" :
                        status === 2 ? " Failed" : "Unknown"}
                    </p>
                    <button
                        onClick={() => window.open(`https://sepolia.etherscan.io/address/${campaignAddress}`, '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >View on Explorer</button>
                </div>
            </div>
            <div className="my-4">
                <p className="text-lg font-semibold text-green-200">Description:</p>
                <p className="text-green-100">{description}</p>
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold text-green-200">Deadline</p>
                {!isLoadingDeadline && (
                    <p className="text-green-100">{deadlineDate.toDateString()}</p>
                )}
            </div>
            {!isLoadingBalance && (
                <div className="mb-4">
                    <p className="text-lg font-semibold text-green-200">Campaign Goal: ${goal?.toString()}</p>
                    <div className="relative w-full h-6 bg-green-900 rounded-full">
                        <div className="h-6 bg-green-500 rounded-full text-right" style={{ width: `${balancePercentage?.toString()}%`}}>
                            <p className="text-white text-xs p-1">${balance?.toString()}</p>
                        </div>
                        <p className="absolute top-0 right-0 text-white text-xs p-1">
                            {balancePercentage >= 100 ? "" : `${balancePercentage?.toString()}%`}
                        </p>
                    </div>
                </div>
                
            )}
            <div>
                <p className="text-lg font-semibold text-green-200">Tiers:</p>
                <div className="grid grid-cols-3 gap-4">
                    {isLoadingTiers ? (
                        <p className="text-green-200">Loading...</p>
                    ) : (
                        tiers && tiers.length > 0 ? (
                            tiers.map((tier, index) => (
                                <TierCard
                                    key={index}
                                    tier={tier}
                                    index={index}
                                    contract={contract}
                                    isEditing={false}
                                />
                            ))
                        ) : (
                            <p className="text-green-200">No tiers available</p>
                        )
                    )}
                </div>
            </div>
            
        </div>
    );
}