import * as XLSX from 'xlsx';
import { Transaction } from '../types';

const parseDate = (dateStr: string): string => {
  try {
    // Handle dates in DD-MM-YYYY format
    if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-').map(part => part.trim());
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) {
        throw new Error(`תאריך לא תקין: ${dateStr}`);
      }
      return date.toISOString().split('T')[0];
    }
    
    // Handle dates in DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(part => part.trim());
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) {
        throw new Error(`תאריך לא תקין: ${dateStr}`);
      }
      return date.toISOString().split('T')[0];
    }
    
    throw new Error(`תאריך לא תקין: ${dateStr}`);
  } catch (error) {
    throw new Error(`תאריך לא תקין: ${dateStr}`);
  }
};

const parseAmount = (amount: string | number): number => {
  if (typeof amount === 'number') {
    // For numeric values, preserve the sign
    return amount;
  }
  
  // Remove currency symbols, commas and spaces
  const cleanAmount = amount.replace(/[₪,\s]/g, '').trim();
  
  // Parse the amount, preserving negative signs
  const parsedAmount = parseFloat(cleanAmount);
  
  if (isNaN(parsedAmount)) {
    throw new Error(`סכום לא תקין: ${amount}`);
  }
  
  return parsedAmount;
};

export const processExcelFile = (file: File): Promise<{
  success: boolean;
  records_processed: number;
  errors: string[];
  transactions: Omit<Transaction, 'id'>[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const errors: string[] = [];
    const transactions: Omit<Transaction, 'id'>[] = [];

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays and skip empty rows
        const rows = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: ''
        }) as string[][];
        
        // Find the header row (usually contains "תאריך עסקה")
        const headerRowIndex = rows.findIndex(row => 
          row.some(cell => cell && cell.includes('תאריך עסקה'))
        );
        
        if (headerRowIndex === -1) {
          throw new Error('לא נמצאה כותרת "תאריך עסקה" בקובץ');
        }
        
        // Map column indices
        const headers = rows[headerRowIndex];
        const columnMap = {
          date: headers.findIndex(h => h.includes('תאריך עסקה')),
          merchant: headers.findIndex(h => h.includes('שם בית העסק')),
          category: headers.findIndex(h => h.includes('קטגוריה')),
          amount: headers.findIndex(h => h.includes('סכום חיוב')),
          chargeDate: headers.findIndex(h => h.includes('תאריך חיוב'))
        };
        
        // Validate required columns
        if (columnMap.date === -1 || columnMap.amount === -1) {
          throw new Error('חסרות עמודות חובה בקובץ (תאריך עסקה, סכום חיוב)');
        }
        
        // Process data rows (skip header)
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          
          // Skip empty rows
          if (!row || !row[columnMap.date] || !row[columnMap.amount]) continue;
          
          try {
            const date = parseDate(row[columnMap.date]);
            const amount = parseAmount(row[columnMap.amount]);
            const description = row[columnMap.merchant] || '';
            const category = row[columnMap.category] || 'כללי';
            
            transactions.push({
              date,
              amount,
              description,
              category,
              person: 'yuval', // Will be set by the import form
              source: 'credit_card',
              notes: columnMap.chargeDate >= 0 && row[columnMap.chargeDate] 
                ? `תאריך חיוב: ${row[columnMap.chargeDate]}`
                : ''
            });
          } catch (error) {
            if (error instanceof Error) {
              errors.push(`שגיאה בשורה ${i + 1}: ${error.message}`);
            } else {
              errors.push(`שגיאה בשורה ${i + 1}: שגיאה לא ידועה`);
            }
          }
        }

        resolve({
          success: transactions.length > 0,
          records_processed: transactions.length,
          errors,
          transactions
        });

      } catch (error) {
        console.error('Error processing file:', error);
        reject(new Error('שגיאה בעיבוד הקובץ. אנא ודא שהקובץ תואם את הפורמט הנדרש'));
      }
    };

    reader.onerror = () => {
      reject(new Error('שגיאה בקריאת הקובץ'));
    };

    reader.readAsBinaryString(file);
  });
};