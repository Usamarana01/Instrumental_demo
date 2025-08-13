
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { Asset } from '../../types';
import { getNamurInfo } from '../../constants';

interface NamurStatusTrendChartProps {
    assets: Asset[];
    startDate: string;
    endDate: string;
}

const NamurStatusTrendChart: React.FC<NamurStatusTrendChartProps> = ({ assets, startDate, endDate }) => {

    const chartData = useMemo(() => {
        const dataByDay = new Map<string, { F: number; C: number; S: number; M: number }>();
        
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Initialize all days in the range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dataByDay.set(d.toISOString().split('T')[0], { F: 0, C: 0, S: 0, M: 0 });
        }

        assets.forEach(asset => {
            if (asset.history) {
                asset.history.forEach(hist => {
                    if (dataByDay.has(hist.day) && hist.status !== 'OK') {
                        const dayData = dataByDay.get(hist.day)!;
                        dayData[hist.status]++;
                    }
                });
            }
        });

        return Array.from(dataByDay.entries())
            .map(([day, counts]) => ({ day, ...counts }))
            .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    }, [assets, startDate, endDate]);

    const statuses: ('F' | 'C' | 'S' | 'M')[] = ['F', 'C', 'S', 'M'];

    return (
        <Card className="h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">NAMUR Status Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis 
                        dataKey="day"
                        tick={{ fill: 'currentColor', fontSize: 12 }} 
                        tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                            border: '1px solid #4B5563', 
                            borderRadius: '0.5rem' 
                        }} 
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value, name) => [value, getNamurInfo(name as any).text]}
                    />
                    <Legend />
                    {statuses.map(status => {
                        const info = getNamurInfo(status);
                        return (
                            <Line
                                key={status}
                                type="monotone"
                                dataKey={status}
                                name={status}
                                stroke={info.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default NamurStatusTrendChart;
