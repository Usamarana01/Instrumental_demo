
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, Label } from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import { Asset, Site, Enterprise, Area, Unit, Pen } from '../types';
import { getNamurInfo } from '../constants';

// PenSelector Tree Components
const AssetParameterTree = ({ node, selectedPens, onPenToggle, path = [] }: { node: any, selectedPens: string[], onPenToggle: (penId: string) => void, path?: string[] }) => {
    const [isOpen, setIsOpen] = useState(path.length < 2);
    const hasChildren = node.sites || node.areas || node.units || node.assets;

    return (
        <div className="ml-2 text-sm">
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
                {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />)}
                <span className="font-medium">{node.name}</span>
            </div>
            {isOpen && (
                <div className="ml-4 border-l border-gray-200 dark:border-gray-700">
                    {hasChildren && (node.sites || node.areas || node.units || node.assets).map((childNode: any, index: number) => (
                        <AssetParameterTree key={childNode.id || index} node={childNode} selectedPens={selectedPens} onPenToggle={onPenToggle} path={[...path, node.name]} />
                    ))}
                    {node.timeSeriesData && Object.keys(node.timeSeriesData).map(param => {
                        const penId = `${node.id}.${param}`;
                        return (
                            <div key={penId} className="flex items-center ml-4 p-1">
                                <input type="checkbox" id={penId} checked={selectedPens.includes(penId)} onChange={() => onPenToggle(penId)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor={penId} className="ml-2">{param} ({node.timeSeriesData[param].unit})</label>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const PenSelector = ({ siteId, selectedPens, onPenToggle, enterprise }: { siteId: string | null, selectedPens: string[], onPenToggle: (penId: string) => void, enterprise: Enterprise }) => {
    const rootNode = siteId ? enterprise.sites.find(s => s.id === siteId) : enterprise;
    if(!rootNode) return null;
    return <AssetParameterTree node={rootNode} selectedPens={selectedPens} onPenToggle={onPenToggle} />;
};


// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 text-white text-sm backdrop-blur-sm">
                <p className="label font-bold mb-2">{`${new Date(label).toLocaleString()}`}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }}>{`${pld.name}: ${pld.value.toFixed(2)}`}</div>
                ))}
            </div>
        );
    }
    return null;
};

interface TrendsProps {
    siteId: string | null;
    getAllAssets: (siteId?: string | null) => Asset[];
    enterprise: Enterprise;
}

const Trends: React.FC<TrendsProps> = ({ siteId, getAllAssets, enterprise }) => {
    const [selectedPens, setSelectedPens] = useState<Pen[]>([]);
    
    const getISODateDaysAgo = (days: number) => new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(getISODateDaysAgo(6));
    const [endDate, setEndDate] = useState(getISODateDaysAgo(0));


    const handlePenToggle = (penId: string) => {
        setSelectedPens(prev =>
            prev.some(p => p.id === penId)
                ? prev.filter(p => p.id !== penId)
                : [...prev, { id: penId, assetId: penId.split('.')[0], param: penId.split('.')[1] }]
        );
    };

    const penData = useMemo(() => {
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        let combinedData: { [timestamp: string]: any } = {};
        const yAxes: { [unit: string]: { yAxisId: string, orientation: 'left' | 'right', color: string } } = {};
        let yAxisCount = 0;
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

        const pensWithData = selectedPens.map((pen) => {
            const asset = getAllAssets().find(a => a.id === pen.assetId);
            if (!asset || !asset.timeSeriesData[pen.param]) return null;

            const { unit, data } = asset.timeSeriesData[pen.param];
            if (!yAxes[unit]) {
                yAxes[unit] = { yAxisId: `y${yAxisCount}`, orientation: yAxisCount % 2 === 0 ? 'left' : 'right', color: colors[yAxisCount % colors.length] };
                yAxisCount++;
            }
            
            data.filter(d => {
                 const pointDate = new Date(d.timestamp);
                 return pointDate >= start && pointDate <= end;
            }).forEach(point => {
                const ts = new Date(point.timestamp).getTime();
                if (!combinedData[ts]) {
                    combinedData[ts] = { timestamp: ts };
                }
                combinedData[ts][pen.id] = point.value;
            });

            return { ...pen, yAxisId: yAxes[unit].yAxisId, color: yAxes[unit].color, unit };
        }).filter(p => p !== null) as (Pen & { yAxisId: string, color: string, unit: string })[];

        const chartData = Object.values(combinedData).sort((a, b) => a.timestamp - b.timestamp);

        // --- NAMUR Status Visualization Logic ---
        const statusSegments: any[] = [];
        const statusChangeLines: any[] = [];
        const primaryAssetId = selectedPens.length > 0 ? selectedPens[0].assetId : null;
        const primaryAsset = primaryAssetId ? getAllAssets().find(a => a.id === primaryAssetId) : null;
        
        if (primaryAsset && primaryAsset.history) {
            const startTs = start.getTime();
            const endTs = end.getTime();

            const sortedHistory = [...primaryAsset.history].sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

            const lastHistoryBefore = sortedHistory.slice().reverse().find(h => new Date(h.day).getTime() < startTs);
            const initialStatus = lastHistoryBefore ? lastHistoryBefore.status : 'OK';

            const statusTimeline = [{ timestamp: startTs, status: initialStatus }];
            
            sortedHistory.forEach(h => {
                const eventTs = new Date(h.day + 'T00:00:00.000Z').getTime();
                if (eventTs >= startTs && eventTs <= endTs) {
                    if (statusTimeline[statusTimeline.length - 1].status !== h.status) {
                        statusTimeline.push({ timestamp: eventTs, status: h.status });
                    }
                }
            });

            for (let i = 0; i < statusTimeline.length; i++) {
                const currentEvent = statusTimeline[i];
                const nextEvent = statusTimeline[i + 1];
                
                if (currentEvent.status !== 'OK') {
                    statusSegments.push({
                        x1: currentEvent.timestamp,
                        x2: nextEvent ? nextEvent.timestamp : endTs,
                        status: currentEvent.status
                    });
                }

                if (i > 0) {
                    const statusInfo = getNamurInfo(currentEvent.status);
                    statusChangeLines.push({
                        timestamp: currentEvent.timestamp,
                        label: statusInfo.text,
                        color: statusInfo.color
                    });
                }
            }
        }
        
        return { chartData, yAxes, pens: pensWithData, statusSegments, statusChangeLines, primaryAssetId };
    }, [selectedPens, startDate, endDate, getAllAssets]);

    const setDateRange = (days: number) => {
        setEndDate(getISODateDaysAgo(0));
        setStartDate(getISODateDaysAgo(days - 1));
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-4">
            <div className="md:w-1/3 lg:w-1/4 h-1/2 md:h-full">
                <Card className="h-full overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4">Select Pens</h2>
                    <PenSelector siteId={siteId} selectedPens={selectedPens.map(p => p.id)} onPenToggle={handlePenToggle} enterprise={enterprise}/>
                </Card>
            </div>
            <div className="md:w-2/3 lg:w-3/4 h-1/2 md:h-full">
                <Card className="h-full flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                         <div className="flex flex-col">
                            <h2 className="text-lg font-semibold">Trend Analysis</h2>
                            {penData.primaryAssetId && (
                                <p className="text-xs text-gray-500">Status context shown for: {penData.primaryAssetId}</p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="flex items-center gap-2">
                              <label htmlFor="startDate" className="text-xs font-medium">Start:</label>
                              <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 p-1.5" />
                           </div>
                            <div className="flex items-center gap-2">
                              <label htmlFor="endDate" className="text-xs font-medium">End:</label>
                              <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 p-1.5" />
                           </div>
                            {[1, 7, 30].map(days => (
                                <button key={days} onClick={() => setDateRange(days)} className={`px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`}>
                                    Last {days}D
                                </button>
                            ))}
                        </div>
                    </div>
                    {penData.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={penData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis 
                                    type="number" 
                                    domain={['dataMin', 'dataMax']} 
                                    dataKey="timestamp" 
                                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} 
                                    tick={{ fill: 'currentColor', fontSize: 12 }} 
                                />
                                {Object.entries(penData.yAxes).map(([unit, axis]) => (
                                    <YAxis key={axis.yAxisId} yAxisId={axis.yAxisId} orientation={axis.orientation} stroke={axis.color} tick={{ fill: 'currentColor', fontSize: 12 }} label={{ value: unit, angle: -90, position: axis.orientation === 'left' ? 'insideLeft' : 'insideRight', fill: 'currentColor', dx: axis.orientation === 'left' ? 0 : -10 }} />
                                ))}
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                
                                {penData.statusSegments.map((segment, index) => {
                                    const info = getNamurInfo(segment.status);
                                    return (
                                        <ReferenceArea
                                            key={`area-${index}`}
                                            yAxisId={Object.values(penData.yAxes)[0]?.yAxisId || 'y0'}
                                            x1={segment.x1}
                                            x2={segment.x2}
                                            stroke="none"
                                            fill={info.color}
                                            fillOpacity={0.15}
                                            ifOverflow="visible"
                                        />
                                    );
                                })}

                                {penData.statusChangeLines.map((line, index) => (
                                     <ReferenceLine 
                                         key={`line-${index}`} 
                                         x={line.timestamp} 
                                         stroke={line.color} 
                                         strokeDasharray="4 4"
                                         yAxisId={Object.values(penData.yAxes)[0]?.yAxisId || 'y0'}
                                     >
                                        <Label value={line.label.toUpperCase()} position="insideTopLeft" fill={line.color} fontSize={10} fontWeight="bold" />
                                     </ReferenceLine>
                                ))}

                                {penData.pens.map(pen => (
                                    <Line key={pen.id} yAxisId={pen.yAxisId} type="monotone" dataKey={pen.id} name={`${pen.assetId} - ${pen.param}`} stroke={pen.color} dot={false} strokeWidth={2}/>
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-gray-500">Select pens from the sidebar to begin.</div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Trends;
