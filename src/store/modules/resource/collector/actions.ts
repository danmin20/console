import { SpaceConnector } from '@/lib/space-connector';
import { tagsToObject } from '@/lib/util';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.client.inventory.collector.list({
            query: {
                only: ['collector_id', 'name', 'tags'],
            },
        });
        const collectors: ResourceMap = {};

        response.results.forEach((collectorInfo: any): void => {
            const collectorTags = tagsToObject(collectorInfo.tags);

            collectors[collectorInfo.collector_id] = {
                label: collectorInfo.name,
                name: collectorInfo.name,
                icon: collectorTags.icon,
            };
        });

        commit('setCollectors', collectors);
    } catch (e) {}
};
