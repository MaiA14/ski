import { singleton } from '../../decorators/singleton';
import { MongoService } from './mongo.service';

@singleton
export class DBService {
    private dbType: string = '';
    private db: any;

    constructor(dbType?: string) {
        switch (dbType) {
            default: {
                this.db = new MongoService();
            }
        }
    }

    public async connect(): Promise<any> {
        return await this.db.connect();
    }

    public async disconnect() {
        return await this.db.disconnect();
    }

    public async add(collection: string, data: any): Promise<any> {
        return await this.db.add(collection, data);
    }

    public async get(collection: string, docId?: string, where?: any) {
        return await this.db.get(collection, docId, where);
    }

    public async set(collection: string, docId: string, data: any, shouldMerge?: any): Promise<any> {
        return await this.db.set(collection, docId, data, shouldMerge);
    }

    public async delete(collection: string, docId: string): Promise<any> {
        return await this.db.delete(collection, docId);
    }
}