
export const DBS = {
    MONGO: 'mongo'
}

export const ENV = {
    PROD: 'prod'
}

export const COLLECTION = {
    ACCOMMODATIONS: 'accomodations'
}

export enum OPERANDS {
    EQUALS = '==',
    LOWER_THAN = '<',
    GREATER_THAN = '>',
    LOWER_OR_EQUALS = '<=',
    GREATER_OR_EQUALS = '>=',
    NOT_EQUALS = '!=',
    ARRAY_CONTAINS = 'array-contains',
    ARRAY_CONTAINS_ANY = 'array-contains-any',
    IN = 'in',
    CONTAINED = 'contained'
}

export enum ORDER_BY_DIRECTION {
    ASC = 'asc',
    DESC = 'desc'
}

export interface IDBOrderBy {
    fieldName: string,
    direction?: ORDER_BY_DIRECTION
}

export enum EVENTS {
    ADD = 'add',
    DELETE = 'delete',
    UPDATE = 'update',
}