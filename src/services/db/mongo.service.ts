import { MongoClient } from 'mongodb';
import _ = require('lodash');
import IDB from '../../types/db.type';
import { singleton } from '../../decorators/singleton';
import config from '../../config/config';
import { IDBOrderBy, OPERANDS } from '../../constants';


@singleton
export class MongoService implements IDB {
    static mongoService: MongoService;
    private mongoClient: any;
    private mongoDb: any;
    jobInterval: any;

    constructor() {
        this.mongoClient = new MongoClient(`mongodb://${config.server.ip}:27017`);
    }

    public async connect(): Promise<any> {
        try {
            this.mongoDb = this.mongoClient.db(config.server.dbName);
            await this.mongoClient.connect();
            console.log('Mongo is connected');
        } catch (e: any) {
            console.log('connect - could not connect to db', e.stack);
            console.log('mongo existing app 2');
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        clearInterval(this.jobInterval);
        setTimeout(() => {
            console.log('disconnect');
            this.mongoDb.close();
        }, 5000)
    }

    private getOperand(operand: string): string {
        let op = null;
        switch (operand) {
            case OPERANDS.GREATER_OR_EQUALS: {
                op = '$gte';
            }
                break;
            case OPERANDS.LOWER_OR_EQUALS: {
                op = '$lte';
            }
                break;
            case OPERANDS.EQUALS: {
                op = '$eq';
            }
                break;

            case OPERANDS.NOT_EQUALS: {
                op = '$ne'
            }
        }
        return op;
    }

    public async get(collectionName: string, docId?: string, where?: any, orderBy?: IDBOrderBy, limit?: number): Promise<any> {
        let query;
        if (docId) {
            query = await this.mongoDb.collection(collectionName).findOne({ id: docId });
            console.log('query', query);
            const result = query;
            if (!result) {
                return null;
            } else {
                const data: any = result;
                return { id: result.id, ...data };
            }
        }

        else if (where && Object.keys(where).length > 0) {
            const terms = Object.keys(where);
            const condition: any = {};
            for (let i = 0; i < terms.length; i++) {
                if (_.isArray(where[terms[i]])) {
                    for (let j = 0; j < where[terms[i]].length; j++) {
                        condition[terms[i]] = { [this.getOperand(where[terms[i]][j].operand)]: where[terms[i]][j].value };
                    }
                } else {
                    condition[terms[i]] = { [this.getOperand(where[terms[i]].operand)]: where[terms[i]].value };
                    console.log('conditions', condition)
                }
            }

            let results;
            try {
                results = await this.mongoDb.collection(collectionName)
                    .find(condition)
                    .toArray();
            } catch { }

            if (!results) {
                return [];
            } else {
                const items: any[] = [];
                let doc = null;
                for (let i = 0; i < results.length; i++) {
                    doc = results[i];
                    const data: any = doc;
                    items.push({ id: doc.id, ...data });
                }
                return items;
            }
        } else {
            let results;
            try {
                results = await this.mongoDb.collection(collectionName)
                    .find({})
                    .toArray();
            } catch { }

            if (!results) {
                return null;
            } else {
                const items: any[] = [];
                let doc = null;
                for (let i = 0; i < results.length; i++) {
                    doc = results[i];
                    const data: any = doc;
                    items.push({ id: doc.id, ...data });;
                }
                return items;
            }
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
            await this.mongoDb.collection(collectionName).updateOne({ _id: doc.insertedId }, { $set: data }, { upsert: false });
            const addedDoc = await this.mongoDb.collection(collectionName).findOne({ _id: doc.insertedId });
            console.log('MongoService add addedDoc', addedDoc);
            return addedDoc;
        }
        catch (e) {
            console.log("MongoService add - cannot add doc", e);
        }
    }

    public async set(collectionName: string, docId: string, dataArg: any, shouldMerge?: any): Promise<any> {
        const data = _.cloneDeep(dataArg);
        try {
            const doc = await this.mongoDb.collection(collectionName).findOne({ id: docId });
            if (doc !== null) { // update document
                data.id = docId;

                if (shouldMerge) {
                    const mergedData = _.merge({}, doc, data); // merge partly data with existing doc
                    delete mergedData._id;
                    await this.mongoDb.collection(collectionName).updateOne({ _id: doc._id }, { $set: { ...mergedData } }, { upsert: false });
                } else {
                    await this.mongoDb.collection(collectionName).updateOne({ _id: doc._id }, { $set: { ...data } }, { upsert: false });
                }

                const updatedDoc = await this.mongoDb.collection(collectionName).findOne({ id: docId });
                return updatedDoc;
            } else {
                data.id = docId; // set new document with custom id
                delete data._id;
                await this.mongoDb.collection(collectionName).insertOne({ ...data }); // returns acknolodege
                const newDocUpdated = await this.mongoDb.collection(collectionName).findOne({ id: docId });
                return newDocUpdated;
            }
        } catch (e) {
            console.log('MongoService set - could not set data', collectionName, docId, JSON.stringify(e));
        }
    }

    public async delete(collectionName: string, docId: string): Promise<any> {
        if (docId) {
            try {
                await this.mongoDb.collection(collectionName).deleteOne({ id: docId });
            } catch (e) {
                console.log('cannot delete specific doc ', e)
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