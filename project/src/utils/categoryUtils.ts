import { Category } from '../types';

export const getDefaultCategories = (): Category[] => [
  {
    id: '1',
    name: 'מזון',
    color: '#EF4444',
    keywords: ['סופר', 'מסעדה', 'משלוח', 'קפה', 'שופרסל', 'רמי לוי'],
  },
  {
    id: '2',
    name: 'תחבורה',
    color: '#F59E0B',
    keywords: ['דלק', 'רכבת', 'אוטובוס', 'מונית', 'חניה', 'טסלה', 'רכב'],
  },
  {
    id: '3',
    name: 'דיור',
    color: '#3B82F6',
    keywords: ['שכירות', 'ארנונה', 'חשמל', 'מים', 'גז', 'ועד בית'],
  },
  {
    id: '4',
    name: 'בידור',
    color: '#8B5CF6',
    keywords: ['סרט', 'הופעה', 'מוזיקה', 'נטפליקס', 'ספוטיפיי', 'סטרימינג'],
  },
  {
    id: '5',
    name: 'בריאות',
    color: '#10B981',
    keywords: ['רופא', 'תרופות', 'קופת חולים', 'טיפול', 'ביטוח בריאות'],
  },
  {
    id: '6',
    name: 'ילדים',
    color: '#EC4899',
    keywords: ['צעצועים', 'בית ספר', 'חוגים', 'בייביסיטר', 'גן'],
  },
  {
    id: '7',
    name: 'מנויים',
    color: '#6366F1',
    keywords: ['חבילת סלולר', 'אינטרנט', 'כבלים', 'עיתון', 'הוט', 'בזק', 'סלקום', 'פרטנר'],
  },
];

export const suggestCategory = (description: string, categories: Category[]): string => {
  const lowerDescription = description.toLowerCase();
  
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (lowerDescription.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }
  
  return '';
};