import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, AlertTriangle, Check, CreditCard, Building, Loader2 } from 'lucide-react';

interface ImportFormProps {
  onFileAccepted: (file: File, source: 'max' | 'bank') => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ImportForm: React.FC<ImportFormProps> = ({ onFileAccepted }) => {
  const [error, setError] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<'max' | 'bank'>('max');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const onDrop = async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    setIsProcessing(true);
    
    try {
      if (rejectedFiles.length > 0) {
        setError('הקובץ חייב להיות בפורמט Excel (.xlsx/.xls) ובגודל של עד 10MB');
        return;
      }
      
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        setError('גודל הקובץ חורג מ-10MB');
        return;
      }
      
      await onFileAccepted(file, selectedSource);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד הקובץ');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isProcessing
  });
  
  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedSource === 'max'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary'
          }`}
          onClick={() => setSelectedSource('max')}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center gap-2">
            <CreditCard size={24} className={selectedSource === 'max' ? 'text-primary' : ''} />
            <span className="font-medium">MAX כרטיס אשראי</span>
          </div>
        </button>
        
        <button
          type="button"
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedSource === 'bank'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary'
          }`}
          onClick={() => setSelectedSource('bank')}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center gap-2">
            <Building size={24} className={selectedSource === 'bank' ? 'text-primary' : ''} />
            <span className="font-medium">חשבון בנק</span>
          </div>
        </button>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <Loader2 size={40} className="text-primary animate-spin" />
          ) : (
            <FileUp size={40} className="text-primary" />
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isProcessing ? 'מעבד קובץ...' :
               isDragActive ? 'שחרר את הקובץ כאן' : 'גרור קובץ לכאן או לחץ לבחירה'}
            </p>
            <p className="text-sm text-text-secondary">
              קבצי Excel בלבד (.xlsx/.xls), עד 10MB
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-error/10 p-4 rounded-lg border border-error/30">
          <p className="flex items-center gap-2 text-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </p>
        </div>
      )}
      
      <div className="bg-primary/5 p-4 rounded-lg space-y-2">
        <h3 className="font-medium">מבנה הקובץ הנדרש:</h3>
        {selectedSource === 'max' ? (
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <span>תאריך עסקה (DD/MM/YYYY)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <span>שם בית העסק</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <span>קטגוריה</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <span>סכום חיוב</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <span>תאריך חיוב (DD/MM/YYYY)</span>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <span>עמודות נדרשות: תאריך, תיאור, סכום</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ImportForm;