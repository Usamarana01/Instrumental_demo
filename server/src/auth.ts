
import express from 'express';

// In a real application, you would use a library like 'jsonwebtoken' to create and verify tokens.
// The secret key should be stored securely and not hardcoded.
const MOCK_JWT_SECRET = 'your-super-secret-key-that-is-not-so-secret';
const MOCK_TOKEN_PAYLOAD = { user: 'admin', roles: ['admin', 'operator'] };
// This is a fake token for demonstration purposes. It's not a real JWT.
const MOCK_TOKEN = Buffer.from(JSON.stringify(MOCK_TOKEN_PAYLOAD)).toString('base64') + '.' + Buffer.from(MOCK_JWT_SECRET).toString('base64');


// Mock user database
const users = [
    { username: 'admin', password: 'password', name: 'Admin User' }
];

export const login = (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log(`Successful login for user: ${username}`);
    
    // In a real app, you'd generate a real JWT token here.
    // const token = jwt.sign({ userId: user.id, username: user.username }, MOCK_JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
        message: 'Login successful',
        token: MOCK_TOKEN,
        user: {
            name: user.name,
            username: user.username
        }
    });
};

// Middleware to protect routes
export const protect = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = bearer.split(' ')[1];

    if (token !== MOCK_TOKEN) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    // In a real app, you would verify the token here using jwt.verify
    // try {
    //     const payload = jwt.verify(token, MOCK_JWT_SECRET);
    //     req.user = payload; // Attach user to the request
    //     next();
    // } catch (e) {
    //     return res.status(401).json({ message: 'Not authorized, token failed' });
    // }

    next();
};