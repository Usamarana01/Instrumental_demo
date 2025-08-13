
import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { Asset } from '../../types';
import { getNamurInfo } from '../../constants';
import Pagination from '../ui/Pagination';

interface BadActorsTableProps {
    data: Asset[];
    onActorClick: (assetId: string) => void;
    startDate: string;
    endDate: string;
}

const PAGE_SIZE = 5;

const BadActorsTable: React.FC<BadActorsTableProps> = ({ data, onActorClick, startDate, endDate }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        return data.filter(asset => {
            if (!startDate || !endDate) return true;
            const eventDate = new Date(asset.eventTimestamp);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the whole end day
            return eventDate >= start && eventDate <= end;
        });
    }, [data, startDate, endDate]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage]);
    
    // Reset to page 1 if filtered data results in fewer pages
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    } else if (filteredData.length > 0 && currentPage === 0) {
        setCurrentPage(1);
    }


    return (
        <Card className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Alerts</h2>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">Asset Name</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Last Event</th>
                            <th scope="col" className="px-4 py-3"># Events</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? paginatedData.map((actor) => {
                            const { icon: NamurIcon, textColor, text: namurText } = getNamurInfo(actor.namurStatus);
                            return (
                                <tr key={actor.id} onClick={() => onActorClick(actor.id)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20 cursor-pointer">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{actor.name}</td>
                                    <td className="px-4 py-3">
                                        <div className={`flex items-center gap-2 font-semibold ${textColor}`}>
                                            <NamurIcon className="h-4 w-4" />
                                            {namurText}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{actor.alert.title}</td>
                                    <td className="px-4 py-3">{actor.events.length}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">
                                    No alerts match the current date range.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

export default BadActorsTable;
