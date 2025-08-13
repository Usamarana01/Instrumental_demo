import React, { useState, useContext } from 'react';
import Card from '../components/ui/Card';
import { Site, Asset, ReportConfig, ReportData } from '../types';
import { X, Printer, Filter } from 'lucide-react';

interface ReportPreviewModalProps {
    reportData: ReportData;
    onClose: () => void;
    sites: Site[];
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ reportData, onClose, sites }) => {
    if (!reportData) return null;
    const { config, data, name } = reportData;
    const columns = [
        { header: 'Asset ID', key: 'id' },
        { header: 'Name', key: 'name' },
        { header: 'Type', key: 'type' },
        { header: 'Status', key: 'status' },
        { header: 'Health', key: 'health' },
        { header: 'Criticality', key: 'criticality' },
    ] as const;
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{name}</h2>
                        <p className="text-sm text-gray-500">For {sites.find(s => s.id === config.site)?.name} from {config.startDate || 'start'} to {config.endDate || 'end'}</p>
                    </div>
                    <div>
                        <button onClick={() => window.print()} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"><Printer className="h-5 w-5" /></button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                    </div>
                </header>
                <main className="p-4 overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>{columns.map(c => <th key={c.key} className="px-4 py-3">{c.header}</th>)}</tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id} className="border-b dark:border-gray-700">
                                    {columns.map(c => <td key={c.key} className="px-4 py-3">{item[c.key]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    );
};


interface ReportConfigModalProps {
    report: { id: string, name: string };
    onGenerate: (config: ReportConfig) => void;
    onClose: () => void;
    sites: Site[];
}

const ReportConfigModal: React.FC<ReportConfigModalProps> = ({ report, onGenerate, onClose, sites }) => {
    const [config, setConfig] = useState<ReportConfig>({
        site: sites.length > 0 ? sites[0].id : '',
        startDate: '',
        endDate: '',
        assetType: '',
        criticality: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configure: {report.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                </header>
                <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block col-span-2"><span className="text-gray-700 dark:text-gray-300">Site</span><select name="site" value={config.site} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0">{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
                    <label className="block"><span className="text-gray-700 dark:text-gray-300">Start Date</span><input type="date" name="startDate" value={config.startDate} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                    <label className="block"><span className="text-gray-700 dark:text-gray-300">End Date</span><input type="date" name="endDate" value={config.endDate} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                    <label className="block"><span className="text-gray-700 dark:text-gray-300">Asset Type</span><select name="assetType" value={config.assetType} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"><option value="">All</option><option>Sensor</option><option>Valve</option><option>Controller</option></select></label>
                    <label className="block"><span className="text-gray-700 dark:text-gray-300">Criticality</span><select name="criticality" value={config.criticality} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"><option value="">All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-right space-x-2">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    <button onClick={() => onGenerate(config)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Generate Report</button>
                </footer>
            </div>
        </div>
    );
};

interface ReportsProps {
    getAllAssets: (siteId?: string | null) => Asset[];
    sites: Site[];
}

const Reports: React.FC<ReportsProps> = ({ getAllAssets, sites }) => {
    const [reportConfig, setReportConfig] = useState<{ id: string, name: string, description: string } | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const reportTemplates = [
        { id: 'health', name: 'Asset Health Summary', description: 'Overall health and status summary for all assets.' },
        { id: 'bad_actor', name: 'Bad Actor Analysis', description: 'Top 10 assets with the highest number of alerts.' },
        { id: 'calibration', name: 'Calibration Due Report', description: 'Assets due for calibration within a specified timeframe.' },
        { id: 'event_history', name: 'Event History Log', description: 'Audit trail of all significant device events.' },
    ];

    const generateReport = (config: ReportConfig) => {
        let data = getAllAssets(config.site);

        if (config.startDate) data = data.filter(a => new Date(a.eventTimestamp) >= new Date(config.startDate));
        if (config.endDate) data = data.filter(a => new Date(a.eventTimestamp) <= new Date(config.endDate + 'T23:59:59'));
        if (config.assetType) data = data.filter(a => a.type === config.assetType);
        if (config.criticality) data = data.filter(a => a.criticality === config.criticality);
        
        if (reportConfig?.id === 'bad_actor') {
            data = data.sort((a,b) => b.events.length - a.events.length).slice(0, 10);
        }
        if (reportConfig?.id === 'calibration') {
            data = data.filter(a => new Date(a.calibrationDueDate) < new Date());
        }

        setReportData({ config, data, name: reportConfig!.name });
        setReportConfig(null);
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTemplates.map(template => (
                    <div key={template.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                        <h3 className="font-bold text-lg">{template.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{template.description}</p>
                        <button onClick={() => setReportConfig(template)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Generate</button>
                    </div>
                ))}
            </div>
            {reportConfig && <ReportConfigModal report={reportConfig} onGenerate={generateReport} onClose={() => setReportConfig(null)} sites={sites} />}
            {reportData && <ReportPreviewModal reportData={reportData} onClose={() => setReportData(null)} sites={sites} />}
        </Card>
    );
};

export default Reports;
