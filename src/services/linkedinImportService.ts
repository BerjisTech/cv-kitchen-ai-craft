
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface LinkedInData {
  profileData: any;
  positionsData?: any;
  educationData?: any;
  skillsData?: any;
  coursesData?: any;
}

// Process LinkedIn data from JSON or CSV files
export async function processLinkedInFiles(files: File[]): Promise<LinkedInData | null> {
  try {
    const fileContents: { [key: string]: any } = {};
    
    // Read all files
    for (const file of files) {
      try {
        const fileName = file.name.toLowerCase();
        const isCSV = fileName.endsWith('.csv');
        
        let content;
        if (isCSV) {
          content = await readFileAsCSV(file);
        } else {
          content = await readFileAsJson(file);
        }
        
        if (fileName.includes('profile')) {
          fileContents.profileData = content;
        } else if (fileName.includes('position')) {
          fileContents.positionsData = content;
        } else if (fileName.includes('education')) {
          fileContents.educationData = content;
        } else if (fileName.includes('skill')) {
          fileContents.skillsData = content;
        } else if (fileName.includes('course')) {
          fileContents.coursesData = content;
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast.error(`Could not process file: ${file.name}`);
      }
    }
    
    // We require at least the profile data
    if (!fileContents.profileData) {
      toast.error("Profile data is required. Please include the Profile.json or Profile.csv file.");
      return null;
    }
    
    return {
      profileData: fileContents.profileData,
      positionsData: fileContents.positionsData || null,
      educationData: fileContents.educationData || null,
      skillsData: fileContents.skillsData || null,
      coursesData: fileContents.coursesData || null
    };
  } catch (error) {
    console.error("Error processing LinkedIn files:", error);
    toast.error("Failed to process LinkedIn data");
    return null;
  }
}

// Process a zip file containing LinkedIn data
export async function processLinkedInZip(zipFile: File): Promise<LinkedInData | null> {
  try {
    // For this implementation, we'll refer users to upload individual JSON files
    // A full zip extraction would require additional libraries
    toast.error("Zip file processing is not supported yet. Please extract and upload individual JSON or CSV files.");
    return null;
  } catch (error) {
    console.error("Error processing LinkedIn zip:", error);
    toast.error("Failed to process LinkedIn zip file");
    return null;
  }
}

// Save LinkedIn data to the database
export async function saveLinkedInData(data: LinkedInData): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      toast.error("You must be logged in to import LinkedIn data");
      return false;
    }
    
    const userId = userData.user.id;
    
    // Check if the user already has LinkedIn data
    const { data: existingData } = await supabase
      .from('linkedin_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    
    if (existingData) {
      // Update existing record
      result = await supabase
        .from('linkedin_profiles')
        .update({
          profile_data: data.profileData,
          positions_data: data.positionsData,
          education_data: data.educationData,
          skills_data: data.skillsData,
          courses_data: data.coursesData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
    } else {
      // Insert new record
      result = await supabase
        .from('linkedin_profiles')
        .insert({
          user_id: userId,
          profile_data: data.profileData,
          positions_data: data.positionsData,
          education_data: data.educationData,
          skills_data: data.skillsData,
          courses_data: data.coursesData
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    toast.success("LinkedIn data imported successfully!");
    return true;
  } catch (error: any) {
    console.error("Error saving LinkedIn data:", error);
    toast.error(error.message || "Failed to save LinkedIn data");
    return false;
  }
}

// Read file as JSON
async function readFileAsJson(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error(`Invalid JSON in file: ${file.name}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Error reading file: ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

// Read file as CSV and convert to object
async function readFileAsCSV(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        
        if (lines.length === 0) {
          reject(new Error(`Empty CSV file: ${file.name}`));
          return;
        }
        
        // Extract headers (first line)
        const headers = lines[0].split(',').map(header => 
          header.trim().replace(/^"|"$/g, '') // Remove quotes if present
        );
        
        // Process data lines
        const results = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          // Split by comma, but respect quoted values that may contain commas
          const values = parseCSVLine(lines[i]);
          
          if (values.length !== headers.length) {
            console.warn(`Line ${i} has ${values.length} values but headers has ${headers.length} columns`);
            continue;
          }
          
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          results.push(row);
        }
        
        // If it's a single entry (like profile), return the first item
        if (file.name.toLowerCase().includes('profile') && results.length === 1) {
          resolve(results[0]);
        } else {
          resolve(results);
        }
      } catch (error) {
        reject(new Error(`Error parsing CSV in file: ${file.name}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Error reading file: ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      // End of value
      result.push(currentValue.trim().replace(/^"|"$/g, ''));
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  result.push(currentValue.trim().replace(/^"|"$/g, ''));
  
  return result;
}

// Fetch user's LinkedIn data
export async function getUserLinkedInData(): Promise<LinkedInData | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      profileData: data.profile_data,
      positionsData: data.positions_data,
      educationData: data.education_data,
      skillsData: data.skills_data,
      coursesData: data.courses_data
    };
  } catch (error) {
    console.error("Error fetching LinkedIn data:", error);
    return null;
  }
}
