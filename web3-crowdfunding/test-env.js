// Test script to check if environment variables are loaded
console.log("Testing environment variables...");
console.log("NEXT_PUBLIC_TEMPLATE_CLIENT_ID:", process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID);
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('THIRDWEB') || key.includes('CLIENT')));


