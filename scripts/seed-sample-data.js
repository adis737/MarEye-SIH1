// Seed sample data for the biodiversity platform

import { getDatabase } from "../lib/mongodb.js"

async function seedSampleData() {
  try {
    console.log("[v0] Seeding sample data...")

    const db = await getDatabase()

    // Sample species data
    const sampleSpecies = [
      {
        scientificName: "Vampyroteuthis infernalis",
        commonName: "Vampire Squid",
        classification: {
          kingdom: "Animalia",
          phylum: "Mollusca",
          class: "Cephalopoda",
          order: "Vampyromorphida",
          family: "Vampyroteuthidae",
          genus: "Vampyroteuthis",
          species: "infernalis",
        },
        habitat: "Deep ocean oxygen minimum zones",
        depth: { min: 600, max: 900 },
        conservationStatus: "DD",
        description: "A unique cephalopod that lives in the deep ocean oxygen minimum zones.",
        threats: ["Deep sea mining", "Climate change", "Ocean acidification"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        scientificName: "Atolla jellyfish",
        commonName: "Atolla Jellyfish",
        classification: {
          kingdom: "Animalia",
          phylum: "Cnidaria",
          class: "Scyphozoa",
          order: "Coronatae",
          family: "Atollidae",
          genus: "Atolla",
          species: "wyvillei",
        },
        habitat: "Deep sea pelagic zones",
        depth: { min: 1000, max: 4000 },
        conservationStatus: "DD",
        description: "Deep-sea jellyfish known for its bioluminescent alarm display.",
        threats: ["Deep sea trawling", "Pollution", "Climate change"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    console.log("[v0] Inserting sample species...")
    await db.collection("species").insertMany(sampleSpecies)

    // Sample water quality data
    const sampleWaterQuality = [
      {
        location: {
          latitude: 36.7783,
          longitude: -119.4179,
          depth: 1500,
          region: "Monterey Bay",
        },
        measurements: {
          temperature: 4.2,
          salinity: 34.5,
          pH: 7.8,
          dissolvedOxygen: 2.1,
          turbidity: 0.5,
          pollutants: {
            microplastics: 12.3,
            heavyMetals: {
              mercury: 0.05,
              lead: 0.02,
              cadmium: 0.01,
            },
            chemicals: {
              pesticides: 0.1,
              hydrocarbons: 0.3,
            },
          },
        },
        qualityIndex: 78,
        contaminationLevel: "low",
        samplingDate: new Date("2024-01-15"),
        samplingMethod: "ROV sampling",
        researchTeam: "MBARI Deep Sea Research",
        createdAt: new Date(),
      },
      {
        location: {
          latitude: 25.7617,
          longitude: -80.1918,
          depth: 2000,
          region: "Florida Straits",
        },
        measurements: {
          temperature: 5.8,
          salinity: 35.1,
          pH: 7.6,
          dissolvedOxygen: 1.8,
          turbidity: 1.2,
          pollutants: {
            microplastics: 28.7,
            heavyMetals: {
              mercury: 0.12,
              lead: 0.08,
              cadmium: 0.03,
            },
            chemicals: {
              pesticides: 0.4,
              hydrocarbons: 1.2,
            },
          },
        },
        qualityIndex: 52,
        contaminationLevel: "moderate",
        samplingDate: new Date("2024-01-20"),
        samplingMethod: "Deep sea trawl",
        researchTeam: "NOAA Deep Ocean Exploration",
        createdAt: new Date(),
      },
    ]

    console.log("[v0] Inserting sample water quality data...")
    await db.collection("waterQualityData").insertMany(sampleWaterQuality)

    // Sample conservation alerts
    const sampleAlerts = [
      {
        alertType: "pollution_spike",
        severity: "high",
        title: "Microplastic Contamination Increase in Pacific Deep Waters",
        description: "Recent sampling shows a 40% increase in microplastic particles in the North Pacific deep waters.",
        location: {
          latitude: 40.0,
          longitude: -140.0,
          region: "North Pacific",
        },
        affectedSpecies: [],
        threatFactors: ["Plastic pollution", "Ocean currents", "Surface debris"],
        recommendedActions: [
          "Increase monitoring frequency",
          "Implement stricter plastic waste regulations",
          "Deploy cleanup technologies",
        ],
        status: "active",
        reportedBy: "Pacific Marine Research Institute",
        reportedDate: new Date("2024-01-10"),
        lastUpdated: new Date(),
      },
    ]

    console.log("[v0] Inserting sample conservation alerts...")
    await db.collection("conservationAlerts").insertMany(sampleAlerts)

    console.log("[v0] Sample data seeding completed successfully!")
  } catch (error) {
    console.error("[v0] Sample data seeding failed:", error)
    throw error
  }
}

// Run the seeding
seedSampleData()
  .then(() => {
    console.log("[v0] Sample data seeding complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Sample data seeding failed:", error)
    process.exit(1)
  })
