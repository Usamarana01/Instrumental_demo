
import React from 'react';
import Card from '../ui/Card';

interface NamurStatusKPIsProps {
    data: { F: number; C: number; S: number; M: number };
    onSegmentClick: (key: string) => void;
}

const NamurStatusKPIs: React.FC<NamurStatusKPIsProps> = ({ data, onSegmentClick }) => {
    const categories = [
        { key: 'F', name: 'Failure', color: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
        { key: 'C', name: 'Function Check', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
        { key: 'S', name: 'Out of Spec.', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
        { key: 'M', name: 'Maint. Req.', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
    ];
    const totalWithIssues = categories.reduce((sum, cat) => sum + (data[cat.key as keyof typeof data] || 0), 0);

    return (
        <Card>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">NAMUR 107 Status</h2>
            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.key} onClick={() => onSegmentClick(cat.key)} className="cursor-pointer group">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{cat.name}</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{data[cat.key as keyof typeof data]}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className={`${cat.color} h-2.5 rounded-full group-hover:opacity-80 transition-all`} style={{ width: `${totalWithIssues > 0 ? (data[cat.key as keyof typeof data] / totalWithIssues) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default NamurStatusKPIs;
