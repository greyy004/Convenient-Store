import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

export default pool;