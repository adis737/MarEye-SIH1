import { NextRequest, NextResponse } from 'next/server'

// Real-time ocean monitoring data from multiple sources
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching real-time ocean monitoring data...')
    
    // Simulate real-time data from multiple sources
    const realTimeData = await fetchRealTimeOceanData()
    
    return NextResponse.json({
      success: true,
      data: realTimeData,
      count: realTimeData.length,
      lastUpdated: new Date().toISOString(),
      sources: ['NOAA', 'NASA', 'EPA', 'Global Fishing Watch']
    })
  } catch (error) {
    console.error('Error fetching real-time ocean data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch real-time ocean data',
        fallback: true 
      },
      { status: 500 }
    )
  }
}

async function fetchRealTimeOceanData() {
  // Simulate real-time data from various ocean monitoring sources
  const currentTime = new Date()
  const baseData = [
    {
      id: 'noaa-pacific-001',
      source: 'NOAA CoastWatch',
      location: {
        name: 'North Pacific Gyre',
        coordinates: [32.0, -145.0],
        region: 'Pacific Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 3600000).toISOString(), // Within last hour
      qualityIndex: Math.floor(Math.random() * 40) + 20, // 20-60 range
      samplingDate: new Date(currentTime.getTime() - Math.random() * 7200000), // Within last 2 hours
      temperature: 18.5 + (Math.random() - 0.5) * 4,
      salinity: 34.2 + (Math.random() - 0.5) * 2,
      ph: 7.8 + (Math.random() - 0.5) * 0.4,
      dissolvedOxygen: 6.2 + (Math.random() - 0.5) * 2,
      turbidity: Math.floor(Math.random() * 20) + 5,
      chlorophyll: Math.floor(Math.random() * 15) + 2,
      microplastics: Math.floor(Math.random() * 1000) + 100
    },
    {
      id: 'nasa-atlantic-001',
      source: 'NASA MODIS',
      location: {
        name: 'Gulf of Mexico',
        coordinates: [28.0, -90.0],
        region: 'Atlantic Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 1800000).toISOString(), // Within last 30 min
      qualityIndex: Math.floor(Math.random() * 50) + 15,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 3600000),
      temperature: 25.5 + (Math.random() - 0.5) * 6,
      salinity: 34.8 + (Math.random() - 0.5) * 3,
      ph: 7.9 + (Math.random() - 0.5) * 0.3,
      dissolvedOxygen: 5.8 + (Math.random() - 0.5) * 3,
      turbidity: Math.floor(Math.random() * 25) + 10,
      chlorophyll: Math.floor(Math.random() * 20) + 5,
      microplastics: Math.floor(Math.random() * 1500) + 200
    },
    {
      id: 'epa-caribbean-001',
      source: 'EPA Monitoring',
      location: {
        name: 'Caribbean Sea',
        coordinates: [15.0, -75.0],
        region: 'Atlantic Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 900000).toISOString(), // Within last 15 min
      qualityIndex: Math.floor(Math.random() * 60) + 30,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 1800000),
      temperature: 27.2 + (Math.random() - 0.5) * 4,
      salinity: 35.2 + (Math.random() - 0.5) * 2,
      ph: 8.1 + (Math.random() - 0.5) * 0.2,
      dissolvedOxygen: 8.0 + (Math.random() - 0.5) * 2,
      turbidity: Math.floor(Math.random() * 15) + 3,
      chlorophyll: Math.floor(Math.random() * 12) + 3,
      microplastics: Math.floor(Math.random() * 800) + 50
    },
    {
      id: 'gfw-indian-001',
      source: 'Global Fishing Watch',
      location: {
        name: 'Bay of Bengal',
        coordinates: [15.0, 88.0],
        region: 'Indian Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 2700000).toISOString(), // Within last 45 min
      qualityIndex: Math.floor(Math.random() * 45) + 25,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 5400000),
      temperature: 28.5 + (Math.random() - 0.5) * 5,
      salinity: 34.0 + (Math.random() - 0.5) * 3,
      ph: 7.9 + (Math.random() - 0.5) * 0.4,
      dissolvedOxygen: 6.0 + (Math.random() - 0.5) * 3,
      turbidity: Math.floor(Math.random() * 30) + 8,
      chlorophyll: Math.floor(Math.random() * 18) + 4,
      microplastics: Math.floor(Math.random() * 1200) + 150
    },
    {
      id: 'noaa-arctic-001',
      source: 'NOAA Arctic Monitoring',
      location: {
        name: 'Arctic Ocean',
        coordinates: [80.0, 0.0],
        region: 'Arctic Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 7200000).toISOString(), // Within last 2 hours
      qualityIndex: Math.floor(Math.random() * 70) + 25,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 14400000),
      temperature: -1.5 + (Math.random() - 0.5) * 3,
      salinity: 34.8 + (Math.random() - 0.5) * 2,
      ph: 8.0 + (Math.random() - 0.5) * 0.3,
      dissolvedOxygen: 9.2 + (Math.random() - 0.5) * 2,
      turbidity: Math.floor(Math.random() * 10) + 2,
      chlorophyll: Math.floor(Math.random() * 8) + 1,
      microplastics: Math.floor(Math.random() * 500) + 50
    },
    {
      id: 'nasa-mediterranean-001',
      source: 'NASA Ocean Color',
      location: {
        name: 'Mediterranean Sea',
        coordinates: [36.0, 15.0],
        region: 'Mediterranean Sea'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 1200000).toISOString(), // Within last 20 min
      qualityIndex: Math.floor(Math.random() * 55) + 20,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 2400000),
      temperature: 20.5 + (Math.random() - 0.5) * 6,
      salinity: 38.5 + (Math.random() - 0.5) * 2,
      ph: 8.1 + (Math.random() - 0.5) * 0.3,
      dissolvedOxygen: 6.8 + (Math.random() - 0.5) * 2,
      turbidity: Math.floor(Math.random() * 20) + 5,
      chlorophyll: Math.floor(Math.random() * 15) + 3,
      microplastics: Math.floor(Math.random() * 1000) + 100
    },
    {
      id: 'epa-baltic-001',
      source: 'EPA Baltic Monitoring',
      location: {
        name: 'Baltic Sea',
        coordinates: [58.0, 20.0],
        region: 'Atlantic Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 600000).toISOString(), // Within last 10 min
      qualityIndex: Math.floor(Math.random() * 35) + 15,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 1200000),
      temperature: 8.5 + (Math.random() - 0.5) * 4,
      salinity: 32.0 + (Math.random() - 0.5) * 3,
      ph: 7.5 + (Math.random() - 0.5) * 0.5,
      dissolvedOxygen: 3.8 + (Math.random() - 0.5) * 2,
      turbidity: Math.floor(Math.random() * 35) + 15,
      chlorophyll: Math.floor(Math.random() * 25) + 8,
      microplastics: Math.floor(Math.random() * 2000) + 300
    },
    {
      id: 'noaa-great-barrier-001',
      source: 'NOAA Coral Reef Watch',
      location: {
        name: 'Great Barrier Reef',
        coordinates: [-18.0, 147.0],
        region: 'Pacific Ocean'
      },
      contaminationLevel: getRandomContaminationLevel(),
      pollutants: getRandomPollutants(),
      lastUpdated: new Date(currentTime.getTime() - Math.random() * 1500000).toISOString(), // Within last 25 min
      qualityIndex: Math.floor(Math.random() * 65) + 30,
      samplingDate: new Date(currentTime.getTime() - Math.random() * 3000000),
      temperature: 26.8 + (Math.random() - 0.5) * 4,
      salinity: 35.1 + (Math.random() - 0.5) * 2,
      ph: 8.1 + (Math.random() - 0.5) * 0.2,
      dissolvedOxygen: 7.8 + (Math.random() - 0.5) * 2,
      turbidity: Math.floor(Math.random() * 18) + 4,
      chlorophyll: Math.floor(Math.random() * 22) + 6,
      microplastics: Math.floor(Math.random() * 600) + 80
    }
  ]

  return baseData
}

function getRandomContaminationLevel(): string {
  const levels = ['low', 'moderate', 'high', 'severe']
  const weights = [0.3, 0.3, 0.25, 0.15] // More realistic distribution
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return levels[i]
    }
  }
  return 'moderate'
}

function getRandomPollutants(): string[] {
  const pollutantCategories = [
    ['Microplastics', 'Heavy Metals', 'Oil Residue'],
    ['Agricultural Runoff', 'Sediment', 'Nutrients'],
    ['Industrial Waste', 'Sewage', 'Chemical Runoff'],
    ['Urban Runoff', 'Industrial Discharge'],
    ['Eutrophication', 'Heavy Metals', 'Industrial Waste', 'Agricultural Runoff'],
    ['Minimal Contamination'],
    ['Oil Spill Residue', 'Agricultural Runoff', 'Industrial Waste'],
    ['Agricultural Runoff', 'Industrial Waste', 'Sewage']
  ]
  
  return pollutantCategories[Math.floor(Math.random() * pollutantCategories.length)]
}
