// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Crowdfunding} from "./Crowdfunding.sol";

contract CrowdfundingFactory {
    address public owner;
    bool public paused;

    struct Campaign {
        address campaignAddress;
        address owner;
        string name;
        uint256 creationTime;
    }

    Campaign[] public campaigns;
    mapping(address => Campaign[]) public userCampaigns;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner.");
        _;
    }

    modifier notPaused() {
        require(!paused, "Factory is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) external notPaused {
        Crowdfunding newCampaign = new Crowdfunding(
            msg.sender,
            _name,
            _description,
            _goal,
            _durationInDays
        );
        address campaignAddress = address(newCampaign);

        Campaign memory campaign = Campaign({
            campaignAddress: campaignAddress,
            owner: msg.sender,
            name: _name,
            creationTime: block.timestamp
        });

        campaigns.push(campaign);
        userCampaigns[msg.sender].push(campaign);
    }

    function getUserCampaigns(address _user) external view returns (Campaign[] memory) {
        return userCampaigns[_user];
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }

    function removeCampaign(address _campaignAddress) external {
        require(_campaignAddress != address(0), "Invalid campaign address");
        
        // Find and remove from campaigns array
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].campaignAddress == _campaignAddress) {
                require(campaigns[i].owner == msg.sender, "Not the campaign owner");
                
                // Move the last element to the position of the element to delete
                campaigns[i] = campaigns[campaigns.length - 1];
                campaigns.pop();
                break;
            }
        }
        
        // Find and remove from userCampaigns mapping
        Campaign[] storage userCamps = userCampaigns[msg.sender];
        for (uint256 i = 0; i < userCamps.length; i++) {
            if (userCamps[i].campaignAddress == _campaignAddress) {
                // Move the last element to the position of the element to delete
                userCamps[i] = userCamps[userCamps.length - 1];
                userCamps.pop();
                break;
            }
        }
    }

    // Admin function to remove any campaign
    function adminRemoveCampaign(address _campaignAddress) external onlyOwner {
        require(_campaignAddress != address(0), "Invalid campaign address");
        
        address campaignOwner;
        
        // Find and remove from campaigns array
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].campaignAddress == _campaignAddress) {
                campaignOwner = campaigns[i].owner;
                // Move the last element to the position of the element to delete
                campaigns[i] = campaigns[campaigns.length - 1];
                campaigns.pop();
                break;
            }
        }
        
        // Find and remove from userCampaigns mapping for the original owner
        Campaign[] storage userCamps = userCampaigns[campaignOwner];
        for (uint256 j = 0; j < userCamps.length; j++) {
            if (userCamps[j].campaignAddress == _campaignAddress) {
                // Move the last element to the position of the element to delete
                userCamps[j] = userCamps[userCamps.length - 1];
                userCamps.pop();
                break;
            }
        }
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }
}