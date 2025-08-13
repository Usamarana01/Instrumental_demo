
export interface TimeSeriesPoint {
    timestamp: string;
    value: number;
}

export interface TimeSeriesData {
    [key: string]: {
        unit: string;
        data: TimeSeriesPoint[];
    };
}

export interface AssetEvent {
    timestamp: string;
    description: string;
}

export interface Asset {
    id: string;
    name: string;
    siteId: string;
    siteName: string;
    type: 'Sensor' | 'Valve' | 'Controller' | 'Machine';
    health: number;
    criticality: 'Critical' | 'High' | 'Medium' | 'Low';
    status: string;
    namurStatus: 'F' | 'C' | 'S' | 'M' | 'OK';
    isSif: boolean;
    make: string;
    model: string;
    revision: string;
    serialNumber: string;
    eventTimestamp: string;
    calibrationDueDate: string;
    alert: {
        title: string;
        description: string;
        causeCode: string;
        remedyCode: string;
        remedies: { id: number; description: string; reference: string }[];
    };
    timeSeriesData: TimeSeriesData;
    events: AssetEvent[];
    history?: {day: string; status: 'F' | 'C' | 'S' | 'M' | 'OK'}[];
    cmmsStatus?: 'Pending' | 'InProgress' | 'Success' | 'Error';
    sapWoNumber?: string;
}

export interface Unit {
    id: string;
    name: string;
    assets: Asset[];
}

export interface Area {
    id: string;
    name: string;
    units: Unit[];
}

export interface WorkOrder {
  id: string; // SAP WO Number
  assetId: string;
  assetName: string;
  siteId: string;
  description: string;
  type: 'Work Order' | 'Work Request';
  status: 'Created' | 'Released' | 'In Progress' | 'Awaiting Parts' | 'Completed' | 'Closed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  createdDate: string;
  dueDate: string;
}

export interface SidebarStats {
    unhealthy: number;
    watchList: number;
    systemMessages: number;
    userMessages: number;
    cmmsRequests: number;
    undeliveredCmms: number;
    downUnits: number;
    overdueRoutes: number;
    overdueCalibrations: number;
    seriousProblems: number;
    spuriousTrips: number;
    workOrdersCreated: number;
    workOrdersClosed: number;
    workOrdersOverdue: number;
}

export interface Site {
    id: string;
    name: string;
    areas: Area[];
    namurSummary: {
        F: number;
        C: number;
        S: number;
        M: number;
    };
    sidebarStats: SidebarStats;
}

export interface Enterprise {
    name: string;
    sites: Site[];
}

export interface SystemMessage {
    id: number;
    text: string;
    timestamp: string;
}

export interface UserMessage {
    id: number;
    from: string;
    text: string;
    timestamp: string;
    siteId: string;
}

export interface CmmsRequest {
    id: string;
    assetId: string;
    description: string;
    status: string;
    created: string;
    siteId: string;
}

export interface UndeliveredCmms {
    id: string;
    assetId: string;
    error: string;
    timestamp: string;
    siteId: string;
}

export interface DownUnit {
    id: string;
    name: string;
    reason: string;
    duration: string;
    timestamp: string;
    siteId: string;
}

export interface OverdueRoute {
    id: string;
    name: string;
    assets: number;
    completed: number;
    due: string;
    siteId: string;
}

export interface SpuriousTrip {
    id: string;
    assetId: string;
    assetName: string;
    siteId: string;
    timestamp: string;
    reason: string;
}

export interface KnowledgeBase {
    [assetType: string]: {
        [errorCode: string]: {
            consequence: string;
            remedy: string;
        };
    };
}


export interface MockData {
    enterprise: Enterprise;
    knowledgeBase: KnowledgeBase;
    watchList: string[];
    systemMessages: SystemMessage[];
    userMessages: UserMessage[];
    cmmsRequests: CmmsRequest[];
    undeliveredCmms: UndeliveredCmms[];
    downUnits: DownUnit[];
    overdueRoutes: OverdueRoute[];
    spuriousTrips: SpuriousTrip[];
    workOrders: WorkOrder[];
}

export interface Pen {
    id: string;
    assetId: string;
    param: string;
    yAxisId?: string;
    color?: string;
    unit?: string;
}

export interface ReportConfig {
    site: string;
    startDate: string;
    endDate: string;
    assetType: string;
    criticality: string;
}

export interface ReportData {
    config: ReportConfig;
    data: Asset[];
    name: string;
}