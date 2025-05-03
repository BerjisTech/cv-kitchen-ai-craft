
import { getAllCVContext } from './cv/contextService';
import { extractCVData } from './cv/extractorService';
import { updateProfileWithCVData } from './cv/profileUpdaterService';
import { enhanceUserProfile } from './cv/enhancerService';
import type { ExtractedCVData } from './cv/types';

// Re-export all the functionality for backward compatibility
export {
  getAllCVContext,
  extractCVData,
  updateProfileWithCVData,
  enhanceUserProfile
};

// Re-export the type
export type { ExtractedCVData };
