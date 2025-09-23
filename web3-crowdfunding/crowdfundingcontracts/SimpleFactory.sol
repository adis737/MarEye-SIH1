// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleFactory {
    address public owner;
    
    struct Campaign {
        address campaignAddress;
        address owner;
        string name;
        uint256 creationTime;
    }
    
    Campaign[] public campaigns;
    
    constructor() {
        owner = msg.sender;
    }
    
    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) external {
        // For now, just create a dummy campaign
        Campaign memory campaign = Campaign({
            campaignAddress: address(uint160(uint256(keccak256(abi.encodePacked(_name, block.timestamp))))),
            owner: msg.sender,
            name: _name,
            creationTime: block.timestamp
        });
        
        campaigns.push(campaign);
    }
    
    function getAllCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }
    
    function getUserCampaigns(address _user) external view returns (Campaign[] memory) {
        Campaign[] memory userCamps = new Campaign[](campaigns.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].owner == _user) {
                userCamps[count] = campaigns[i];
                count++;
            }
        }
        
        // Resize array to actual count
        Campaign[] memory result = new Campaign[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userCamps[i];
        }
        
        return result;
    }
    
    function removeCampaign(address _campaignAddress) external {
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].campaignAddress == _campaignAddress) {
                require(campaigns[i].owner == msg.sender, "Not the campaign owner");
                
                // Move the last element to the position of the element to delete
                campaigns[i] = campaigns[campaigns.length - 1];
                campaigns.pop();
                break;
            }
        }
    }
}
