// MongoDB database setup script for biodiversity platform

import { getDatabase } from "../lib/mongodb.js"

async function setupDatabase() {
  try {
    console.log("[v0] Setting up biodiversity platform database...")

    const db = await getDatabase()

    // Create collections with validation schemas
    console.log("[v0] Creating species collection...")
    await db.createCollection("species", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["scientificName", "classification", "habitat", "conservationStatus"],
          properties: {
            scientificName: { bsonType: "string" },
            commonName: { bsonType: "string" },
            classification: {
              bsonType: "object",
              required: ["kingdom", "phylum", "class", "order", "family", "genus", "species"],
              properties: {
                kingdom: { bsonType: "string" },
                phylum: { bsonType: "string" },
                class: { bsonType: "string" },
                order: { bsonType: "string" },
                family: { bsonType: "string" },
                genus: { bsonType: "string" },
                species: { bsonType: "string" },
              },
            },
            habitat: { bsonType: "string" },
            conservationStatus: {
              enum: ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"],
            },
          },
        },
      },
    })

    console.log("[v0] Creating water quality data collection...")
    await db.createCollection("waterQualityData", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["location", "measurements", "qualityIndex", "samplingDate"],
          properties: {
            location: {
              bsonType: "object",
              required: ["latitude", "longitude", "depth"],
              properties: {
                latitude: { bsonType: "number", minimum: -90, maximum: 90 },
                longitude: { bsonType: "number", minimum: -180, maximum: 180 },
                depth: { bsonType: "number", minimum: 0 },
              },
            },
            qualityIndex: { bsonType: "number", minimum: 0, maximum: 100 },
          },
        },
      },
    })

    console.log("[v0] Creating gene sequences collection...")
    await db.createCollection("geneSequences")

    console.log("[v0] Creating research projects collection...")
    await db.createCollection("researchProjects")

    console.log("[v0] Creating conservation alerts collection...")
    await db.createCollection("conservationAlerts")

    console.log("[v0] Creating AI analyses collection...")
    await db.createCollection("aiAnalyses")

    // Create indexes for better performance
    console.log("[v0] Creating database indexes...")

    // Species indexes
    await db.collection("species").createIndex({ scientificName: 1 }, { unique: true })
    await db.collection("species").createIndex({ "classification.genus": 1, "classification.species": 1 })
    await db.collection("species").createIndex({ conservationStatus: 1 })

    // Water quality indexes
    await db.collection("waterQualityData").createIndex({ "location.latitude": 1, "location.longitude": 1 })
    await db.collection("waterQualityData").createIndex({ samplingDate: -1 })
    await db.collection("waterQualityData").createIndex({ contaminationLevel: 1 })

    // Gene sequence indexes
    await db.collection("geneSequences").createIndex({ sequenceId: 1 }, { unique: true })
    await db.collection("geneSequences").createIndex({ analysisStatus: 1 })
    await db.collection("geneSequences").createIndex({ "location.latitude": 1, "location.longitude": 1 })

    // Research project indexes
    await db.collection("researchProjects").createIndex({ status: 1 })
    await db.collection("researchProjects").createIndex({ leadResearcher: 1 })

    // Conservation alert indexes
    await db.collection("conservationAlerts").createIndex({ severity: 1, status: 1 })
    await db.collection("conservationAlerts").createIndex({ alertType: 1 })

    // AI analysis indexes
    await db.collection("aiAnalyses").createIndex({ analysisType: 1 })
    await db.collection("aiAnalyses").createIndex({ createdAt: -1 })

    console.log("[v0] Database setup completed successfully!")
  } catch (error) {
    console.error("[v0] Database setup failed:", error)
    throw error
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log("[v0] Database initialization complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Database initialization failed:", error)
    process.exit(1)
  })
