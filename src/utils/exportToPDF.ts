
/**
 * Utility to export an HTML element to PDF
 */

// We'll install html2pdf.js dependency
export const exportToPDF = async (elementId: string, filename = 'cv.pdf') => {
  try {
    // Dynamically import html2pdf.js when needed (reduces initial bundle size)
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      throw new Error(`Element with ID ${elementId} not found`);
    }
    
    // Set PDF options for optimal quality
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and save the PDF
    return html2pdf().from(element).set(opt).save();
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};
