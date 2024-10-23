import App from "./app";
import config from "./config/config";
import { DBS } from "./constants";
import AccommodationsController from "./controllers/accommodations.controller";
import { DBService } from "./services/db/db.service";
import { EventEmitter } from 'events'; 
import TriggerService from "./services/trigger.service";

let dbType = DBS.MONGO;
const eventEmitter = new EventEmitter();
let db = new DBService(dbType, eventEmitter);
const triggerService = new TriggerService(eventEmitter);


const controllers =
{
    [AccommodationsController.controllerName]: new AccommodationsController() 
};


switch (dbType) {
    case DBS.MONGO: {
        db.connect().then(async () => {
            const app = new App(controllers, config.server.port);
            app.listen(() => {});
        });
    }
}

// handle disconnect 
function notifyExit() {
    return new Promise(async function (resolve, reject) {
        try {
            resolve('EXIT ');
        } catch (notifyExitError: any) {
            console.log(notifyExitError.stack);
            reject();
        }
    });
}

process.on("uncaughtException", async function (err: any) {
    console.log("uncaughtException...", err.stack);
    if (err.code != "EADDRNOTAVAIL" && err.code != "EADDRINUSE") {
        try {
        } catch (e) {
            console.log(e);
        }
    }
});

process.on('SIGINT', function () {
    console.log("SIGINT...");
    notifyExit()
        .then(function () {
            process.exit(1);
        })
        .catch(function () {
            process.exit(1);
        });
});

process.on('SIGTERM', function () {
    console.log("SIGTERM...");
    notifyExit()
        .then(function () {
            process.exit(1);
        })
        .catch(function () {
            process.exit(1);
        });
});

process.on('SIGQUIT', function () {
    console.log("SIGQUIT...");
    notifyExit()
        .then(function () {
            process.exit(1);
        })
        .catch(function () {
            process.exit(1);
        });
});

process.on('exit', function (code) {
    console.log("exit...", code);
});