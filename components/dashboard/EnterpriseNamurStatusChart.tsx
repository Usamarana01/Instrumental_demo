
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { Site } from '../../types';

interface EnterpriseNamurStatusChartProps {
    sites: Site[];
    onBarClick: (data: { siteId: string, statusKey: string }) => void;
}

const EnterpriseNamurStatusChart: React.FC<EnterpriseNamurStatusChartProps> = ({ sites, onBarClick }) => {
    const data = [
        { name: 'Failure', key: 'F' },
        { name: 'Maint. Req.', key: 'M' },
        { name: 'Out of Spec.', key: 'S' },
        { name: 'Func. Check', key: 'C' }
    ];
    const siteColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

    const chartData = data.map(status => {
        const entry: { [key: string]: any } = { name: status.name, statusKey: status.key };
        sites.forEach(site => {
            entry[site.id] = site.namurSummary[status.key as 'F' | 'C' | 'S' | 'M'];
        });
        return entry;
    });

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const clickedSegment = data.activePayload[0];
            const siteId = clickedSegment.dataKey;
            const statusKey = clickedSegment.payload.statusKey;
            onBarClick({ siteId, statusKey });
        }
    };

    return (
        <Card>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Enterprise NAMUR Status</h2>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }} onClick={handleChartClick} className="cursor-pointer">
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }} cursor={{ fill: 'rgba(100,100,100,0.1)' }}/>
                    <Legend />
                    {sites.map((site, index) => (
                        <Bar key={site.id} dataKey={site.id} name={site.name} stackId="a" fill={siteColors[index % siteColors.length]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default EnterpriseNamurStatusChart;
