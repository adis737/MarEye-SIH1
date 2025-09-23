'use client';
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import { MyCampaignCard } from "@/components/MyCampaignCard";
import { useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract, TransactionButton } from "thirdweb/react"

// Custom Sepolia chain configuration with explicit RPC
const customSepolia = {
  ...sepolia,
  rpc: "https://ethereum-sepolia.publicnode.com"
};

export default function DashboardPage() {
    const account = useActiveAccount();
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const contract = getContract({
        client: client,
        chain: customSepolia,
        address: CROWDFUNDING_FACTORY,
    });

    // Get Campaigns
    const { data: myCampaigns, isLoading: isLoadingMyCampaigns, refetch } = useReadContract({
        contract: contract,
        method: "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
        params: [account?.address as string]
    });
    
    return (
        <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center mb-8">
                <p className="text-4xl font-semibold text-white">Dashboard</p>
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={() => setIsModalOpen(true)}
                >Create Campaign</button>
            </div>
            <p className="text-2xl font-semibold mb-4 text-green-200">My Campaigns:</p>
            <div className="grid grid-cols-3 gap-4">
                {!isLoadingMyCampaigns && (
                    myCampaigns && myCampaigns.length > 0 ? (
                        myCampaigns.map((campaign, index) => (
                            <MyCampaignCard
                                key={index}
                                contractAddress={campaign.campaignAddress}
                            />
                        ))
                    ) : (
                        <p className="text-green-200">No campaigns</p>
                    )
                )}
            </div>
            
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                    refetch={refetch}
                />
            )}
        </div>
    )
}

type CreateCampaignModalProps = {
    setIsModalOpen: (value: boolean) => void
    refetch: () => void
}

const CreateCampaignModal = (
    { setIsModalOpen, refetch }: CreateCampaignModalProps
) => {
    const account = useActiveAccount();
    const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);
    const [campaignName, setCampaignName] = useState<string>("");
    const [campaignDescription, setCampaignDescription] = useState<string>("");
    const [campaignGoal, setCampaignGoal] = useState<number>(1);
    const [campaignDeadline, setCampaignDeadline] = useState<number>(1);
    
    // Create campaign using factory (much cheaper!)
    const handleDeployContract = async () => {
        // This will be handled by TransactionButton
        console.log("Creating campaign via factory...");
    };

    const handleCampaignGoal = (value: number) => {
        if (value < 1) {
            setCampaignGoal(1);
        } else {
            setCampaignGoal(value);
        }
    }

    const handleCampaignLengthhange = (value: number) => {
        if (value < 1) {
            setCampaignDeadline(1);
        } else {
            setCampaignDeadline(value);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/2 bg-green-800 p-6 rounded-md border border-green-600">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold text-white">Create a Campaign</p>
                    <button
                        className="text-sm px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-green-200 mb-1">Campaign Name:</label>
                    <input 
                        type="text" 
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Campaign Name"
                        className="mb-4 px-4 py-2 bg-green-700 text-white rounded-md border border-green-600 focus:border-green-500 focus:outline-none"
                    />
                    <label className="text-green-200 mb-1">Campaign Description:</label>
                    <textarea
                        value={campaignDescription}
                        onChange={(e) => setCampaignDescription(e.target.value)}
                        placeholder="Campaign Description"
                        className="mb-4 px-4 py-2 bg-green-700 text-white rounded-md border border-green-600 focus:border-green-500 focus:outline-none"
                    ></textarea>
                    <label className="text-green-200 mb-1">Campaign Goal:</label>
                    <input 
                        type="number"
                        value={campaignGoal}
                        onChange={(e) => handleCampaignGoal(parseInt(e.target.value))}
                        className="mb-4 px-4 py-2 bg-green-700 text-white rounded-md border border-green-600 focus:border-green-500 focus:outline-none"
                    />
                    <label className="text-green-200 mb-1">{`Campaign Length (Days)`}</label>
                    <div className="flex space-x-4">
                        <input 
                            type="number"
                            value={campaignDeadline}
                            onChange={(e) => handleCampaignLengthhange(parseInt(e.target.value))}
                            className="mb-4 px-4 py-2 bg-green-700 text-white rounded-md border border-green-600 focus:border-green-500 focus:outline-none"
                        />
                    </div>

                    {/* Fee Warning */}
                    <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 mb-4">
                        <p className="text-yellow-200 text-sm">
                            <strong>💰 Gas Fee Required:</strong> Creating a campaign costs a small gas fee (~$0.50-$2.00 on Ethereum Sepolia). 
                        </p>
                    </div>

                    <TransactionButton
                        transaction={() => {
                            console.log("=== CREATING CAMPAIGN ===");
                            console.log("Campaign name:", campaignName);
                            console.log("Campaign description:", campaignDescription);
                            console.log("Campaign goal:", campaignGoal);
                            console.log("Campaign deadline:", campaignDeadline);
                            console.log("Contract address:", CROWDFUNDING_FACTORY);
                            
                            const factoryContract = getContract({
                                client: client,
                                chain: customSepolia,
                                address: CROWDFUNDING_FACTORY,
                            });
                            
                            const transaction = prepareContractCall({
                                contract: factoryContract,
                                method: "function createCampaign(string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays)",
                                params: [campaignName, campaignDescription, BigInt(campaignGoal), BigInt(campaignDeadline)]
                            });
                            
                            console.log("Prepared transaction:", transaction);
                            return transaction;
                        }}
                        onTransactionConfirmed={(result) => {
                            console.log("Campaign creation transaction confirmed:", result);
                            alert("Campaign created successfully! This was much cheaper than deploying a new contract.");
                            setIsModalOpen(false);
                            refetch();
                        }}
                        onError={(error) => {
                            alert(`Error creating campaign: ${error.message}`);
                        }}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Create Campaign
                    </TransactionButton>
                    
                </div>
            </div>
        </div>
    )
}