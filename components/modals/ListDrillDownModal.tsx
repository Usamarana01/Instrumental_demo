
import React from 'react';
import { X } from 'lucide-react';

interface Column {
    key: string;
    header: string;
}

interface ListDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: any[];
    columns: Column[];
}

const ListDrillDownModal: React.FC<ListDrillDownModalProps> = ({ isOpen, onClose, title, items, columns }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title} ({items.length})</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                </header>
                <main className="p-2 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    {columns.map(c => <th key={c.key} className="px-4 py-3">{c.header}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? items.map((item, index) => (
                                    <tr key={item.id || index} className="border-b dark:border-gray-700">
                                        {columns.map(c => (
                                            <td key={c.key} className="px-4 py-3">
                                                {c.key === 'timestamp' || c.key === 'created' || c.key === 'due'
                                                    ? new Date(item[c.key]).toLocaleString()
                                                    : item[c.key]}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-10 text-gray-500">No items to display.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ListDrillDownModal;
