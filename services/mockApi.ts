import { MockData, Asset, Site, WorkOrder } from '../types';

// This file simulates a backend API.
// It contains all the data generation and manipulation logic that was previously in the /server directory.
// It uses Promises and setTimeout to mimic network latency.

// --- Mock Database ---

let mockData: MockData | null = null;

const initializeMockData = (): MockData => {
    console.log("Initializing Mock Data on the client-side...");
    const generateTimeSeriesData = (numPoints: number, min: number, max: number, startTime: Date, periodSeconds: number, noise = 0.05, trend = 0) => {
        const data = [];
        for (let i = 0; i < numPoints; i++) {
            const timestamp = new Date(startTime.getTime() - (numPoints - 1 - i) * periodSeconds * 1000);
            const value = min + (max - min) * (0.5 + 0.5 * Math.sin(i / 20)) + (Math.random() - 0.5) * (max - min) * noise + trend * i;
            data.push({ timestamp: timestamp.toISOString(), value: parseFloat(value.toFixed(2)) });
        }
        return data;
    };

    const generateAssets = (count: number, siteId: string, siteName: string, statusConfig: any): Asset[] => {
        const assets: Asset[] = [];
        const { makes, models, causes, remedies, criticalities, namurStatus, type, namePrefix } = statusConfig;

        for (let i = 1; i <= count; i++) {
            const now = new Date();
            const eventTimestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const calibrationDueDate = new Date(now.getTime() + (Math.random() - 0.2) * 90 * 24 * 60 * 60 * 1000);
            const cause = causes[i % causes.length];
            const remedy = remedies[i % remedies.length];

            const asset: Asset = {
                id: `${siteId}-${namurStatus}-${1000 + i}`,
                name: `${namePrefix} ${1000 + i}`,
                siteId: siteId,
                siteName: siteName,
                type: type,
                health: 20 + Math.floor(Math.random() * 70),
                criticality: criticalities[i % criticalities.length],
                status: cause.description,
                namurStatus: namurStatus,
                isSif: Math.random() > 0.7,
                make: makes[i % makes.length],
                model: models[i % models.length],
                revision: `2.${i % 9}`,
                serialNumber: `${siteId}-${namurStatus}N-${9000 + i}`,
                eventTimestamp: eventTimestamp.toISOString(),
                calibrationDueDate: calibrationDueDate.toISOString(),
                alert: {
                    title: cause.description,
                    description: cause.longDesc || "Device has reported an event requiring attention.",
                    causeCode: cause.code,
                    remedyCode: remedy ? remedy.code : "N/A",
                    remedies: remedy ? [{ id: 1, description: remedy.description, reference: `REF-${5000 + i}` }] : []
                },
                timeSeriesData: {},
                events: [],
                history: [],
                cmmsStatus: 'Pending',
                sapWoNumber: undefined,
            };

            if (namurStatus === 'F' && i % 4 !== 1) { // Let some have WO, some not
                asset.cmmsStatus = 'Success';
                asset.sapWoNumber = `1010${Math.floor(110000 + Math.random() * 800000)}`;
            }
            
            const history: {day: string, status: 'F' | 'C' | 'S' | 'M' | 'OK'}[] = [];
            const finalStatus = namurStatus;
            const statusPath: { [key: string]: ('F' | 'C' | 'S' | 'M' | 'OK')[] } = {
                'F': ['OK', 'M', 'S', 'F'],
                'S': ['OK', 'M', 'S'],
                'M': ['OK', 'M'],
                'C': ['OK', 'C'],
                'OK': ['OK'],
            };
            const path = statusPath[finalStatus] || ['OK'];

            for (let d = 29; d >= 0; d--) {
                const day = new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                let statusForDay: 'F' | 'C' | 'S' | 'M' | 'OK' = 'OK';
                
                if (d < path.length) {
                     statusForDay = path[path.length - 1 - d];
                } else {
                    if (Math.random() > 0.95) {
                        statusForDay = Math.random() > 0.5 ? 'M' : 'S';
                    }
                }
                history.push({ day, status: statusForDay });
            }
            if(history.length > 0) history[history.length - 1].status = finalStatus;
            asset.history = history;


            if (type === 'Sensor') {
                asset.timeSeriesData.PV = { unit: 'PSI', data: generateTimeSeriesData(1440, 50, 150, now, 60) };
            } else if (type === 'Valve' || type === 'Controller') {
                asset.timeSeriesData.PV = { unit: 'GPM', data: generateTimeSeriesData(1440, 200, 500, now, 60) };
                asset.timeSeriesData.SP = { unit: 'GPM', data: generateTimeSeriesData(1440, 200, 500, now, 60, 0.01) };
                asset.timeSeriesData.OUT = { unit: '%', data: generateTimeSeriesData(1440, 0, 100, now, 60) };
            }

            asset.events.push({
                timestamp: asset.eventTimestamp,
                description: `Alert: ${asset.alert.title}`
            });

            assets.push(asset);
        }
        return assets;
    };

    const createSiteData = (siteId: string, siteName: string, assetCounts: { F: number; C: number; S: number; M: number; }): Site => {
        const siteAssets = {
            F: generateAssets(assetCounts.F, siteId, siteName, { namurStatus: 'F', namePrefix: 'Temp Transmitter', type: 'Sensor', makes: ["Rosemount", "E+H", "Krohne"], models: ["3144P", "iTEMP TMT162", "OptiTEMP"], causes: [{ code: "F01", description: "Sensor Failure" }, { code: "F04", description: "Electronics Fault" }], remedies: [{ code: "R11", description: "Replace sensor element" }, { code: "R12", description: "Replace transmitter module" }], criticalities: ["Critical", "High"] }),
            C: generateAssets(assetCounts.C, siteId, siteName, { namurStatus: 'C', namePrefix: "Control Valve", type: 'Valve', makes: ["Fisher", "Samson", "Masoneilan"], models: ["DVC6200", "Type 3730", "SVi1000"], causes: [{ code: "C01", description: "Loop Test Active" }, { code: "C03", description: "Forced Output" }], remedies: [{ code: "N/A", description: "Wait for test completion" }, { code: "N/A", description: "Release from manual control" }], criticalities: ["Medium", "Low"] }),
            S: generateAssets(assetCounts.S, siteId, siteName, { namurStatus: 'S', namePrefix: "Flow Meter", type: 'Sensor', makes: ["Micro Motion", "Krohne", "Yokogawa"], models: ["Elite CMF", "OptiMASS", "AXF"], causes: [{ code: "S02", description: "Upper Range Exceeded" }, { code: "S03", description: "Lower Range Exceeded" }], remedies: [{ code: "R21", description: "Verify process conditions" }, { code: "R22", description: "Check upstream/downstream valves" }], criticalities: ["High", "Medium"] }),
            M: generateAssets(assetCounts.M, siteId, siteName, { namurStatus: 'M', namePrefix: "Pressure Gauge", type: 'Sensor', makes: ["WIKA", "Ashcroft", "Omega"], models: ["PG23", "1279", "PGM"], causes: [{ code: "M01", description: "Preventive Maintenance Due" }, { code: "M02", description: "Calibration Drift" }], remedies: [{ code: "R01", description: "Perform PM as per SOP-101" }, { code: "R02", description: "Perform 5-point calibration" }], criticalities: ["Medium", "Low"] })
        };

        const allAssetsForSite: Asset[] = Object.values(siteAssets).flat();

        return {
            id: siteId,
            name: siteName,
            areas: [
                { id: `${siteId}-AREA-A`, name: "Crude Distillation Unit", units: [{ id: `${siteId}-UNIT-ADU`, name: "Atmospheric Distillation", assets: allAssetsForSite.slice(0, allAssetsForSite.length / 2) }] },
                { id: `${siteId}-AREA-B`, name: "Utility Area", units: [{ id: `${siteId}-UNIT-BU`, name: "Boiler Unit", assets: allAssetsForSite.slice(allAssetsForSite.length / 2) }] }
            ],
            namurSummary: assetCounts,
            sidebarStats: {
                unhealthy: assetCounts.F,
                watchList: 0,
                systemMessages: 0,
                userMessages: 0,
                cmmsRequests: 0,
                undeliveredCmms: 0,
                downUnits: 0,
                overdueRoutes: 0,
                overdueCalibrations: allAssetsForSite.filter(a => a.calibrationDueDate && new Date(a.calibrationDueDate) < new Date()).length,
                seriousProblems: allAssetsForSite.filter(a => a.namurStatus === 'F' && a.isSif).length,
                spuriousTrips: 0,
                workOrdersCreated: 0,
                workOrdersClosed: 0,
                workOrdersOverdue: 0,
            }
        };
    };

    const siteConfigs = [
        { id: 'SITE-01', name: 'Texas Refinery', counts: { F: 12, C: 5, S: 23, M: 38 } },
        { id: 'SITE-02', name: 'Rotterdam Chemical', counts: { F: 5, C: 10, S: 15, M: 50 } },
        { id: 'SITE-03', name: 'Singapore Pharma', counts: { F: 2, C: 2, S: 8, M: 25 } },
        { id: 'SITE-04', name: 'Jubail Petrochemical', counts: { F: 20, C: 8, S: 30, M: 45 } },
    ];

    const data: MockData = {
        enterprise: {
            name: "Global PetroCorp",
            sites: siteConfigs.map(sc => createSiteData(sc.id, sc.name, sc.counts))
        },
        knowledgeBase: {
            'Sensor': { 'F01': { consequence: 'Spurious trip of downstream equipment due to loss of signal.', remedy: 'Verify sensor wiring and power. If okay, replace sensor element as per SOP-201.' }, 'F04': { consequence: 'Inaccurate readings leading to off-spec product.', remedy: 'Replace transmitter electronics module. Refer to vendor manual section 5.2.' } },
            'Valve': { 'S02': { consequence: 'Potential for process upset due to valve not responding to control signal.', remedy: 'Check for blockages in the valve body. Perform partial stroke test.' } }
        },
        watchList: [], systemMessages: [], userMessages: [], cmmsRequests: [], undeliveredCmms: [], downUnits: [], overdueRoutes: [], spuriousTrips: [], workOrders: []
    };

    const getAllAssets = (d: MockData, siteId: string | null = null): Asset[] => {
        let sites = d.enterprise.sites;
        if (siteId) {
            sites = sites.filter(s => s.id === siteId);
        }
        return sites.flatMap(site => site.areas.flatMap(area => area.units.flatMap(unit => unit.assets)));
    };

    const allAssets = getAllAssets(data);

    const workOrders: WorkOrder[] = [];
    allAssets.forEach(asset => {
        if (asset.cmmsStatus === 'Success' && asset.sapWoNumber) {
            const createdDate = new Date(asset.eventTimestamp);
            createdDate.setDate(createdDate.getDate() + 1);
            const dueDate = new Date(createdDate);
            dueDate.setDate(dueDate.getDate() + (asset.criticality === 'Critical' || asset.criticality === 'High' ? 7 : 30));
            const now = new Date();
            let status: WorkOrder['status'] = 'Created';
            const randomizer = Math.random();
            if (randomizer > 0.8) status = 'Completed';
            else if (randomizer > 0.6) status = 'Closed';
            else if (randomizer > 0.4) status = 'In Progress';
            else if (randomizer > 0.2) status = 'Released';
            if (now > dueDate && status !== 'Completed' && status !== 'Closed') status = 'Overdue';
            
            workOrders.push({
                id: asset.sapWoNumber,
                assetId: asset.id,
                assetName: asset.name,
                siteId: asset.siteId,
                description: asset.alert.remedies.length > 0 ? asset.alert.remedies[0].description : `Corrective action for: ${asset.alert.title}`,
                type: asset.criticality === 'Critical' || asset.criticality === 'High' ? 'Work Order' : 'Work Request',
                status: status,
                priority: asset.criticality === 'Critical' ? 'High' : asset.criticality === 'High' ? 'Medium' : 'Low',
                createdDate: createdDate.toISOString(),
                dueDate: dueDate.toISOString(),
            });
        }
    });
    data.workOrders = workOrders;

    const allSifAssets = allAssets.filter(a => a.isSif && a.criticality === 'Critical');
    data.spuriousTrips = allSifAssets.slice(0, 5).map((asset, i) => ({
        id: `TRIP-${100 + i}`,
        assetId: asset.id,
        assetName: asset.name,
        siteId: asset.siteId,
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        reason: i % 2 === 0 ? 'Transmitter power fluctuation' : 'Suspected instrument malfunction during startup',
    }));

    data.watchList = allAssets.filter(a => Math.random() > 0.95).map(a => a.id);
    data.systemMessages = [{ id: 1, text: "Backup successful for Historian Node H-01.", timestamp: new Date().toISOString() }, { id: 2, text: "License usage at 85%. Consider adding more seats.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }];
    data.userMessages = [{ id: 1, from: "John Doe", text: "Can you check the calibration on PT-301?", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), siteId: 'SITE-01' }];
    data.cmmsRequests = [{ id: "WO-12345", assetId: "SITE-01-F-1001", description: "Replace sensor element", status: "Awaiting Approval", created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), siteId: 'SITE-01' }];
    data.undeliveredCmms = [{ id: "FAIL-001", assetId: "SITE-02-S-1005", error: "Connection to SAP timed out", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), siteId: 'SITE-02' }];
    data.downUnits = [{ id: "UNIT-ADU", name: "Atmospheric Distillation", reason: "Emergency Shutdown (ESD-01)", duration: "3h 45m", timestamp: new Date(Date.now() - 3.75 * 60 * 60 * 1000).toISOString(), siteId: 'SITE-01' }];
    data.overdueRoutes = [{ id: "ROUTE-01", name: "Operator Rounds - CDU", assets: 25, completed: 18, due: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), siteId: 'SITE-01' }];

    data.enterprise.sites.forEach(site => {
        site.sidebarStats.watchList = data.watchList.filter(id => id.startsWith(site.id)).length;
        site.sidebarStats.systemMessages = data.systemMessages.length; // Simplified for example
        site.sidebarStats.userMessages = data.userMessages.filter(m => m.siteId === site.id).length;
        site.sidebarStats.cmmsRequests = data.cmmsRequests.filter(r => r.siteId === site.id).length;
        site.sidebarStats.undeliveredCmms = data.undeliveredCmms.filter(u => u.siteId === site.id).length;
        site.sidebarStats.downUnits = data.downUnits.filter(d => d.siteId === site.id).length;
        site.sidebarStats.overdueRoutes = data.overdueRoutes.filter(o => o.siteId === site.id).length;
        site.sidebarStats.spuriousTrips = data.spuriousTrips.filter(t => t.siteId === site.id).length;
        const siteWorkOrders = data.workOrders.filter(wo => wo.siteId === site.id);
        site.sidebarStats.workOrdersCreated = siteWorkOrders.length;
        site.sidebarStats.workOrdersClosed = siteWorkOrders.filter(wo => wo.status === 'Completed' || wo.status === 'Closed').length;
        site.sidebarStats.workOrdersOverdue = siteWorkOrders.filter(wo => wo.status === 'Overdue').length;
    });
    
    return data;
}

const getDb = (): MockData => {
    if (!mockData) {
        mockData = initializeMockData();
    }
    return mockData;
}

// --- Mock API Functions ---

const MOCK_TOKEN = 'mock-jwt-token-for-client-side-simulation';

export const login = (username: string, password: string): Promise<{ token: string }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const normalizedUsername = (username || '').trim();
            const normalizedPassword = (password || '').trim();

            const validCredentials: Array<{ username: string; password: string }> = [
                { username: 'admin', password: 'password' },
                { username: 'admin@gmail.com', password: 'admin' },
                { username: 'Fida.Rasool@leanautomation.com', password: 'Fida@Lean' },
            ];

            const isValid = validCredentials.some(
                (cred) => cred.username.toLowerCase() === normalizedUsername.toLowerCase() && cred.password === normalizedPassword
            );

            if (isValid) {
                resolve({ token: MOCK_TOKEN });
            } else {
                reject(new Error('Invalid credentials.'));
            }
        }, 500); // 500ms delay
    });
};

export const fetchData = (token: string): Promise<MockData> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (token === MOCK_TOKEN) {
                resolve(getDb());
            } else {
                reject(new Error('Invalid token.'));
            }
        }, 800); // 800ms delay
    });
};

export const createWorkOrder = (workOrderPayload: Omit<WorkOrder, 'id'>, token: string): Promise<WorkOrder> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (token !== MOCK_TOKEN) return reject(new Error('Invalid token.'));
            
            const db = getDb();
            const newWorkOrder: WorkOrder = {
                ...workOrderPayload,
                id: `1010${Math.floor(100000 + Math.random() * 900000)}`
            };
            db.workOrders.push(newWorkOrder);

            // The calling function in App.tsx will handle the state update.
            resolve(newWorkOrder);

        }, 1200); // 1.2s delay
    });
};

export const updateWatchList = (watchList: string[], token: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (token !== MOCK_TOKEN) return reject(new Error('Invalid token.'));

            const db = getDb();
            db.watchList = watchList;

            // Recalculate sidebar stats
            db.enterprise.sites.forEach(site => {
                site.sidebarStats.watchList = db.watchList.filter(id => id.startsWith(site.id)).length;
            });
            
            resolve(db.watchList);
        }, 300); // 300ms delay
    });
};
