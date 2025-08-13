
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { login, protect } from './auth';
import { getDb, getAllAssets, getAssetById, updateAsset, addWorkOrder, updateWatchList } from './data';
import { Asset, WorkOrder } from './types';

const app = express();
const PORT = 8081; // Using a different port from the typical dev server port

// --- Middleware ---

// Enable CORS for all routes. In a production environment, you would want to
// restrict this to the specific domain of your frontend application.
app.use(cors());

// Use morgan for logging HTTP requests to the console. This serves as a basic audit trail.
// A more robust solution would log to a file or a logging service.
app.use(morgan('dev'));

// Parse incoming request bodies in a middleware before your handlers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- Public Routes ---

app.post('/api/login', login);

// --- Protected Routes ---
// All routes below this line will be protected by the 'protect' middleware.

app.get('/api/data', protect, (req: express.Request, res: express.Response) => {
    res.json(getDb());
});

app.get('/api/assets', protect, (req: express.Request, res: express.Response) => {
    const { siteId } = req.query;
    res.json(getAllAssets(siteId as string | null));
});

app.get('/api/assets/:id', protect, (req: express.Request, res: express.Response) => {
    const asset = getAssetById(req.params.id);
    if (asset) {
        res.json(asset);
    } else {
        res.status(404).json({ message: 'Asset not found' });
    }
});

app.post('/api/work-orders', protect, (req: express.Request, res: express.Response) => {
    const workOrderData: Omit<WorkOrder, 'id'> = req.body;
    const newWorkOrder: WorkOrder = {
        ...workOrderData,
        id: `1010${Math.floor(100000 + Math.random() * 900000)}`
    };
    
    // Update the corresponding asset's CMMS status
    const asset = getAssetById(newWorkOrder.assetId);
    if (asset) {
        asset.cmmsStatus = 'Success';
        asset.sapWoNumber = newWorkOrder.id;
        updateAsset(asset);
    }
    
    addWorkOrder(newWorkOrder);
    res.status(201).json(newWorkOrder);
});

app.put('/api/watchlist', protect, (req: express.Request, res: express.Response) => {
    const { watchList }: { watchList: string[] } = req.body;
    if (!Array.isArray(watchList)) {
        return res.status(400).json({ message: 'watchList must be an array of asset IDs' });
    }
    const updated = updateWatchList(watchList);
    res.json(updated);
});


// --- Error Handling Middleware ---
// This should be the last middleware added.
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    // Initialize data on server start
    getDb();
});