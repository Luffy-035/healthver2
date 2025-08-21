import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Patient from '@/models/Patient';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const formData = await request.formData();
    console.log('FormData entries:', [...formData.entries()]);

    // Get files from form data
    const files = formData.getAll('files'); // Use 'files' as the key
    
    if (!files || files.length === 0) {
      console.log('No files found in formData');
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    console.log(`Processing ${files.length} PDF files...`);

    let allParsedData = [];
    let downloadUrls = [];

    // Process each uploaded PDF file
    for (const file of files) {
      try {
        if (!file || !file.name) {
          console.log('Invalid file:', file);
          continue;
        }

        console.log(`Processing file: ${file.name}, size: ${file.size}`);
        
        // Convert file to buffer for AI API
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create FormData for AI API
        const aiFormData = new FormData();
        const blob = new Blob([buffer], { type: 'application/pdf' });
        aiFormData.append('file', blob, file.name);

        console.log('Calling AI API for PDF parsing...');

        // Call your AI PDF parsing service
        const response = await fetch('http://127.0.0.1:9000/parse_report/', {
          method: 'POST',
          body: aiFormData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI API error for ${file.name}:`, response.status, errorText);
          continue; // Skip this file but continue with others
        }

        const jsonResult = await response.json();
        console.log(`Successfully parsed ${file.name}`);

        // Add parsed data to our collection
        if (jsonResult.parsed_json) {
          allParsedData = allParsedData.concat(jsonResult.parsed_json);
        }
        
        // Add download URL if provided
        if (jsonResult.pdf_download_url) {
          downloadUrls.push({
            filename: file.name,
            download_url: jsonResult.pdf_download_url
          });
        }

      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError);
        // Continue processing other files even if one fails
      }
    }

    // Save all parsed data to patient's lab_json field
    const labData = {
      parsed_json: allParsedData,
      pdf_download_urls: downloadUrls,
      processed_at: new Date().toISOString(),
      total_files_processed: files.length
    };

    // Update patient record
    patient.lab_json = JSON.stringify(labData);
    await patient.save();

    console.log(`Successfully processed and saved data for patient ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} PDF files`,
      parsed_json: allParsedData,
      pdf_download_urls: downloadUrls,
      total_files: files.length,
      parsed_reports: allParsedData.length
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF files: ' + error.message },
      { status: 500 }
    );
  }
}
