/* eslint-disable camelcase */
import {
    GetAction, Resource,
    ResourceActions, SetParameterAction,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';

const idField = 'search';
interface IdParameter {
    [idField]: string;
}

export interface AutocompleteItem {
    key: string;
    name: string;
}

class Get extends SetParameterAction<any, ListType<AutocompleteItem>> {
    protected path = 'get';

    setResourceType(resource: string) {
        const api = this.clone();
        api.apiState.parameter.resource_type = resource;
        return api;
    }

    setDistinct(distinct: string) {
        const api = this.clone();
        api.apiState.parameter.distinct = distinct;
        return api;
    }

    setSearch(search: string) {
        const api = this.clone();
        api.apiState.parameter.search = search;
        return api;
    }

    setLimit(limit: number): this {
        const api = this.clone();
        api.apiState.parameter.options = {
            limit,
        };
        return api;
    }
}

export default class Autocomplete extends Resource implements ResourceActions<'get'> {
    protected name = 'autocomplete';

    get(): Get { return new Get(this.api, this.baseUrl); }
}