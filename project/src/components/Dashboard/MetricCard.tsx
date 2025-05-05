import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<LucideIcon>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'bg-primary',
}) => {
  return (
    <div className="card animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-1">
            {typeof value === 'number' ? `₪${value.toLocaleString()}` : value}
          </p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs ${
                  trend.isPositive ? 'text-success' : 'text-error'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-text-secondary text-xs mr-1">מהחודש הקודם</span>
            </div>
          )}
        </div>
        
        <div className={`rounded-full p-3 ${color} bg-opacity-10`}>
          {React.cloneElement(icon, { className: color.replace('bg-', 'text-') })}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;