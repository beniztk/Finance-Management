import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Investment } from '../../types';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface InvestmentListProps {
  onEdit: (investment: Investment) => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({ onEdit }) => {
  const { investments, deleteInvestment } = useFinanceStore();
  
  const handleDelete = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק השקעה זו?')) {
      deleteInvestment(id);
    }
  };
  
  const getInvestmentTypeText = (type: Investment['type']) => {
    const types = {
      stocks: 'מניות',
      bonds: 'אגרות חוב',
      savings: 'חסכונות',
      pension: 'פנסיה',
      property: 'נדל"ן',
      other: 'אחר',
    };
    return types[type];
  };
  
  return (
    <div className="space-y-4">
      {investments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-text-secondary">
            אין השקעות. הוסף השקעות חדשות כדי לעקוב אחר הביצועים שלהן.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investments.map((investment) => {
            const returnAmount = investment.currentAmount - investment.initialAmount;
            const returnPercentage = (returnAmount / investment.initialAmount) * 100;
            const isPositive = returnAmount >= 0;
            
            return (
              <div
                key={investment.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{investment.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {getInvestmentTypeText(investment.type)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(investment)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      title="ערוך"
                    >
                      <Pencil size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(investment.id)}
                      className="p-1 rounded-full hover:bg-gray-100 text-error"
                      title="מחק"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>סכום התחלתי:</span>
                    <span>₪{investment.initialAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>שווי נוכחי:</span>
                    <span>₪{investment.currentAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>תשואה:</span>
                    <span
                      className={`flex items-center gap-1 ${
                        isPositive ? 'text-success' : 'text-error'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      <span>
                        ₪{Math.abs(returnAmount).toLocaleString()} (
                        {returnPercentage.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                  
                  {investment.monthlyContribution > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>הפקדה חודשית:</span>
                      <span>₪{investment.monthlyContribution.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestmentList;