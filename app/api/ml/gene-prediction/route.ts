import { type NextRequest, NextResponse } from "next/server"
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { sequence, sequenceType, sequenceId, sequences } = await request.json()

    // Handle both single sequence and multiple sequences
    const sequencesToProcess = sequences || (sequence ? [sequence] : [])
    
    if (!sequencesToProcess.length) {
      return NextResponse.json({ error: "DNA sequence(s) are required" }, { status: 400 })
    }

    // Validate sequences
    const validSequences = sequencesToProcess.filter((seq: string) => {
      if (!seq || typeof seq !== 'string') return false
      const cleanSeq = seq.trim().toUpperCase()
      return cleanSeq.length > 0 && /^[ATGC]+$/.test(cleanSeq)
    })

    if (!validSequences.length) {
      return NextResponse.json({ 
        error: "No valid DNA sequences provided",
        message: "Sequences must contain only A, T, G, C characters"
      }, { status: 400 })
    }

    try {
      // Call Python script directly
      const pythonScript = path.join(process.cwd(), 'lib', 'model-predictor-simple.py')
      const pythonProcess = spawn('python', [pythonScript, '--sequences', ...validSequences], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const result = await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const parsedResult = JSON.parse(stdout)
              resolve(parsedResult)
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${stdout}`))
            }
          } else {
            reject(new Error(`Python script failed with code ${code}: ${stderr}`))
          }
        })
      }) as any

      if (result.success) {
        return NextResponse.json({
          success: true,
          predictions: result.predictions,
          model_info: result.model_info,
          total_sequences: result.total_sequences,
          sequence_info: {
            original_count: sequencesToProcess.length,
            valid_count: validSequences.length,
            type: sequenceType,
            id: sequenceId,
          },
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error,
          message: result.message,
          sequence_info: {
            length: validSequences[0]?.length || 0,
            type: sequenceType,
            id: sequenceId,
          },
        }, { status: 500 })
      }

    } catch (apiError) {
      console.error("Python model error:", apiError)
      
      return NextResponse.json({
        success: false,
        error: "Model prediction failed",
        message: apiError instanceof Error ? apiError.message : "Unknown error occurred",
        sequence_info: {
          length: validSequences[0]?.length || 0,
          type: sequenceType,
          id: sequenceId,
        },
      }, { status: 500 })
    }

  } catch (error) {
    console.error("[v0] ML gene prediction API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "ML prediction failed",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Check model status by calling Python script
    const pythonScript = path.join(process.cwd(), 'lib', 'model-predictor-simple.py')
    const pythonProcess = spawn('python', [pythonScript, '--info'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    const result = await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const parsedResult = JSON.parse(stdout)
            resolve(parsedResult)
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${stdout}`))
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`))
        }
      })
    }) as any

    return NextResponse.json({
      success: true,
      model_available: result.model_available,
      model_info: result.model_info,
      required_files: result.required_files
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      model_available: false,
      message: "Model not available",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
