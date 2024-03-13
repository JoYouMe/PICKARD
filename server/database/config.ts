import { Pool, QueryResult } from "pg";

type Query = {
    text: string;
    values?: (string | number)[];
}

export class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            database: 'postgres_db',
            user: 'postgres',
            password: '1234',
            port: 5432,
            statement_timeout: 10000,
            connectionTimeoutMillis: 30000,
            max: 30,
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async query(query: Query | string): Promise<QueryResult> {
        return this.pool.query(query);
    }

    public async connect(): Promise<any> {
        return this.pool.connect();
    }

    public async end(): Promise<void> {
        return this.pool.end();
    }
}

