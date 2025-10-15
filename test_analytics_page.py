#!/usr/bin/env python3
"""
Test the analytics page directly
"""

import requests
import json

def test_analytics_page():
    """Test the analytics page"""
    print("Testing Analytics Page...")
    
    try:
        # Test the analytics page
        response = requests.get("http://localhost:3000/analytics", timeout=30)
        print(f"Analytics page status: {response.status_code}")
        
        if response.status_code == 200:
            print("[OK] Analytics page is accessible")
            # Check if the page contains graph-related content
            content = response.text
            if "Analysis Visualizations" in content:
                print("✓ Page contains 'Analysis Visualizations' section")
            else:
                print("✗ Page does not contain 'Analysis Visualizations' section")
                
            if "selectedAnalysis" in content:
                print("✓ Page contains selectedAnalysis logic")
            else:
                print("✗ Page does not contain selectedAnalysis logic")
        else:
            print(f"[ERROR] Analytics page error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the Next.js server is running on localhost:3000")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

def test_api_directly():
    """Test the API directly with detailed output"""
    print("\nTesting Analytics API with detailed output...")
    
    try:
        response = requests.get("http://localhost:3000/api/analytics", timeout=30)
        print(f"API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Total analyses: {data.get('totalAnalyses')}")
            
            if data.get('analyses'):
                analysis = data['analyses'][0]
                print(f"Analysis name: {analysis.get('analysisName')}")
                print(f"Has graphs: {'graphs' in analysis}")
                print(f"Graph count: {len(analysis.get('graphs', {}))}")
                
                # List all graph names
                if 'graphs' in analysis:
                    print("Graph names:")
                    for graphName in analysis['graphs'].keys():
                        print(f"  - {graphName}")
        else:
            print(f"API error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"API test error: {e}")

if __name__ == "__main__":
    test_analytics_page()
    test_api_directly()
