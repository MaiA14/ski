import { EventEmitter } from 'events';
import { COLLECTION } from '../constants';
import AccommodationTrigger from '../triggers/accomodations.trigger';
import { singleton } from '../decorators/singleton';

@singleton
class TriggerService {
    constructor(eventEmitter: EventEmitter) {
        console.log('TriggerService')
        eventEmitter.on(COLLECTION.ACCOMMODATIONS, new AccommodationTrigger().trigger);
    }
}

export default TriggerService;
