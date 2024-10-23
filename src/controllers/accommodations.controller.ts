import * as express from "express";
import { TypedRequest } from "../..";
import { singleton } from "../decorators/singleton";
import AccommodationsService from "../services/accommodations.service";
import { v4 as uuidv4 } from 'uuid';


@singleton
export default class AccommodationsController {
    public static controllerName = 'Accommodations';
    public middleware: any;
    public path = `/api/${AccommodationsController.controllerName}`;
    public router: any = express.Router();
    private accommodationsService = new AccommodationsService();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(
            this.path + '/search/:id',
            this.searchById.bind(this)
        );
        this.router.post(
            this.path + '/search',
            this.search.bind(this)
        );
    }

    public async searchById(req: TypedRequest<{ id: string }>, res: express.Response): Promise<void> {
        console.log('searchById', req.params);
    
        const { id } = req.params;
    
        if (!id) {
            res.status(404).json({ error: 'Error - no id supplied' });
            return;
        }
    
        try {
            const results = await this.accommodationsService.getSearchResults(id); 
            if (!results) {
                res.status(404).json({ error: 'Error - results not found for this id' });
                return;
            }
            res.status(200).json(results);
        } catch (error) {
            console.log('searchByIdError ', error);
            res.status(500).json({ error: 'Error in searchById' }); 
        }
    }    

    public async search(req: TypedRequest<{ ski_site: number; from_date: string; to_date: string; group_size: number }>, res: express.Response): Promise<void> {
        console.log('search', req.body);
    
        const requiredFields = ['ski_site', 'from_date', 'to_date', 'group_size'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                res.status(400).json({ error: `Error - missing required field: ${field}` });
                return;
            }
        }
        
        const searchId = uuidv4();
        await this.accommodationsService.initSearchResults({id: searchId, terms: req.body}); 
        res.status(200).json({ searchId });
    }
}