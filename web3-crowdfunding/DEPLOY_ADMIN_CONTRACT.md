# 🔧 Deploy Admin Contract for True Admin Powers

## Current Limitation
The current smart contract only allows campaign owners to remove their own campaigns. As an admin, you can't remove other people's campaigns.

## Solution: Deploy Updated Contract

### Step 1: Deploy the Updated Contract
```bash
cd crowdfundingcontracts
node deploy-updated.js
```

### Step 2: Update Contract Address
After deployment, update `src/app/constants/contracts.ts`:
```typescript
export const CROWDFUNDING_FACTORY = "YOUR_NEW_CONTRACT_ADDRESS_HERE";
```

### Step 3: Update Admin Panel
Change the admin panel to use the new `adminRemoveCampaign` function:

```typescript
// In src/app/admin/page.tsx, change the TransactionButton to:
<TransactionButton
    transaction={() => prepareContractCall({
        contract: factoryContract,
        method: "function adminRemoveCampaign(address _campaignAddress)",
        params: [campaign.campaignAddress]
    })}
    // ... rest of props
>
    Admin Remove
</TransactionButton>
```

## What This Gives You

### ✅ **True Admin Powers**
- Remove ANY campaign (not just your own)
- No ownership restrictions
- Full admin control

### ⚠️ **Trade-offs**
- Need to redeploy contract
- Lose existing campaigns (they're on the old contract)
- Users need to create new campaigns on the new contract

## Alternative: Keep Current Setup

If you want to keep the current setup:
- You can only remove campaigns you created
- Other campaigns will show "Admin Remove" button but will fail
- This is simpler but less powerful

## Recommendation

For a production app, deploy the updated contract for true admin powers.
For development/testing, the current setup works fine.

