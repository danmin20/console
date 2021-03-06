import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.client.inventory.region.list({
            query: {
                only: ['name', 'region_code']
            },
        });
        const regions: ResourceMap = {};

        response.results.forEach((regionInfo: any): void => {
            regions[regionInfo.region_code] = {
                label: `${regionInfo.name} | ${regionInfo.region_code}`,
                name: regionInfo.name,
            };
        });

        commit('setRegions', regions);
    } catch (e) {}
};
