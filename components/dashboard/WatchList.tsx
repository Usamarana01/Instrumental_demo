
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../ui/Card';
import { Asset } from '../../types';
import { getNamurInfo } from '../../constants';
import { Zap, Briefcase, Wind, Gauge } from 'lucide-react';
import Pagination from '../ui/Pagination';

interface WatchListProps {
    assetIds: string[];
    onItemClick: (assetId: string) => void;
    siteId: string | null;
    getAllAssets: (siteId?: string | null) => Asset[];
    startDate: string;
    endDate: string;
}

const PAGE_SIZE = 5;

const WatchList: React.FC<WatchListProps> = ({ assetIds, onItemClick, siteId, getAllAssets, startDate, endDate }) => {
    const getIcon = (type: Asset['type']) => {
        switch (type) {
            case 'Controller': return <Zap className="h-5 w-5 text-blue-500" />;
            case 'Machine': return <Briefcase className="h-5 w-5 text-indigo-500" />;
            case 'Valve': return <Wind className="h-5 w-5 text-teal-500" />;
            default: return <Gauge className="h-5 w-5 text-gray-500" />;
        }
    };

    const assets = useMemo(() => {
        const allWatchListAssets = getAllAssets(siteId).filter(a => assetIds.includes(a.id));
        
        return allWatchListAssets.filter(asset => {
            if (!startDate || !endDate) return true;
            const eventDate = new Date(asset.eventTimestamp);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the whole end day
            return eventDate >= start && eventDate <= end;
        });
    }, [siteId, assetIds, getAllAssets, startDate, endDate]);

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(assets.length / PAGE_SIZE);

    const paginatedAssets = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return assets.slice(startIndex, startIndex + PAGE_SIZE);
    }, [assets, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (assets.length > 0 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [assets, currentPage, totalPages]);

    return (
        <Card className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Watch List</h2>
            <div className="space-y-2 flex-grow">
                {paginatedAssets.length > 0 ? paginatedAssets.map(item => (
                    <div key={item.id} onClick={() => onItemClick(item.id)} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                            {getIcon(item.type)}
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${getNamurInfo(item.namurStatus).bgColor} text-white shrink-0`}>
                            {getNamurInfo(item.namurStatus).text}
                        </div>
                    </div>
                )) : <p className="text-sm text-gray-500 dark:text-gray-400">No assets on the watch list for this view and date range.</p>}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

export default WatchList;
