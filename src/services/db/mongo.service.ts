import { MongoClient } from 'mongodb';
import * as _ from 'lodash';
import IDB from '../../types/db.type';
import { singleton } from '../../decorators/singleton';
import config from '../../config/config';
import { EVENTS, IDBOrderBy, OPERANDS } from '../../constants';
import { EventEmitter } from 'events';

@singleton
export class MongoService implements IDB {
    private mongoClient: MongoClient;
    private mongoDb: any;
    jobInterval: any;
    private eventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter; // Store the eventEmitter instance
        this.mongoClient = new MongoClient(`mongodb://${config.server.ip}:27017`);
    }

    public async connect(): Promise<any> {
        try {
            this.mongoDb = this.mongoClient.db(config.server.dbName);
            await this.mongoClient.connect();
            console.log('Mongo is connected');
        } catch (e: any) {
            console.log('connect - could not connect to db', e.stack);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        clearInterval(this.jobInterval);
        setTimeout(() => {
            console.log('disconnect');
            this.mongoDb.close();
        }, 5000);
    }

    private getOperand(operand: string): string {
        let op = null;
        switch (operand) {
            case OPERANDS.GREATER_OR_EQUALS:
                op = '$gte';
                break;
            case OPERANDS.LOWER_OR_EQUALS:
                op = '$lte';
                break;
            case OPERANDS.EQUALS:
                op = '$eq';
                break;
            case OPERANDS.NOT_EQUALS:
                op = '$ne';
                break;
        }
        return op;
    }

    public async get(collectionName: string, docId?: string, where?: any, orderBy?: IDBOrderBy, limit?: number): Promise<any> {
        let query;
        if (docId) {
            query = await this.mongoDb.collection(collectionName).findOne({ id: docId });
            const result = query;
            return result ? { id: result.id, ...result } : null;
        } else if (where && Object.keys(where).length > 0) {
            const terms = Object.keys(where);
            const condition: any = {};
            for (const term of terms) {
                if (_.isArray(where[term])) {
                    condition[term] = { [this.getOperand(where[term][0].operand)]: where[term][0].value };
                } else {
                    condition[term] = { [this.getOperand(where[term].operand)]: where[term].value };
                }
            }

            const results = await this.mongoDb.collection(collectionName).find(condition).toArray();
            return results.map(doc => ({ id: doc.id, ...doc })) || [];
        } else {
            const results = await this.mongoDb.collection(collectionName).find({}).toArray();
            return results.map(doc => ({ id: doc.id, ...doc })) || null;
        }
    }

    public async add(collectionName: string, data: any) {
        console.log('add mongo', collectionName, data);
        if (!collectionName || !data) {
            console.log(`MongoService - did not find this collection or data ${collectionName}`);
            return null;
        }

        if (data._id) {
            delete data._id;
        }

        try {
            const doc: any = await this.mongoDb.collection(collectionName).insertOne({ ...data });
            data.id = doc.insertedId.toString();
            const addedDoc = await this.mongoDb.collection(collectionName).findOne({ _id: doc.insertedId });

            this.eventEmitter.emit(collectionName, {
                collectionName,
                type: EVENTS.ADD,
                before: null,
                after: addedDoc
            });

            return addedDoc;
        } catch (e) {
            console.log("MongoService add - cannot add doc", e);
        }
    }

    public async set(collectionName: string, docId: string, dataArg: any, shouldMerge?: any): Promise<any> {
        const data = _.cloneDeep(dataArg);
        try {
            const doc = await this.mongoDb.collection(collectionName).findOne({ id: docId });
            if (doc) { // update document
                data.id = docId;

                const before = { ...doc }; // Store the document before the update

                if (shouldMerge) {
                    const mergedData = _.merge({}, doc, data);
                    delete mergedData._id;
                    await this.mongoDb.collection(collectionName).updateOne({ _id: doc._id }, { $set: { ...mergedData } });
                } else {
                    await this.mongoDb.collection(collectionName).updateOne({ _id: doc._id }, { $set: { ...data } });
                }

                const updatedDoc = await this.mongoDb.collection(collectionName).findOne({ id: docId });
                
                this.eventEmitter.emit(collectionName, {
                    collectionName,
                    type: EVENTS.UPDATE,
                    before: null,
                    after: updatedDoc
                });

                return updatedDoc;
            } else {
                data.id = docId; // set new document with custom id
                delete data._id;
                await this.mongoDb.collection(collectionName).insertOne({ ...data });
                const newDocUpdated = await this.mongoDb.collection(collectionName).findOne({ id: docId });
                this.eventEmitter.emit(collectionName, {
                    collectionName,
                    type: EVENTS.ADD,
                    before: null,
                    after: newDocUpdated
                });

                return newDocUpdated;
            }
        } catch (e) {
            console.log('MongoService set - could not set data', collectionName, docId, JSON.stringify(e));
        }
    }

    public async delete(collectionName: string, docId: string): Promise<any> {
        if (docId) {
            try {
                const doc = await this.mongoDb.collection(collectionName).findOne({ id: docId });
                
                await this.mongoDb.collection(collectionName).deleteOne({ id: docId });
                
                this.eventEmitter.emit(collectionName, {
                    collectionName,
                    type: EVENTS.DELETE,
                    before: doc,
                    after: null
                });
            } catch (e) {
                console.log('cannot delete specific doc ', e);
            }
        } else {
            try {
                await this.mongoDb.collection(collectionName).deleteMany({});
            } catch (e) {
                console.log('cannot delete docs ', e);
            }
        }

        return false;
    }
}
