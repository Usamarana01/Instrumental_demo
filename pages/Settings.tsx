import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Plug, Rss, Database, Link, Power, PowerOff, AlertTriangle, Trash2, PlusCircle, Repeat, Share2, GitBranch, User, Edit, Save, XCircle, X } from 'lucide-react';

// ConnectorCard Component (for generic sources)
const ConnectorCard = ({ connector, onConfigure }: { connector: any, onConfigure: () => void }) => {
    const statusInfo: { [key: string]: { color: string, icon: React.ElementType } } = {
        Connected: { color: 'text-green-500', icon: Power },
        Disconnected: { color: 'text-gray-500', icon: PowerOff },
        Error: { color: 'text-red-500', icon: AlertTriangle },
    };
    const currentStatus = statusInfo[connector.status] || statusInfo.Disconnected;

    return (
        <Card className="flex flex-col">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <connector.icon className="h-8 w-8 text-gray-500" />
                    <h3 className="text-lg font-bold">{connector.name}</h3>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${currentStatus.color}`}>
                    <currentStatus.icon className="h-4 w-4" />
                    {connector.status}
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1 flex-grow">
                {Object.entries(connector.config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-mono truncate" title={String(value)}>{String(value)}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-right">
                <button onClick={onConfigure} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Configure</button>
            </div>
        </Card>
    );
};


// PamConnectorCard (for specialized PAM interfaces)
const PamConnectorCard = ({ connector, onConfigure }: { connector: any, onConfigure: () => void }) => {
    const statusInfo: { [key: string]: { color: string, icon: React.ElementType, text: string } } = {
        'Active Sync': { color: 'text-green-500', icon: Power, text: 'Active Sync' },
        'Standby': { color: 'text-amber-500', icon: PowerOff, text: 'Standby' },
        'Error': { color: 'text-red-500', icon: AlertTriangle, text: 'Error' },
    };
    const currentStatus = statusInfo[connector.status];

    return (
        <Card className="lg:col-span-2 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <connector.icon className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                    <div>
                        <h3 className="text-xl font-bold">{connector.name}</h3>
                        <div className={`flex items-center gap-1 text-sm font-semibold ${currentStatus.color}`}>
                            <currentStatus.icon className="h-4 w-4" />
                            {currentStatus.text}
                        </div>
                    </div>
                </div>
                 <button onClick={onConfigure} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2">
                    <Edit className="h-4 w-4" /> Configure
                </button>
            </div>
            <dl className="text-sm border-t dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                 {Object.entries(connector.config).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <dt className="font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                        <dd className="font-mono text-gray-800 dark:text-gray-200 truncate" title={String(value)}>{String(value)}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
};

// Firebase Config Modal
const FirebaseConfigModal = ({ connector, onClose, onSave }: { connector: any, onClose: () => void, onSave: (data: any) => void }) => {
    const [config, setConfig] = useState(connector.config);
    const mockServiceAccount = JSON.stringify({
        "type": "service_account",
        "project_id": "instrumental-prod-12345",
        "private_key_id": "a1b2c3d4e5f6...",
        "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
        "client_email": "firebase-adminsdk-xyz@instrumental-prod-12345.iam.gserviceaccount.com",
        "client_id": "12345678901234567890",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "..."
    }, null, 2);

    const handleSave = () => onSave({ ...connector, config });

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configure: {connector.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Connection Details</h3>
                         <label className="block"><span className="text-sm font-medium text-gray-500">Database URL</span><input type="text" value={config.databaseURL || ''} onChange={e => setConfig(c => ({...c, databaseURL: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                    </section>
                     <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Service Account Credentials</h3>
                        <p className="text-xs text-gray-500 mb-2">Service account JSON provides secure, server-to-server access to your Firebase project.</p>
                        <textarea readOnly value={mockServiceAccount} rows={10} className="w-full text-xs font-mono p-2 rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700" />
                    </section>
                </main>
                 <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-right space-x-2">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Save Changes</button>
                </footer>
            </div>
        </div>
    );
};


// OLEDB Configuration Modal
const OledbConfigModal = ({ connector, onClose, onSave }: { connector: any, onClose: () => void, onSave: (data: any) => void }) => {
    const [config, setConfig] = useState(connector.config || {});
    const [transformations, setTransformations] = useState(connector.transformations || { prefix: '', multiplier: 1, offset: 0, qualityMap: [] });

    const handleSave = () => {
        onSave({ ...connector, config, transformations });
    };

    const handleQualityMapChange = (index: number, field: 'source' | 'instrumental', value: string) => {
        const newMap = [...transformations.qualityMap];
        newMap[index][field] = value;
        setTransformations(t => ({ ...t, qualityMap: newMap }));
    };

    const addQualityMapping = () => {
        setTransformations(t => ({ ...t, qualityMap: [...t.qualityMap, { source: '', instrumental: 'OK' }] }));
    };

    const removeQualityMapping = (index: number) => {
        const newMap = transformations.qualityMap.filter((_: any, i: number) => i !== index);
        setTransformations(t => ({ ...t, qualityMap: newMap }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configure: {connector.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Connection Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block"><span className="text-sm font-medium text-gray-500">Provider</span><input type="text" value={config.provider || ''} onChange={e => setConfig(c => ({...c, provider: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                            <label className="block"><span className="text-sm font-medium text-gray-500">Server</span><input type="text" value={config.server || ''} onChange={e => setConfig(c => ({...c, server: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                            <label className="block"><span className="text-sm font-medium text-gray-500">Database</span><input type="text" value={config.database || ''} onChange={e => setConfig(c => ({...c, database: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                            <label className="block"><span className="text-sm font-medium text-gray-500">Username</span><input type="text" value={config.username || ''} onChange={e => setConfig(c => ({...c, username: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                            <label className="block col-span-2"><span className="text-sm font-medium text-gray-500">Password</span><input type="password" value={config.password || ''} onChange={e => setConfig(c => ({...c, password: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                        </div>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Data Transformations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="block"><span className="text-sm font-medium text-gray-500">Tag Name Prefix</span><input type="text" value={transformations.prefix} onChange={e => setTransformations(t => ({...t, prefix: e.target.value}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                            <label className="block"><span className="text-sm font-medium text-gray-500">Value Multiplier</span><input type="number" step="0.01" value={transformations.multiplier} onChange={e => setTransformations(t => ({...t, multiplier: parseFloat(e.target.value)}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                            <label className="block"><span className="text-sm font-medium text-gray-500">Value Offset</span><input type="number" step="0.01" value={transformations.offset} onChange={e => setTransformations(t => ({...t, offset: parseFloat(e.target.value)}))} className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0" /></label>
                        </div>
                        <div className="mt-4">
                             <h4 className="text-sm font-medium text-gray-500 mb-2">Quality Mapping</h4>
                             <div className="space-y-2">
                                {transformations.qualityMap.map((map: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" placeholder="Source Quality" value={map.source} onChange={e => handleQualityMapChange(index, 'source', e.target.value)} className="w-1/3 text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 p-2" />
                                        <span className="font-bold">→</span>
                                        <select value={map.instrumental} onChange={e => handleQualityMapChange(index, 'instrumental', e.target.value)} className="flex-grow text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 p-2">
                                            <option value="OK">OK (Normal)</option>
                                            <option value="F">F (Failure)</option>
                                            <option value="C">C (Function Check)</option>
                                            <option value="S">S (Out of Specification)</option>
                                            <option value="M">M (Maintenance Required)</option>
                                        </select>
                                        <button onClick={() => removeQualityMapping(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                ))}
                                <button onClick={addQualityMapping} className="text-sm flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"><PlusCircle className="h-4 w-4" /> Add Mapping</button>
                             </div>
                        </div>
                    </section>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-right space-x-2">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Save Changes</button>
                </footer>
            </div>
        </div>
    );
};

// Generic Configuration Modal
const GenericConfigModal = ({ connector, onClose, onSave }: { connector: any, onClose: () => void, onSave: (data: any) => void }) => {
    const [config, setConfig] = useState(connector.config || {});

    const handleSave = () => {
        onSave({ ...connector, config });
    };

    const handleConfigChange = (key: string, value: string | number) => {
        const originalValue = connector.config[key];
        const newValue = typeof originalValue === 'number' ? Number(value) : value;
        setConfig(prev => ({ ...prev, [key]: newValue }));
    };

    const formatLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configure: {connector.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Configuration</h3>
                    {Object.keys(config).map(key => (
                        <label key={key} className="block">
                            <span className="text-sm font-medium text-gray-500">{formatLabel(key)}</span>
                            <input
                                type={typeof config[key] === 'number' ? 'number' : 'text'}
                                value={config[key]}
                                onChange={e => handleConfigChange(key, e.target.value)}
                                className="mt-1 block w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            />
                        </label>
                    ))}
                     {Object.keys(config).length === 0 && <p className="text-gray-500">No configuration options for this connector.</p>}
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-right space-x-2">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Save Changes</button>
                </footer>
            </div>
        </div>
    );
};


// DataSourcesSettings Component
const DataSourcesSettings = () => {
    const [connectors, setConnectors] = useState({
        opc_ua: { id: 'opc_ua', name: 'OPC UA', icon: Plug, status: 'Connected', config: { endpoint: 'opc.tcp://192.168.1.10:4840', securityPolicy: 'Basic256Sha256' } },
        opc_da: { id: 'opc_da', name: 'OPC DA', icon: Database, status: 'Disconnected', config: { serverProgId: 'Matrikon.OPC.Simulation.1', updateRate: 1000 } },
        opc_ae: { id: 'opc_ae', name: 'OPC A&E', icon: AlertTriangle, status: 'Connected', config: { serverProgId: 'OPC.Sim.A&E', subscriptionType: 'Alarms & Events' } },
        mqtt: { id: 'mqtt', name: 'MQTT', icon: Rss, status: 'Connected', config: { broker: 'mqtt://192.168.1.12:1883', topic: 'spBv1.0/#' } },
        oledb: { id: 'oledb', name: 'OLEDB', icon: Database, status: 'Error', config: { provider: 'SQLOLEDB', server: 'HISTORIAN-DB' }, transformations: { prefix: 'SITE_A_', multiplier: 1, offset: 0, qualityMap: [{ source: '192', instrumental: 'OK' }, { source: '0', instrumental: 'F' }] } },
        firebase: { id: 'firebase', name: 'Firebase Realtime DB', icon: Database, status: 'Connected', config: { databaseURL: 'https://instrumental-prod-12345.firebaseio.com' } }
    });
     const [pamConnectors, setPamConnectors] = useState({
        yokogawa: { id: 'yokogawa', name: 'Yokogawa PRM', icon: Share2, status: 'Active Sync', config: { 'PRM Server': 'yoko-prm.prod.corp', 'API Version': 'R4.05', 'Sync Interval': '15 minutes', 'Asset Scope': 'All Monitored Assets' } },
        emerson: { id: 'emerson', name: 'Emerson AMS', icon: Link, status: 'Active Sync', config: { 'AMS Web Service URL': 'https://ams.prod.corp/soap', 'Database': 'AMS_Suite_Production', 'Last Sync': new Date().toLocaleString(), 'Health Alerts Only': 'True' } },
        honeywell: { id: 'honeywell', name: 'Honeywell FDM', icon: GitBranch, status: 'Standby', config: { 'FDM Server': 'honey-fdm.prod.corp', 'Connection Type': 'SDK v5.2', 'Timeout (sec)': '60', 'Use Trusted Connection': 'True' } },
        foxboro: { id: 'foxboro', name: 'Foxboro Evo FDM', icon: Database, status: 'Error', config: { 'FDM SQL Server': 'fox-sql.prod.corp', 'Database Instance': 'AIM', 'Error Detail': 'Login failed for user \'SVC_INSTRMNTL\'', 'Last Attempt': new Date(Date.now() - 360000).toLocaleString() } },
    });
    
    const [editingConnector, setEditingConnector] = useState<any>(null);

    const handleSaveConnector = (updatedConnector: any) => {
        if (connectors.hasOwnProperty(updatedConnector.id)) {
            setConnectors(prev => ({ ...prev, [updatedConnector.id]: updatedConnector }));
        } else if (pamConnectors.hasOwnProperty(updatedConnector.id)) {
            setPamConnectors(prev => ({ ...prev, [updatedConnector.id]: updatedConnector }));
        }
        setEditingConnector(null);
    };

    const getModalForConnector = () => {
        if (!editingConnector) return null;
        switch(editingConnector.id) {
            case 'oledb':
                return <OledbConfigModal connector={editingConnector} onClose={() => setEditingConnector(null)} onSave={handleSaveConnector} />;
            case 'firebase':
                return <FirebaseConfigModal connector={editingConnector} onClose={() => setEditingConnector(null)} onSave={handleSaveConnector} />;
            default:
                // Check if it's a PAM connector or other generic connector
                if (pamConnectors.hasOwnProperty(editingConnector.id) || connectors.hasOwnProperty(editingConnector.id)) {
                    return <GenericConfigModal connector={editingConnector} onClose={() => setEditingConnector(null)} onSave={handleSaveConnector} />;
                }
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                 <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b dark:border-gray-700">Plant Asset Management (PAM) Connectors</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.values(pamConnectors).map(conn => <PamConnectorCard key={conn.id} connector={conn} onConfigure={() => setEditingConnector(conn)} />)}
                 </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b dark:border-gray-700">Generic Data Connectors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(connectors).map(conn => <ConnectorCard key={conn.id} connector={conn} onConfigure={() => setEditingConnector(conn)} />)}
                </div>
                 {getModalForConnector()}
            </div>
        </div>
    );
};


// --- CMMS Settings Components ---
interface SapConfig {
    middlewareEndpoint: string;
    odataEndpoint: string;
    ruleHigh: 'WO' | 'WR' | 'Queue';
    ruleMedium: 'WO' | 'WR' | 'Queue';
    ruleLow: 'WO' | 'WR' | 'Queue';
    woType: string;
    wrNotificationType: string;
    queueTable: string;
    adminEmail: string;
    retryAttempts: number;
}

const ConfigItem = ({ label, value, isEditing, onChange, type = 'text', children }: {label: string, value: any, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, children?: React.ReactNode}) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700/50">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-sm text-gray-900 dark:text-gray-50 mt-1 sm:mt-0 w-full sm:w-1/2 md:w-2/3">
            {isEditing ? (
                children || <input type={type} value={value} onChange={onChange} className="w-full text-left sm:text-right bg-gray-100 dark:bg-gray-900/80 p-1.5 rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
            ) : (
                <span className="font-mono block text-left sm:text-right">{value}</span>
            )}
        </dd>
    </div>
);

const RuleConfigItem = ({ severity, value, isEditing, onChange }: {severity: string, value: string, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void}) => {
    const options = { WO: 'Auto-Create Work Order', WR: 'Auto-Create Work Request', Queue: 'Queue for Manual Review' };
    return (
         <ConfigItem label={`When Severity is ${severity}`} value={options[value as keyof typeof options]} isEditing={isEditing} onChange={() => {}}>
            <select value={value} onChange={onChange} className="w-full text-left sm:text-right bg-gray-100 dark:bg-gray-900/80 p-1.5 rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="WO">{options.WO}</option>
                <option value="WR">{options.WR}</option>
                <option value="Queue">{options.Queue}</option>
            </select>
        </ConfigItem>
    );
};


const CmmsSettings = () => {
    const [sapConfig, setSapConfig] = useState<SapConfig>({
        middlewareEndpoint: 'https://middleware.example.com/api/sap-alerts',
        odataEndpoint: '/sap/opu/odata/sap/API_EQUIPMENT/',
        ruleHigh: 'WO',
        ruleMedium: 'WR',
        ruleLow: 'Queue',
        woType: 'PM02 (Corrective)',
        wrNotificationType: 'M1',
        queueTable: 'ZALERT_QUEUE',
        adminEmail: 'sap.admins@example.com',
        retryAttempts: 3,
    });
    const [maximoConnector] = useState({
        id: 'maximo', name: 'IBM Maximo', icon: Link, status: 'Disconnected', config: { method: 'REST API', endpoint: 'https://maximo.example.com/...' }
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempConfig, setTempConfig] = useState(sapConfig);

    const handleEdit = () => {
        setTempConfig(sapConfig);
        setIsEditing(true);
    };
    const handleSave = () => {
        setSapConfig(tempConfig);
        setIsEditing(false);
    };
    const handleCancel = () => setIsEditing(false);
    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, key: keyof SapConfig) => {
        setTempConfig(prev => ({...prev, [key]: e.target.value}));
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-2">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link className="h-8 w-8 text-gray-500" />
                        <div>
                            <h3 className="text-xl font-bold">SAP Plant Maintenance</h3>
                            <div className="flex items-center gap-1 text-sm font-semibold text-green-500"><Power className="h-4 w-4" /> Connected</div>
                        </div>
                    </div>
                    <div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={handleCancel} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm"><XCircle className="h-4 w-4"/>Cancel</button>
                                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm"><Save className="h-4 w-4"/>Save</button>
                            </div>
                        ) : (
                            <button onClick={handleEdit} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-2 px-4 rounded-lg text-sm"><Edit className="h-4 w-4"/>Edit Configuration</button>
                        )}
                    </div>
                </div>
                
                <dl className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-6 border-t pt-4 dark:border-gray-600">Endpoints</h4>
                    <ConfigItem label="Middleware Endpoint" value={isEditing ? tempConfig.middlewareEndpoint : sapConfig.middlewareEndpoint} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'middlewareEndpoint')} />
                    <ConfigItem label="SAP OData Endpoint" value={isEditing ? tempConfig.odataEndpoint : sapConfig.odataEndpoint} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'odataEndpoint')} />
                
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-8 border-t pt-4 dark:border-gray-600">Business Rules</h4>
                    <RuleConfigItem severity="High" value={isEditing ? tempConfig.ruleHigh : sapConfig.ruleHigh} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'ruleHigh')} />
                    <RuleConfigItem severity="Medium" value={isEditing ? tempConfig.ruleMedium : sapConfig.ruleMedium} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'ruleMedium')} />
                    <RuleConfigItem severity="Low" value={isEditing ? tempConfig.ruleLow : sapConfig.ruleLow} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'ruleLow')} />

                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-8 border-t pt-4 dark:border-gray-600">Action Parameters</h4>
                    <ConfigItem label="Work Order Type" value={isEditing ? tempConfig.woType : sapConfig.woType} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'woType')} />
                    <ConfigItem label="Work Request Notification Type" value={isEditing ? tempConfig.wrNotificationType : sapConfig.wrNotificationType} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'wrNotificationType')} />
                    <ConfigItem label="Manual Review Queue Table" value={isEditing ? tempConfig.queueTable : sapConfig.queueTable} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'queueTable')} />

                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-8 border-t pt-4 dark:border-gray-600">Response Handling</h4>
                    <ConfigItem label="Admin Notification Email" value={isEditing ? tempConfig.adminEmail : sapConfig.adminEmail} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'adminEmail')} type="email" />
                    <ConfigItem label="Retry Attempts on Failure" value={isEditing ? tempConfig.retryAttempts : sapConfig.retryAttempts} isEditing={isEditing} onChange={(e) => handleConfigChange(e, 'retryAttempts')} type="number" />
                </dl>

            </Card>

            <div>
                 <ConnectorCard connector={maximoConnector} onConfigure={() => { /* Modal logic would go here */ }} />
            </div>
        </div>
    );
};


// Main SettingsScreen Component
const SettingsScreen = () => {
    const [activeTab, setActiveTab] = useState('Data Sources');
    const tabs = ['Data Sources', 'CMMS Integration', 'User Management', 'Notifications'];

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Settings</h2>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-6">
                {activeTab === 'Data Sources' && <DataSourcesSettings />}
                {activeTab === 'CMMS Integration' && <CmmsSettings />}
                {activeTab === 'User Management' && <p className="text-gray-500">User management settings will be configured here.</p>}
                {activeTab === 'Notifications' && <p className="text-gray-500">Notification settings will be configured here.</p>}
            </div>
        </Card>
    );
};

export default SettingsScreen;
