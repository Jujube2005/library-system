"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
];
requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing env: ${key}`);
    }
});
exports.env = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    port: Number(process.env.PORT ?? 4000)
};
