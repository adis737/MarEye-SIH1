import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const neutralizeCast = formData.get('neutralize_cast') === '1'
    const saturation = parseFloat(formData.get('saturation') as string) || 1.0

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Create temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Generate unique filenames
    const imageId = uuidv4()
    const inputPath = path.join(tempDir, `input_${imageId}.jpg`)
    const outputPath = path.join(tempDir, `output_${imageId}.jpg`)

    // Save uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(inputPath, buffer)

    try {
      // Call the Python enhancement script
      const pythonProcess = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        const uieModelPath = path.join(process.cwd(), 'UIE-model')
        const pythonScript = path.join(uieModelPath, 'udnet_infer.py')
        
        // Arguments for the Python script
        const args = [
          pythonScript,
          '--input', inputPath,
          '--output', outputPath,
          '--saturation', saturation.toString()
        ]
        
        if (neutralizeCast) {
          args.push('--neutralize-cast')
        }

        const pythonProcess = spawn('python', args, {
          cwd: uieModelPath,
          stdio: 'pipe'
        })

        let stdout = ''
        let stderr = ''

        pythonProcess.stdout?.on('data', (data) => {
          stdout += data.toString()
        })

        pythonProcess.stderr?.on('data', (data) => {
          stderr += data.toString()
        })

        pythonProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr })
          } else {
            reject(new Error(`Python process exited with code ${code}: ${stderr}`))
          }
        })

        pythonProcess.on('error', (error) => {
          reject(error)
        })

        // Set timeout for the process
        setTimeout(() => {
          pythonProcess.kill()
          reject(new Error('Python process timeout'))
        }, 30000) // 30 second timeout
      })

      // Check if output file was created
      if (!fs.existsSync(outputPath)) {
        throw new Error('Enhanced image was not generated')
      }

      // Read the enhanced image
      const enhancedBuffer = fs.readFileSync(outputPath)
      const base64Enhanced = enhancedBuffer.toString('base64')

      // Clean up temporary files
      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)

      return NextResponse.json({
        success: true,
        enhancedImage: `data:image/jpeg;base64,${base64Enhanced}`,
        message: 'Image enhanced successfully'
      })

    } catch (error) {
      // Clean up temporary files on error
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath)
      }
      
      console.error('Enhancement error:', error)
      
      // For development/demo purposes, return the original image
      // This allows the frontend to work even if the Python model isn't set up
      const originalBase64 = buffer.toString('base64')
      return NextResponse.json({
        success: true,
        enhancedImage: `data:image/jpeg;base64,${originalBase64}`,
        message: 'Demo mode: To enable full enhancement, install Python dependencies with: pip install torch torchvision Pillow numpy scipy opencv-python',
        isDemo: true,
        error: error instanceof Error ? error.message : 'Python environment setup required'
      })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'UDnet Image Enhancement API',
    version: '1.0.0',
    status: 'active'
  })
}
