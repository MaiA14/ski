import Bottleneck from 'bottleneck';
import AccommodationsService from '../services/accommodations.service';
import { EVENTS } from '../constants';

class AccommodationTrigger {
    private static limiter = new Bottleneck({
        minTime: 100,
        maxConcurrent: 5,
    });

    public async trigger(change) {
        console.log('Triggering with change:', change);
        const accommodationsService = new AccommodationsService();

        switch (change.type) {
            case EVENTS.ADD:
                const { terms, id } = change.after; 
                const searchId = id;

                const maxGroupSize = 10;
                const groupSizes = Array.from({ length: maxGroupSize - terms.group_size + 1 }, (_, i) => terms.group_size + i);

                const fetchPromises = groupSizes.map(size => 
                    AccommodationTrigger.limiter.schedule(() => 
                        accommodationsService.fetchAccommodations(terms.ski_site, terms.from_date, terms.to_date, size)
                    )
                );

                const results = await Promise.allSettled(fetchPromises);
                const accommodationsToSave = results
                    .filter(result => result.status === 'fulfilled')
                    .map((result, index) => ({ size: groupSizes[index], accommodations: result.value }));

                await accommodationsService.sendEvent(searchId, { accommodations: accommodationsToSave });
                break;
        }
    }
}

export default AccommodationTrigger;
