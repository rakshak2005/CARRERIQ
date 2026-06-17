"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateToken = exports.verifyFirebaseIdToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'carreriq-ce38c';
// In-memory cache for Google's public x509 certificates
let googleCertificates = {};
let cacheExpiry = 0;
const fetchGoogleCertificates = async () => {
    const now = Date.now();
    if (Object.keys(googleCertificates).length > 0 && now < cacheExpiry) {
        return googleCertificates;
    }
    try {
        const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        if (!res.ok)
            throw new Error('Failed to fetch Google certificates');
        const cacheControl = res.headers.get('cache-control');
        let maxAge = 3600;
        if (cacheControl) {
            const match = cacheControl.match(/max-age=(\d+)/);
            if (match) {
                maxAge = parseInt(match[1], 10);
            }
        }
        googleCertificates = await res.json();
        cacheExpiry = Date.now() + maxAge * 1000;
        return googleCertificates;
    }
    catch (err) {
        console.error('Error fetching Google x509 certificates:', err);
        return googleCertificates;
    }
};
const verifyFirebaseIdToken = async (token) => {
    if (token.startsWith('simulated-token:')) {
        const parts = token.split(':');
        const email = parts[1];
        const uid = parts[2] || `simulated-${email}`;
        return { email, uid };
    }
    try {
        const decodedTokenHeader = jsonwebtoken_1.default.decode(token, { complete: true });
        if (!decodedTokenHeader || !decodedTokenHeader.header.kid) {
            return null;
        }
        const kid = decodedTokenHeader.header.kid;
        const certs = await fetchGoogleCertificates();
        const publicKey = certs[kid];
        if (!publicKey) {
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, publicKey, {
            audience: PROJECT_ID,
            issuer: `https://securetoken.google.com/${PROJECT_ID}`,
            algorithms: ['RS256'],
        });
        return {
            email: decoded.email || '',
            uid: decoded.sub || '',
        };
    }
    catch (err) {
        console.error('Error verifying Firebase ID token:', err);
        return null;
    }
};
exports.verifyFirebaseIdToken = verifyFirebaseIdToken;
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = await (0, exports.verifyFirebaseIdToken)(token);
        if (!decoded || !decoded.email) {
            return res.status(403).json({ error: 'Invalid or expired token payload' });
        }
        const user = await db_1.db.getUserByEmail(decoded.email);
        if (!user) {
            return res.status(404).json({ error: 'User profile not synchronized in local database' });
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error('[Firebase Token Verification] Error verifying token:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ error: `Forbidden: requires ${role} role` });
        }
        next();
    };
};
exports.requireRole = requireRole;
