import axios from "axios";
import { COLLECTION } from "../constants";
import { DBService } from "./db/db.service";
import { PROVIDERS } from "../config/providers";

export default class AccommodationsService {
    private dbService = new DBService();

    public async fetchAccommodations(ski_site: number, from_date: string, to_date: string, group_size: number) {
        const payload = {
            query: {
                ski_site,
                from_date,
                to_date,
                group_size,
            }
        };

        try {
            const response = await axios.post(`${PROVIDERS.WESKI}`, payload);
            return response.data.body.accommodations;
        } catch (error) {
            throw new Error(`Failed to fetch accommodations for group size ${group_size}: ${error.message}`);
        }
    }

    public async initSearchResults(data): Promise<void> {
        const searchCriteria = data.id; 
        await this.dbService.set(COLLECTION.ACCOMMODATIONS, searchCriteria, {results:[], ...data});
    }

    public async getSearchResults(searchId: string): Promise<any> {
        return await this.dbService.get(COLLECTION.ACCOMMODATIONS, searchId);
    }

    public async sendEvent(searchId: string, data: any[]): Promise<void> {
        const currentData = await this.dbService.get(COLLECTION.ACCOMMODATIONS, searchId);
        const updatedResults = currentData ? currentData.results : [];
    
        for (const accommodation of data) {
            const exists = updatedResults.some(result => 
                result.size === accommodation.size && 
                result.id === accommodation.id
            );
    
            if (!exists) {
                updatedResults.push(accommodation);
            }
        }
    
        await this.dbService.set(COLLECTION.ACCOMMODATIONS, searchId, { results: updatedResults });
    }    
    
}