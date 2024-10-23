export default interface IDB {
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    add(collection: string, data: any): Promise<any>;
    get(collection: string, docId?: string, where?: any): Promise<any>;
    set(collection: string, docId: string, data: any, shouldMerge?: any): Promise<any>;
    delete(collection: string, docId: string): Promise<any>;
}