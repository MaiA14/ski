const SERVER_PORT = 4000;
const SERVER_IP = '127.0.0.1'; // localhost
const ORIGIN = '*'
const DB_NAME = 'weski';

const SERVER = {
    port: SERVER_PORT,
    dbName: DB_NAME,
    ip: SERVER_IP,
    origin: ORIGIN
}

const config = {
    server: SERVER
}

// APIS_URLS
export const PROVIDERS = {
    WESKI:
        'https://gya7b1xubh.execute-api.eu-west-2.amazonaws.com/default/HotelsSimulator'
};

export default config;