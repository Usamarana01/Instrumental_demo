
import React, { useState, useMemo } from 'react';
import { X, Search, FilterX, Shield } from 'lucide-react';
import { Asset } from '../../types';
import { formatDuration } from '../../constants';

interface AssetListDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    assets: Asset[];
    onAssetClick: (asset: Asset) => void;
    showSite?: boolean;
}

const AssetListDrillDownModal: React.FC<AssetListDrillDownModalProps> = ({ isOpen, onClose, title, assets, onAssetClick, showSite = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [instrumentType, setInstrumentType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const instrumentTypes = useMemo(() => [...new Set(assets.map(a => a.type))], [assets]);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                asset.name.toLowerCase().includes(lowerSearchTerm) ||
                asset.id.toLowerCase().includes(lowerSearchTerm) ||
                (asset.alert && asset.alert.title.toLowerCase().includes(lowerSearchTerm)) ||
                (asset.alert && asset.alert.causeCode.toLowerCase().includes(lowerSearchTerm)) ||
                (asset.alert && asset.alert.remedyCode && asset.alert.remedyCode.toLowerCase().includes(lowerSearchTerm));

            const matchesType = instrumentType === '' || asset.type === instrumentType;
            const eventDate = new Date(asset.eventTimestamp);
            const matchesStartDate = startDate === '' || eventDate >= new Date(startDate);
            const matchesEndDate = endDate === '' || eventDate <= new Date(endDate + 'T23:59:59');

            return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
        });
    }, [assets, searchTerm, instrumentType, startDate, endDate]);

    const resetFilters = () => {
        setSearchTerm('');
        setInstrumentType('');
        setStartDate('');
        setEndDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title} ({filteredAssets.length} of {assets.length} assets)</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                </header>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700 flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Smart search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select value={instrumentType} onChange={e => setInstrumentType(e.target.value)} className="flex-grow min-w-[150px] text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2">
                        <option value="">All Types</option>
                        {instrumentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-grow min-w-[120px] text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" title="Start Date" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-grow min-w-[120px] text-sm rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" title="End Date" />
                    <button onClick={resetFilters} className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg" title="Reset Filters">
                        <FilterX className="h-5 w-5" />
                    </button>
                </div>
                <main className="p-2 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    {showSite && <th className="px-4 py-3">Site</th>}
                                    <th className="px-4 py-3">Asset</th>
                                    <th className="px-4 py-3">Criticality</th>
                                    <th className="px-4 py-3">Cause</th>
                                    <th className="px-4 py-3">Remedy</th>
                                    <th className="px-4 py-3">Event Time</th>
                                    <th className="px-4 py-3">Duration</th>
                                    <th className="px-4 py-3">SIF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                                    <tr key={asset.id} onClick={() => onAssetClick(asset)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20 cursor-pointer">
                                        {showSite && <td className="px-4 py-3">{asset.siteName}</td>}
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{asset.name}</td>
                                        <td className={`px-4 py-3 font-bold ${asset.criticality === 'High' || asset.criticality === 'Critical' ? 'text-red-500' : asset.criticality === 'Medium' ? 'text-yellow-600' : ''}`}>{asset.criticality}</td>
                                        <td className="px-4 py-3">{asset.alert ? `[${asset.alert.causeCode}] ${asset.alert.title}` : 'N/A'}</td>
                                        <td className="px-4 py-3">{asset.alert && asset.alert.remedies && asset.alert.remedies.length > 0 ? `[${asset.alert.remedyCode}] ${asset.alert.remedies[0].description}` : 'N/A'}</td>
                                        <td className="px-4 py-3">{asset.eventTimestamp ? new Date(asset.eventTimestamp).toLocaleString() : 'N/A'}</td>
                                        <td className="px-4 py-3">{formatDuration(asset.eventTimestamp)}</td>
                                        <td className="px-4 py-3">{asset.isSif ? <Shield className="h-5 w-5 text-red-600" /> : null}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={showSite ? 8 : 7} className="text-center py-10 text-gray-500">No assets match the current filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AssetListDrillDownModal;
