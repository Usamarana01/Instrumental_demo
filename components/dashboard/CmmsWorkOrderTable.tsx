
import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { WorkOrder } from '../../types';
import Pagination from '../ui/Pagination';
import { FileClock, FileCheck2, FileText, Loader2 } from 'lucide-react';

interface CmmsWorkOrderTableProps {
    workOrders: WorkOrder[];
    siteId: string | null;
    onWorkOrderClick: (workOrder: WorkOrder) => void;
}

const PAGE_SIZE = 5;

const getStatusInfo = (status: WorkOrder['status']) => {
    switch (status) {
        case 'Overdue': return { icon: FileClock, color: 'text-red-500', isSpinning: false };
        case 'Completed':
        case 'Closed': return { icon: FileCheck2, color: 'text-green-500', isSpinning: false };
        case 'In Progress':
        case 'Released': return { icon: Loader2, color: 'text-blue-500', isSpinning: true };
        default: return { icon: FileText, color: 'text-gray-500', isSpinning: false };
    }
};

const CmmsWorkOrderTable: React.FC<CmmsWorkOrderTableProps> = ({ workOrders, siteId, onWorkOrderClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredData = useMemo(() => {
        if (!siteId) return workOrders;
        return workOrders.filter(wo => wo.siteId === siteId);
    }, [workOrders, siteId]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredData, currentPage]);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    } else if (filteredData.length > 0 && currentPage === 0) {
        setCurrentPage(1);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    }

    return (
        <Card className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">CMMS Work Order Tracking</h2>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">WO Number</th>
                            <th scope="col" className="px-4 py-3">Asset Name</th>
                            <th scope="col" className="px-4 py-3">Description</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? paginatedData.map((wo) => {
                            const { icon: StatusIcon, color: statusColor, isSpinning } = getStatusInfo(wo.status);
                            return (
                                <tr key={wo.id} onClick={() => onWorkOrderClick(wo)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20 cursor-pointer">
                                    <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{wo.id}</td>
                                    <td className="px-4 py-3">{wo.assetName}</td>
                                    <td className="px-4 py-3 truncate max-w-xs" title={wo.description}>{wo.description}</td>
                                    <td className="px-4 py-3">
                                        <div className={`flex items-center gap-2 font-semibold ${statusColor}`}>
                                            <StatusIcon className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
                                            {wo.status}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono">{formatDate(wo.dueDate)}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    No Work Orders to display for this view.
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

export default CmmsWorkOrderTable;