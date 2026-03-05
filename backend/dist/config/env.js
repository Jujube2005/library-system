"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), `.env.${nodeEnv}`) });
dotenv_1.default.config(); // Fallback to .env
const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
];
// ensure all required environment variables are defined
requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        // We'll throw only for absolutely critical ones
        if (key === 'SUPABASE_URL' || key === 'SUPABASE_ANON_KEY') {
            throw new Error(`Missing critical env: ${key}`);
        }
    }
});
exports.env = {
    nodeEnv,
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: process.env.RESEND_API_KEY || '',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    port: Number(process.env.PORT ?? 4000),
};
