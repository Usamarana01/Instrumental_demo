
import React from 'react';
import { X, Shield, Star, FilePlus, RefreshCw, CheckCircle } from 'lucide-react';
import { Asset } from '../../types';
import { getNamurInfo } from '../../constants';

interface AssetDetailModalProps {
    asset: Asset | null;
    onClose: () => void;
    watchList: string[];
    onToggleWatchList: (assetId: string) => void;
    onCreateSapWorkOrder: (assetId: string) => Promise<void>;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose, watchList, onToggleWatchList, onCreateSapWorkOrder }) => {
    if (!asset) return null;

    const { icon: StatusIcon, textColor, text: statusText } = getNamurInfo(asset.namurStatus);
    const isWatched = watchList.includes(asset.id);

    const renderCmmsButton = () => {
        if (!asset.alert || asset.namurStatus === 'OK') {
            return null; // No button if no alert or status is OK
        }

        switch (asset.cmmsStatus) {
            case 'InProgress':
                return (
                    <div className="p-2 rounded-lg flex items-center gap-2 text-sm font-semibold bg-gray-100 dark:bg-gray-700/50 text-gray-500 cursor-wait">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Creating WO...
                    </div>
                );
            case 'Success':
                return (
                     <div className="p-2 rounded-lg flex items-center gap-2 text-sm font-semibold bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        WO: {asset.sapWoNumber}
                    </div>
                );
            case 'Pending':
            default:
                return (
                    <button
                        onClick={() => onCreateSapWorkOrder(asset.id)}
                        className="p-2 rounded-lg flex items-center gap-2 text-sm font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors"
                    >
                        <FilePlus className="h-5 w-5" />
                        Create SAP Work Order
                    </button>
                );
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{asset.name} ({asset.id})</h2>
                    <div className="flex items-center gap-2">
                         {renderCmmsButton()}
                         <button
                            onClick={() => onToggleWatchList(asset.id)}
                            className={`p-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors ${
                                isWatched
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:hover:bg-yellow-900'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Star className={`h-5 w-5 ${isWatched ? 'fill-current text-yellow-500' : 'text-gray-500'}`} />
                            {isWatched ? 'On Watch List' : 'Add to Watch List'}
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>
                <main className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Device Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="font-medium text-gray-500">Make:</span> <span className="font-mono">{asset.make || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-500">Model:</span> <span className="font-mono">{asset.model || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-500">Criticality:</span> <span className={`font-bold ${asset.criticality === 'High' || asset.criticality === 'Critical' ? 'text-red-500' : ''}`}>{asset.criticality || 'N/A'}</span></div>
                                {asset.isSif && <div className="flex justify-between items-center"><span className="font-medium text-gray-500">SIF Related:</span><Shield className="h-5 w-5 text-red-600" /></div>}
                            </div>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Current Status</h3>
                            <div className="flex items-center gap-3">
                                <StatusIcon className={`h-6 w-6 ${textColor}`} />
                                <div>
                                    <div className={`font-bold ${textColor}`}>{statusText}</div>
                                    <div className="text-sm text-gray-500">Health Score: {asset.health}%</div>
                                </div>
                            </div>
                        </section>
                    </div>
                    {asset.alert && (
                        <section className="mt-6">
                            <h3 className={`text-lg font-semibold ${textColor} mb-3 border-b pb-2 flex items-center gap-2`}>
                                <StatusIcon className="h-5 w-5" />Active Alert
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                <h4 className={`font-bold ${textColor}`}>{`[${asset.alert.causeCode}] ${asset.alert.title}`}</h4>
                                <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{asset.alert.description}</p>
                                {asset.alert.remedies && asset.alert.remedies.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-semibold text-sm mb-2">Remedial Actions</h5>
                                        <ul className="space-y-1 list-disc list-inside text-sm">
                                            {asset.alert.remedies.map(remedy => <li key={remedy.id}>{`[${asset.alert.remedyCode}] ${remedy.description}`} <span className="text-xs text-gray-400">(Ref: {remedy.reference})</span></li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AssetDetailModal;