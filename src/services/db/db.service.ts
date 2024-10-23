import { singleton } from '../../decorators/singleton';
import { MongoService } from './mongo.service';
import { EventEmitter } from 'events';

@singleton
export class DBService {
    private dbType: string = '';
    private db: any;

    constructor(dbType?: string, eventEmitter?: EventEmitter) {
        switch (dbType) {
            case 'MONGO': {
                this.db = new MongoService(eventEmitter); 
                break;
            }
            // Add other database types as needed
            default: {
                this.db = new MongoService(eventEmitter); 
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
