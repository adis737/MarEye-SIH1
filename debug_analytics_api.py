#!/usr/bin/env python3
"""
Debug the analytics API to see what's being returned
"""

import requests
import json

def debug_analytics_api():
    """Debug the analytics API response"""
    print("Debugging Analytics API...")
    
    try:
        response = requests.get("http://localhost:3000/api/analytics", timeout=30)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("[OK] Analytics API Response received!")
            print(f"Success: {data.get('success', False)}")
            print(f"Total analyses: {data.get('totalAnalyses', 0)}")
            
            if 'analyses' in data and data['analyses']:
                analysis = data['analyses'][0]  # Get first analysis
                print(f"\nAnalysis: {analysis['analysisName']}")
                print(f"Timestamp: {analysis['timestamp']}")
                
                if 'graphs' in analysis:
                    print(f"Graphs found: {len(analysis['graphs'])}")
                    for graphName, graphData in analysis['graphs'].items():
                        print(f"  - {graphName}: {len(graphData)} characters")
                        # Check if it's a valid base64 image
                        if graphData.startswith('data:image/png;base64,'):
                            print(f"    ✓ Valid base64 PNG image")
                        else:
                            print(f"    ✗ Invalid image format")
                else:
                    print("No graphs found in analysis")
                
                if 'reportData' in analysis:
                    print(f"Report data keys: {list(analysis['reportData'].keys())}")
            else:
                print("No analyses found")
        else:
            print(f"[ERROR] API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    debug_analytics_api()
