"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const student_1 = __importDefault(require("./routes/student"));
const recruiter_1 = __importDefault(require("./routes/recruiter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)({
    origin: '*', // For local testing and development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parser
app.use(express_1.default.json());
// Serve static upload files
const uploadsPath = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/student', student_1.default);
app.use('/api/recruiter', recruiter_1.default);
// Root health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'CareerIQ API is up and running!',
        version: '1.0.0'
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 CareerIQ Server started on port ${PORT}`);
    console.log(`📍 API Base: http://localhost:${PORT}`);
    console.log(`📁 Uploads served from: ${uploadsPath}`);
    console.log(`========================================`);
});
