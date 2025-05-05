import React, { useState, useEffect } from 'react';
import { Investment } from '../../types';
import { CircleDollarSign, Calendar, FileText, Tag } from 'lucide-react';

interface InvestmentFormProps {
  initialInvestment?: Investment;
  onSubmit: (investment: Omit<Investment, 'id'>) => void;
  onCancel: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  initialInvestment,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<Investment, 'id'>>({
    name: '',
    type: 'stocks',
    initialAmount: 0,
    currentAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    lastUpdateDate: new Date().toISOString().split('T')[0],
    returnRate: 0,
    monthlyContribution: 0,
    notes: '',
  });
  
  useEffect(() => {
    if (initialInvestment) {
      setFormData(initialInvestment);
    }
  }, [initialInvestment]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Amount') || name === 'returnRate' || name === 'monthlyContribution'
        ? parseFloat(value)
        : value,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="form-label">
            <span className="flex items-center gap-2">
              <Tag size={16} />
              <span>שם ההשקעה</span>
            </span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="type" className="form-label">סוג השקעה</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
          >
            <option value="stocks">מניות</option>
            <option value="bonds">אגרות חוב</option>
            <option value="savings">חסכונות</option>
            <option value="pension">פנסיה</option>
            <option value="property">נדל"ן</option>
            <option value="other">אחר</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="initialAmount" className="form-label">
            <span className="flex items-center gap-2">
              <CircleDollarSign size={16} />
              <span>סכום התחלתי</span>
            </span>
          </label>
          <input
            type="number"
            id="initialAmount"
            name="initialAmount"
            value={formData.initialAmount}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="currentAmount" className="form-label">
            <span className="flex items-center gap-2">
              <CircleDollarSign size={16} />
              <span>שווי נוכחי</span>
            </span>
          </label>
          <input
            type="number"
            id="currentAmount"
            name="currentAmount"
            value={formData.currentAmount}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="startDate" className="form-label">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              <span>תאריך התחלה</span>
            </span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="monthlyContribution" className="form-label">
            <span className="flex items-center gap-2">
              <CircleDollarSign size={16} />
              <span>הפקדה חודשית</span>
            </span>
          </label>
          <input
            type="number"
            id="monthlyContribution"
            name="monthlyContribution"
            value={formData.monthlyContribution}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="notes" className="form-label">
            <span className="flex items-center gap-2">
              <FileText size={16} />
              <span>הערות</span>
            </span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-input h-24"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          ביטול
        </button>
        <button type="submit" className="btn btn-primary">
          שמור
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;