import { format } from 'date-fns';

// Export interfaces
export interface ExportData {
  [key: string]: any;
}

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  delimiter?: string;
}

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (
  data: ExportData[],
  options: ExportOptions = {}
): string => {
  if (!data.length) return '';

  const { delimiter = ',' } = options;
  
  // Get headers from first object or use provided headers
  const headers = options.headers || Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeader = headers.join(delimiter);
  
  // Create CSV data rows
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Handle null/undefined values
      if (value === null || value === undefined) return '';
      // Escape quotes and wrap in quotes if contains delimiter or quotes
      const stringValue = String(value);
      if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(delimiter)
  );
  
  return [csvHeader, ...csvRows].join('\n');
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (
  data: ExportData[],
  filename: string = 'export.csv',
  options: ExportOptions = {}
): void => {
  const csvContent = arrayToCSV(data, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (
  data: ExportData[],
  filename: string = 'export.json'
): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Create and download Excel file (using CSV format for simplicity)
 */
export const downloadExcel = (
  data: ExportData[],
  filename: string = 'export.xlsx',
  options: ExportOptions = {}
): void => {
  // For now, we'll create a CSV that Excel can open
  // In a real implementation, you'd use a library like xlsx or exceljs
  const csvContent = arrayToCSV(data, options);
  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const excelFilename = filename.replace('.xlsx', '.csv');
  downloadBlob(blob, excelFilename);
};

/**
 * Generic blob download function
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return '';
  }
};

/**
 * Sanitize filename for download
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Generate timestamp-based filename
 */
export const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  return sanitizeFilename(`${prefix}_${timestamp}.${extension}`);
};