
import React, { useState } from 'react';
import { MockData, Asset } from '../types';
import BadActorsTable from '../components/dashboard/BadActorsTable';
import WatchList from '../components/dashboard/WatchList';
import NamurStatusTrendChart from '../components/dashboard/NamurStatusTrendChart';
import AiAssistant from '../components/dashboard/AiAssistant';
import Card from '../components/ui/Card';
import CmmsWorkOrderTable from '../components/dashboard/CmmsWorkOrderTable';

interface Kpi {
    id: string;
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    secondaryValue?: string;
}

interface DashboardProps {
    siteId: string | null;
    onKpiClick: (kpiId: string) => void;
    onOpenAssetDetail: (assetId: string) => void;
    mockData: MockData;
    getAllAssets: (siteId?: string | null) => Asset[];
    kpis: Kpi[];
    watchList: string[];
}

const KpiGrid: React.FC<{ kpis: Kpi[], onKpiClick: (kpiId: string) => void }> = ({ kpis, onKpiClick }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map(kpi => (
            <div key={kpi.id} onClick={() => onKpiClick(kpi.id)} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm hover:shadow-md hover:-translate-y-1" title={`${kpi.label}: ${kpi.value} ${kpi.secondaryValue || ''}`}>
                <kpi.icon className={`h-6 w-6 mb-2 ${kpi.color || 'text-blue-500'}`} />
                <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{kpi.value}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 w-full truncate">{kpi.label}</p>
                 {kpi.secondaryValue && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 w-full truncate">{kpi.secondaryValue}</p>
                )}
            </div>
        ))}
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({
    siteId,
    onKpiClick,
    onOpenAssetDetail,
    mockData,
    getAllAssets,
    kpis,
    watchList,
}) => {
    const getISODateDaysAgo = (days: number) => new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(getISODateDaysAgo(29));
    const [endDate, setEndDate] = useState(getISODateDaysAgo(0));

    return (
        <div>
            <Card className="mb-6 flex flex-wrap items-center justify-end gap-4">
                 <h3 className="text-md font-semibold mr-auto">Analysis Timeframe</h3>
                 <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date:</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" />
                 </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium">End Date:</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" />
                </div>
            </Card>

            <div className="mb-6">
                <KpiGrid kpis={kpis} onKpiClick={onKpiClick} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <NamurStatusTrendChart assets={getAllAssets(siteId)} startDate={startDate} endDate={endDate} />
                </div>
                <div className="lg:col-span-2">
                    <BadActorsTable
                        data={getAllAssets(siteId).filter(a => a.namurStatus !== 'OK').sort((a,b) => b.events.length - a.events.length)}
                        onActorClick={onOpenAssetDetail}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>
                <div className="lg:col-span-1">
                    <WatchList
                        assetIds={watchList}
                        onItemClick={onOpenAssetDetail}
                        siteId={siteId}
                        getAllAssets={getAllAssets}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>
                <div className="lg:col-span-3">
                    <CmmsWorkOrderTable
                        workOrders={mockData.workOrders}
                        siteId={siteId}
                        onWorkOrderClick={(wo) => onOpenAssetDetail(wo.assetId)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;