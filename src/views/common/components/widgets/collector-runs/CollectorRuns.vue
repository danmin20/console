<template>
    <p-widget-layout :title="$t('COMMON.WIDGETS.RUN_COLLECTOR')">
        <template #extra>
            <div class="flex justify-end">
                <p-i name="ic_refresh" class="cursor-pointer" @click="getData" />
            </div>
        </template>
        <p-data-table :items="items" :loading="loading" :fields="fields"
                      :striped="false"
                      bordered
                      table-style-type="primary4"
                      @rowLeftClick="onRowClick"
        >
            <template #skeleton-name>
                <div class="flex items-center">
                    <p-skeleton class="flex-shrink-0 mr-4" width="1.5rem" height="1.5rem" />
                    <p-skeleton />
                </div>
            </template>
            <template #no-data="{fields}">
                <tr key="noData" class="bg-primary3">
                    <td :colspan="fields.length" class="text-gray">
                        {{ $t('COMMON.WIDGETS.RUN_COLLECTOR_NO_RECENT_RUN') }}
                    </td>
                </tr>
            </template>
            <template #col-collector_info-format="{value}">
                <p-lottie class="status-icon"
                          width="1.5rem" heigh="1.5rem"
                          :auto="true" name="lottie_working"
                />
                <p-lazy-img
                    :src="providers.find(d => d.provider === value.provider).tags.icon"
                    width="1rem" height="1rem"
                    class="ml-3"
                />
                <span class="text-sm ml-2">{{ value.name }}</span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timeFormatter(value) }}
            </template>
        </p-data-table>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PWidgetLayout, PDataTable, PLazyImg, PLottie, PSkeleton, PI,
} from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { ProviderModel } from '@/views/identity/service-account/type';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';
import { TimeStamp } from '@/models';
import { store } from '@/store';


enum JOB_STATE {
    created = 'CREATED',
    progress = 'IN_PROGRESS',
    failure = 'FAILURE',
    timeout = 'TIMEOUT',
    canceled = 'CANCELED',
    success = 'SUCCESS'
}


export interface JobModel {
    job_id: string;
    state: JOB_STATE;
    collect_mode: COLLECT_MODE;
    collector_info: CollectorModel;
    secret_id: string;
    filter: any;
    errors: {
        code: string;
        message: string;
        secret_id?: string;
    }[];
    created_at: TimeStamp;
    finished_at: TimeStamp;
}

export default {
    name: 'CollectorRuns',
    components: {
        PLottie,
        PLazyImg,
        PSkeleton,
        PWidgetLayout,
        PI,
        PDataTable,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            items: [] as JobModel[],
            fields: computed(() => ([
                { label: vm.$t('COMMON.WIDGETS.RUN_COLLECTOR_COLLECTOR'), name: 'collector_info' },
                { label: vm.$t('COMMON.WIDGETS.RUN_COLLECTOR_COMPLETED_TOTAL'), name: 'progress' },
                { label: vm.$t('COMMON.WIDGETS.RUN_COLLECTOR_START_TIME'), name: 'created_at' },
            ])),
            providers: [] as ProviderModel[],
        });

        /* util */
        const convertJobsToFieldItem = (jobs) => {
            const items = [] as JobModel[];
            jobs.forEach((job) => {
                const newJob = {
                    progress: `${job.total_tasks - job.remained_tasks} / ${job.total_tasks}`,
                    ...job,
                };
                items.push(newJob);
            });
            return items;
        };
        const timeFormatter = (value) => {
            let time = dayjs(dayjs.unix(value.seconds)).utc();
            if (state.timezone !== 'UTC') {
                time = dayjs(dayjs.unix(value.seconds)).tz(state.timezone);
            }
            return time.format('MM-DD HH:mm ~');
        };

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getData = async () => {
            state.loading = true;
            try {
                apiQuery.setSort('created_at')
                    .setPage(1, 5)
                    .setFilters([{ k: 'status', v: [JOB_STATE.created, JOB_STATE.progress], o: '=' }]);
                const res = await SpaceConnector.client.inventory.job.list({ query: apiQuery.data });
                state.items = convertJobsToFieldItem(res.results);
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const providerApiQuery = new ApiQueryHelper();
        const getProviders = async () => {
            try {
                providerApiQuery.setOnly('provider', 'tags.icon');
                const res = await SpaceConnector.client.identity.provider.list({ query: providerApiQuery.data });
                state.providers = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        const init = async () => {
            await getProviders();
            await getData();
        };
        init();

        return {
            ...toRefs(state),
            timeFormatter,
            getData,
            onRowClick() {
                vm.$router.push('/plugin/collector');
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.status-icon {
    display: inline-flex;
}
.p-data-table::v-deep {
    border-radius: 0.125rem;
    overflow-y: auto;
    td:first-child {
        @apply cursor-pointer;
    }
    th {
        @apply relative border-0;
        .th-contents {
            @apply text-gray-500;
        }
        &:first-child .th-contents {
            padding-left: 0;
        }
    }
}
</style>
