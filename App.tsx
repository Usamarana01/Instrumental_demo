import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AlignLeft, X, LayoutDashboard, BarChart2, Share2, FileText, Settings, Bell, Search, Star, Zap, HeartPulse, LoaderCircle, GitBranch, Thermometer, Sparkles, FilePlus2, FileCheck2, FileClock, LogOut } from 'lucide-react';
import { Asset, Site, SidebarStats, MockData, WorkOrder } from './types';
import { getNamurInfo } from './constants';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import SettingsScreen from './pages/Settings';
import Trends from './pages/Trends';
import AssetListDrillDownModal from './components/modals/AssetListDrillDownModal';
import ListDrillDownModal from './components/modals/ListDrillDownModal';
import AssetDetailModal from './components/modals/AssetDetailModal';
import AiAssistant from './components/dashboard/AiAssistant';
import LoginPage from './pages/LoginPage';
import { login, fetchData, createWorkOrder, updateWatchList } from './services/mockApi';

const Sidebar = ({ currentPage, setCurrentPage, onLogout }: { currentPage: string, setCurrentPage: (page: string) => void, onLogout: () => void }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
        { name: 'Trends', icon: BarChart2, page: 'Trends' },
        { name: 'Reports', icon: FileText, page: 'Reports' },
        { name: 'Settings', icon: Settings, page: 'Settings' },
    ];

    return (
        <aside className="bg-white dark:bg-gray-800/50 border-r border-r-gray-200 dark:border-gray-700 w-64 p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-blue-600 rounded-lg"><Zap className="h-6 w-6 text-white" /></div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Instrumental</h1>
            </div>
            <nav className="flex-grow overflow-y-auto">
                <ul>
                    {navItems.map(item => (
                        <li key={item.name}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(item.page); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === item.page ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'}`}>
                                <item.icon className="h-5 w-5" />{item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="border-t dark:border-gray-700 pt-4">
                 <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
                    <LogOut className="h-5 w-5" /> Logout
                 </button>
            </div>
        </aside>
    );
};

export default function App() {
    // App state
    const [data, setData] = useState<MockData | null>(null);
    const [isAppLoading, setIsAppLoading] = useState(true);
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    // UI State
    const [currentPage, setCurrentPage] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Asset[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Modal State
    const [assetListModal, setAssetListModal] = useState({ isOpen: false, title: '', assets: [] as Asset[], showSite: false });
    const [listModal, setListModal] = useState({ isOpen: false, title: '', items: [] as any[], columns: [] as { header: string, key: string }[] });
    const [detailAssetState, setDetailAssetState] = useState<{ isOpen: false, asset: null } | { isOpen: true, asset: Asset }>({ isOpen: false, asset: null });

    const handleLogin = async (username, password) => {
        setIsLoginLoading(true);
        setLoginError(null);
        try {
            const { token: apiToken } = await login(username, password);
            setToken(apiToken);
            setIsAuthenticated(true);
        } catch (err) {
            setLoginError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleLogout = () => {
        setToken(null);
        setIsAuthenticated(false);
        setData(null);
    };

    // --- Data fetching from mock API ---
    useEffect(() => {
        const fetchAppData = async () => {
            if (!token) return;
            setIsAppLoading(true);
            try {
                const appData: MockData = await fetchData(token);
                setData(appData);
            } catch (error) {
                console.error("Error fetching application data:", error);
                handleLogout();
            } finally {
                setIsAppLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchAppData();
        }
    }, [isAuthenticated, token]);


    // --- Helper functions ---
    const getAllAssets = useCallback((siteId: string | null = null): Asset[] => {
        if (!data) return [];
        let sites = data.enterprise.sites;
        if (siteId) {
            sites = sites.filter(s => s.id === siteId);
        }
        return sites.flatMap(site => site.areas.flatMap(area => area.units.flatMap(unit => unit.assets)));
    }, [data]);

    const getEnterpriseSidebarStats = useCallback(() => {
        if (!data) return {};
        const allStats = data.enterprise.sites.map(s => s.sidebarStats);
        const enterpriseStats: any = {};
        if (allStats.length === 0) return {};
        Object.keys(allStats[0]).forEach(key => {
            enterpriseStats[key] = allStats.reduce((sum, current: any) => sum + current[key], 0);
        });
        return enterpriseStats;
    }, [data]);
    
     const createSapWorkOrder = async (assetId: string) => {
        const asset = getAllAssets().find(a => a.id === assetId);
        if (!asset || !token) return;
        
        setData(d => d ? { ...d, enterprise: { ...d.enterprise, sites: d.enterprise.sites.map(s => ({ ...s, areas: s.areas.map(a => ({ ...a, units: a.units.map(u => ({ ...u, assets: u.assets.map(as => as.id === assetId ? {...as, cmmsStatus: 'InProgress'} : as) })) }))}))} } : null);

        const newWorkOrderPayload: Omit<WorkOrder, 'id'> = {
            assetId: assetId,
            assetName: asset.name,
            siteId: asset.siteId,
            description: asset.alert.remedies.length > 0 ? asset.alert.remedies[0].description : `Corrective action for: ${asset.alert.title}`,
            type: 'Work Order',
            status: 'Created',
            priority: 'High',
            createdDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        };

        try {
            const newWorkOrder: WorkOrder = await createWorkOrder(newWorkOrderPayload, token);
            
            setData(d => {
                if (!d) return null;
                const assetToUpdate = getAllAssets().find(a => a.id === assetId);
                if(assetToUpdate) {
                    assetToUpdate.cmmsStatus = 'Success';
                    assetToUpdate.sapWoNumber = newWorkOrder.id;
                }
                return { ...d, workOrders: [...d.workOrders, newWorkOrder] };
            });
        } catch (error) {
            console.error(error);
            setData(d => d ? { ...d, enterprise: { ...d.enterprise, sites: d.enterprise.sites.map(s => ({ ...s, areas: s.areas.map(a => ({ ...a, units: a.units.map(u => ({ ...u, assets: u.assets.map(as => as.id === assetId ? {...as, cmmsStatus: 'Error'} : as) })) }))}))} } : null);
        }
    };
    
    const toggleWatchListItem = async (assetId: string) => {
        if (!data || !token) return;

        const currentWatchList = data.watchList || [];
        const newWatchList = currentWatchList.includes(assetId)
            ? currentWatchList.filter(id => id !== assetId)
            : [...currentWatchList, assetId];
        
        setData(d => d ? { ...d, watchList: newWatchList } : null);

        try {
            await updateWatchList(newWatchList, token);
        } catch (error) {
            console.error("Failed to update watchlist:", error);
            setData(d => d ? { ...d, watchList: currentWatchList } : null);
        }
    };

    const handleOpenAssetDetail = (asset: Asset) => {
        if (asset) {
            setAssetListModal(p => ({ ...p, isOpen: false }));
            setDetailAssetState({ isOpen: true, asset: asset });
        }
    };
    
    const handleOpenAssetListModal = (title: string, assets: Asset[], showSite = false) => {
        setAssetListModal({ isOpen: true, title, assets, showSite });
    };

    const handleKpiClick = (kpiId: string) => {
        if (!data) return;
        const assets = getAllAssets(selectedSiteId);
        const showSiteColumn = !selectedSiteId;
        const workOrderColumns = [{ header: "ID", key: "id" }, { header: "Asset", key: "assetName" }, { header: "Description", key: "description" }, { header: "Status", key: "status" }, { header: "Due Date", key: "dueDate" }];

        switch (kpiId) {
            case 'health-status':
            case 'unhealthy': handleOpenAssetListModal('Failure Assets', assets.filter(a => a.namurStatus === 'F'), showSiteColumn); break;
            case 'maint-req': handleOpenAssetListModal('Maintenance Required Assets', assets.filter(a => a.namurStatus === 'M'), showSiteColumn); break;
            case 'out-of-spec': handleOpenAssetListModal('Out of Specification Assets', assets.filter(a => a.namurStatus === 'S'), showSiteColumn); break;
            case 'func-check': handleOpenAssetListModal('Function Check Assets', assets.filter(a => a.namurStatus === 'C'), showSiteColumn); break;
            case 'watchlist': handleOpenAssetListModal('Watch List Assets', assets.filter(a => data.watchList.includes(a.id)), showSiteColumn); break;
            case 'system-msgs': setListModal({ isOpen: true, title: "System Messages", items: data.systemMessages, columns: [{ header: "Message", key: "text" }, { header: "Timestamp", key: "timestamp" }] }); break;
            case 'user-msgs': setListModal({ isOpen: true, title: "User Messages", items: data.userMessages.filter(m => !selectedSiteId || m.siteId === selectedSiteId), columns: [{ header: "From", key: "from" }, { header: "Message", key: "text" }, { header: "Timestamp", key: "timestamp" }] }); break;
            case 'cmms-req': setListModal({ isOpen: true, title: "CMMS Requests", items: data.cmmsRequests.filter(r => !selectedSiteId || r.siteId === selectedSiteId), columns: [{ header: "WO #", key: "id" }, { header: "Asset ID", key: "assetId" }, { header: "Description", key: "description" }, { header: "Status", key: "status" }, { header: "Created", key: "created" }] }); break;
            case 'undelivered': setListModal({ isOpen: true, title: "Undelivered CMMS Requests", items: data.undeliveredCmms.filter(u => !selectedSiteId || u.siteId === selectedSiteId), columns: [{ header: "Asset ID", key: "assetId" }, { header: "Error", key: "error" }, { header: "Timestamp", key: "timestamp" }] }); break;
            case 'down-units': setListModal({ isOpen: true, title: "Down Units", items: data.downUnits.filter(d => !selectedSiteId || d.siteId === selectedSiteId), columns: [{ header: "Unit", key: "name" }, { header: "Reason", key: "reason" }, { header: "Duration", key: "duration" }] }); break;
            case 'overdue-routes': setListModal({ isOpen: true, title: "Overdue Routes", items: data.overdueRoutes.filter(o => !selectedSiteId || o.siteId === selectedSiteId), columns: [{ header: "Route Name", key: "name" }, { header: "Assets", key: "assets" }, { header: "Completed", key: "completed" }, { header: "Due Date", key: "due" }] }); break;
            case 'overdue-cal': handleOpenAssetListModal('Overdue Calibrations', assets.filter(a => a.calibrationDueDate && new Date(a.calibrationDueDate) < new Date()), showSiteColumn); break;
            case 'serious-probs': handleOpenAssetListModal('High Impact Instruments (SIF)', assets.filter(a => a.namurStatus === 'F' && a.isSif), showSiteColumn); break;
            case 'spurious-trips':
                const trips = data.spuriousTrips.filter(t => !selectedSiteId || t.siteId === selectedSiteId);
                setListModal({ isOpen: true, title: "Spurious Trips Log", items: trips, columns: [ { header: "Asset Name", key: "assetName" }, { header: "Reason", key: "reason" }, { header: "Timestamp", key: "timestamp" } ] });
                break;
            case 'wo-created':
                const createdWos = data.workOrders.filter(wo => !selectedSiteId || wo.siteId === selectedSiteId);
                setListModal({ isOpen: true, title: "Created Work Orders", items: createdWos, columns: workOrderColumns });
                break;
            case 'wo-closed':
                const closedWos = data.workOrders.filter(wo => (!selectedSiteId || wo.siteId === selectedSiteId) && (wo.status === 'Completed' || wo.status === 'Closed'));
                setListModal({ isOpen: true, title: "Closed Work Orders", items: closedWos, columns: workOrderColumns });
                break;
            case 'wo-overdue':
                const overdueWos = data.workOrders.filter(wo => (!selectedSiteId || wo.siteId === selectedSiteId) && wo.status === 'Overdue');
                setListModal({ isOpen: true, title: "Overdue Work Orders", items: overdueWos, columns: workOrderColumns });
                break;
            default: console.log("KPI Clicked:", kpiId);
        }
    };
    
    const onOpenAssetDetailFromId = (id: string) => {
        const asset = getAllAssets().find(a => a.id === id);
        if (asset) handleOpenAssetDetail(asset);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            const lowerCaseQuery = searchQuery.toLowerCase();
            const results = getAllAssets().filter(asset =>
                asset.name.toLowerCase().includes(lowerCaseQuery) || asset.id.toLowerCase().includes(lowerCaseQuery) || asset.type.toLowerCase().includes(lowerCaseQuery) || (asset.alert && asset.alert.title.toLowerCase().includes(lowerCaseQuery)) || asset.siteName.toLowerCase().includes(lowerCaseQuery)
            );
            setSearchResults(results.slice(0, 10));
        }, 250);
        return () => clearTimeout(handler);
    }, [searchQuery, getAllAssets]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setIsSearchFocused(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchResultClick = (asset: Asset) => {
        onOpenAssetDetailFromId(asset.id);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);
    };
    
    const kpis = useMemo(() => {
        if (!data) return [];
        let stats: SidebarStats & { namurC: number, namurS: number, namurM: number };
        const zeroStats = { unhealthy: 0, watchList: 0, systemMessages: 0, userMessages: 0, cmmsRequests: 0, undeliveredCmms: 0, downUnits: 0, overdueRoutes: 0, overdueCalibrations: 0, seriousProblems: 0, spuriousTrips: 0, workOrdersCreated: 0, workOrdersClosed: 0, workOrdersOverdue: 0, namurC: 0, namurS: 0, namurM: 0 };
        const totalAssets = getAllAssets(selectedSiteId).length;

        if (selectedSiteId) {
            const site = data.enterprise.sites.find((s: Site) => s.id === selectedSiteId);
            stats = site ? { ...site.sidebarStats, namurC: site.namurSummary.C, namurS: site.namurSummary.S, namurM: site.namurSummary.M } : zeroStats;
        } else {
            const enterpriseStats = getEnterpriseSidebarStats() as SidebarStats;
            const enterpriseNamur = data.enterprise.sites.reduce((acc, site) => {
                acc.C += site.namurSummary.C; acc.S += site.namurSummary.S; acc.M += site.namurSummary.M;
                return acc;
            }, { C: 0, S: 0, M: 0 });
            stats = { ...enterpriseStats, namurC: enterpriseNamur.C, namurS: enterpriseNamur.S, namurM: enterpriseNamur.M };
        }
        
        stats.watchList = data.watchList.filter(id => !selectedSiteId || id.startsWith(selectedSiteId)).length;
        const healthyPercentage = totalAssets > 0 ? (((totalAssets - stats.unhealthy) / totalAssets) * 100).toFixed(0) : '100';

        return [
            { id: 'unhealthy', label: 'Failure', value: stats.unhealthy, icon: getNamurInfo('F').icon, color: getNamurInfo('F').textColor },
            { id: 'func-check', label: 'Func. Check', value: stats.namurC, icon: getNamurInfo('C').icon, color: getNamurInfo('C').textColor },
            { id: 'out-of-spec', label: 'Out of Spec', value: stats.namurS, icon: getNamurInfo('S').icon, color: getNamurInfo('S').textColor },
            { id: 'maint-req', label: 'Maint. Req.', value: stats.namurM, icon: getNamurInfo('M').icon, color: getNamurInfo('M').textColor },
            { id: 'serious-probs', label: 'High Impact', value: stats.seriousProblems, icon: getNamurInfo('F').icon, color: getNamurInfo('F').textColor },
            { id: 'health-status', label: 'Device Health', value: `${healthyPercentage}%`, secondaryValue: `(${stats.unhealthy} Unhealthy)`, icon: HeartPulse, color: 'text-green-500' },
            { id: 'overdue-cal', label: 'Overdue Cal.', value: stats.overdueCalibrations, icon: Thermometer, color: 'text-amber-500' },
            { id: 'wo-created', label: 'WOs Created', value: stats.workOrdersCreated, icon: FilePlus2, color: 'text-blue-500' },
            { id: 'wo-closed', label: 'WOs Closed', value: stats.workOrdersClosed, icon: FileCheck2, color: 'text-green-500' },
            { id: 'wo-overdue', label: 'WOs Overdue', value: stats.workOrdersOverdue, icon: FileClock, color: 'text-red-500' },
            { id: 'spurious-trips', label: 'Spurious Trips', value: stats.spuriousTrips, icon: GitBranch, color: 'text-orange-500' },
            { id: 'watchlist', label: 'Watch List', value: stats.watchList, icon: Star, color: 'text-yellow-500' },
        ];
    }, [selectedSiteId, data, getAllAssets, getEnterpriseSidebarStats]);

    const renderPage = () => {
        if (!data) return null; // Should be handled by the loading screen below
        switch (currentPage) {
            case 'Dashboard': return <Dashboard siteId={selectedSiteId} onKpiClick={handleKpiClick} onOpenAssetDetail={onOpenAssetDetailFromId} mockData={data} getAllAssets={getAllAssets} kpis={kpis} watchList={data.watchList}/>;
            case 'Reports': return <Reports getAllAssets={getAllAssets} sites={data.enterprise.sites} />;
            case 'Settings': return <SettingsScreen />;
            case 'Trends': return <Trends siteId={selectedSiteId} getAllAssets={getAllAssets} enterprise={data.enterprise} />;
            default: return <Dashboard siteId={selectedSiteId} onKpiClick={handleKpiClick} onOpenAssetDetail={onOpenAssetDetailFromId} mockData={data} getAllAssets={getAllAssets} kpis={kpis} watchList={data.watchList} />;
        }
    };
    
    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} error={loginError} isLoading={isLoginLoading} />;
    }

    if (isAppLoading || !data) {
       return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle className="h-12 w-12 animate-spin text-blue-500" />
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Application Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-md">
                {isSidebarOpen ? <X /> : <AlignLeft />}
            </button>
            <div className={`fixed lg:static inset-y-0 left-0 z-20 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
            </div>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 lg:bg-transparent lg:dark:bg-transparent">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentPage}</h1>
                         {data && <select value={selectedSiteId || ''} onChange={e => setSelectedSiteId(e.target.value || null)} className="text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 p-2">
                            <option value="">Enterprise Overview</option>
                            {data.enterprise.sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                        </select>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center" ref={searchContainerRef}>
                            <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input type="text" placeholder="Search assets, alerts..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} />
                            {isSearchFocused && searchQuery.length > 1 && (
                                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-50">
                                    {searchResults.length > 0 ? (
                                        <ul>{searchResults.map(asset => (<li key={asset.id} onMouseDown={() => handleSearchResultClick(asset)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 last:border-b-0"><p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{asset.name}</p><p className="text-sm text-gray-500 truncate">{asset.siteName} - {asset.id}</p></li>))}</ul>
                                    ) : ( <div className="p-4 text-center text-gray-500">No results found.</div> )}
                                </div>
                            )}
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" /></button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">{renderPage()}</div>
            </main>

            {!isCoPilotOpen && (
                 <button 
                    onClick={() => setIsCoPilotOpen(true)}
                    className="fixed bottom-6 right-6 z-40 h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 ease-in-out"
                    aria-label="Open AI Assistant"
                 >
                     <Sparkles className="h-8 w-8" />
                 </button>
            )}

            <AiAssistant 
                isOpen={isCoPilotOpen}
                onClose={() => setIsCoPilotOpen(false)}
                mockData={data}
                getAllAssets={() => getAllAssets(selectedSiteId)} 
            />

            {detailAssetState.isOpen && data && (
                <AssetDetailModal
                    asset={getAllAssets().find(a => a.id === detailAssetState.asset.id) || detailAssetState.asset}
                    onClose={() => setDetailAssetState({ isOpen: false, asset: null })}
                    watchList={data.watchList}
                    onToggleWatchList={toggleWatchListItem}
                    onCreateSapWorkOrder={createSapWorkOrder}
                />
            )}
            {data && <AssetListDrillDownModal isOpen={assetListModal.isOpen} onClose={() => setAssetListModal({ ...assetListModal, isOpen: false })} title={assetListModal.title} assets={assetListModal.assets} onAssetClick={(asset) => handleOpenAssetDetail(asset)} showSite={assetListModal.showSite} />}
            {data && <ListDrillDownModal isOpen={listModal.isOpen} onClose={() => setListModal({ ...listModal, isOpen: false })} title={listModal.title} items={listModal.items} columns={listModal.columns} />}
        </div>
    );
}