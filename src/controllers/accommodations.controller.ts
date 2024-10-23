import * as express from "express";
import { TypedRequest } from "../..";
import { singleton } from "../decorators/singleton";
import AccommodationsService from "../services/accommodations.service";
import Bottleneck from "bottleneck";
import { v4 as uuidv4 } from 'uuid';
import { DBService } from "../services/db/db.service";
import { COLLECTION } from "../constants";

const limiter = new Bottleneck({
    minTime: 100,
    maxConcurrent: 5,
});

@singleton
export default class AccommodationsController {
    public static controllerName = 'Accommodations';
    public middleware: any;
    public path = `/api/${AccommodationsController.controllerName}`;
    public router: any = express.Router();
    private accommodationsService = new AccommodationsService();
    private dbService = new DBService(); // Inject DBService

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(
            this.path + '/search/:id',
            this.searchById.bind(this)
        );
        this.router.post(this.path + '/search', this.search.bind(this));
    }

    public async searchById(req: TypedRequest<{ id: string }>, res: express.Response): Promise<void> {
        console.log('searchById', req.params);

        const { id } = req.params;

        if (!id) {
            res.status(404).send('Error - no id supplied');
            return;
        }

        try {
            const results = await this.dbService.get(COLLECTION.ACCOMMODATIONS, id); // Accessing the collection via the constant
            if (!results) {
                res.status(404).send('Error - results not found for this id');
                return;
            }
            res.status(200).json(results);
        } catch (error) {
            console.log('searchByIdError ', error);
            res.status(500).send('Error in searchById');
        }
    }

    public async search(req: TypedRequest<{ ski_site: number; from_date: string; to_date: string; group_size: number }>, res: express.Response): Promise<void> {
        console.log('search', req.body);

        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).send('Error - search accommodation, empty payload supplied');
            return;
        }

        const { ski_site, from_date, to_date, group_size } = req.body;
        const maxGroupSize = 10;
        const groupSizes = Array.from({ length: maxGroupSize - group_size + 1 }, (_, i) => group_size + i);

        const searchId = uuidv4(); 
        await this.dbService.add(COLLECTION.ACCOMMODATIONS, { id: searchId, results: [] });
        res.status(200).json({ searchId });

        const sendEvent = async (data: any) => {
            const currentData = await this.dbService.get(COLLECTION.ACCOMMODATIONS, searchId);
            const updatedResults = currentData ? currentData.results : [];
            const exists = updatedResults.some(result => 
                result.size === data.size && 
                result.accommodations.some(acc => acc.id === data.accommodations.id)
            );

            if (!exists) {
                updatedResults.push(data);
            }

            await this.dbService.set(COLLECTION.ACCOMMODATIONS, searchId, { results: updatedResults });
        };

        const promises = groupSizes.map(size => 
            limiter.schedule(() => 
                this.accommodationsService.fetchAccommodations(ski_site, from_date, to_date, size)
                    .then(results => {
                        sendEvent({ size, accommodations: results });
                    })
                    .catch(error => {
                        console.log('Error fetching accommodations:', error);
                        sendEvent({ size, error: error.message });
                    })
            )
        );

        await Promise.allSettled(promises);
    }
}
