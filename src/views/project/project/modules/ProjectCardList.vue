<template>
    <p-toolbox-grid-layout class="project-cards"
                           card-height="11.25rem"
                           card-min-width="18.75rem"
                           :items="items"
                           :all-page="allPage"
                           :loading="loading"
                           :this-page.sync="thisPage"
                           :page-size.sync="pageSize"
                           :total-count="totalCount"
                           @changePageNumber="getData"
                           @changePageSize="getData"
                           @clickRefresh="getData"
    >
        <template #toolbox-left>
            <div v-tooltip.bottom="{content: $t('PROJECT.LANDING.SHOW_ALL_TOOLTIP'), delay: {show: 500}}" class="show-all-wrapper">
                <p-check-box v-model="showAllProjects">
                    <span class="label">{{ $t('PROJECT.LANDING.SHOW_ALL') }}</span>
                </p-check-box>
            </div>
        </template>
        <template #no-data>
            <div class="empty-container">
                <div v-if="noProjectGroup">
                    <p class="title">
                        {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_TITLE') }}<br>
                    </p>
                    <p class="content">
                        {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT') }}
                    </p>
                    <p class="content-order">
                        {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT_ORDER') }}
                    </p>
                    <p-button style-type="primary-dark" class="mt-8"
                              @click="$emit('create-project-group')"
                    >
                        <p-i name="ic_plus_bold" color="inherit"
                             width="1rem" height="1rem" class="mr-1 cursor-pointer add-btn"
                        />
                        {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_CREATE_BTN') }}
                    </p-button>
                </div>
                <div v-else-if="noProject" class="empty-project">
                    <p class="text-primary2">
                        {{ $t('PROJECT.LANDING.EMPTY_PROJECT_MSG') }}
                    </p>
                </div>
            </div>
        </template>
        <template #card="{item}">
            <router-link class="project-card-container"
                         :to="{ name: 'projectDetail',params: {id: item.project_id}}"
            >
                <div class="card-top-wrapper">
                    <div class="group-name">
                        <template v-if="parentGroups.length > 0">
                            {{ parentGroups[parentGroups.length - 1].name }} >
                        </template>
                        {{ item.project_group_info.name }}
                    </div>
                    <p class="project-name">
                        {{ item.name }}
                    </p>
                    <div class="project-summary">
                        <div v-if="cardSummary[item.project_id]" class="summary-item">
                            <span class="summary-item-text">{{ $t('PROJECT.LANDING.SERVER') }}</span>
                            <span class="summary-item-num">{{ cardSummary[item.project_id].serverCount }}</span>
                            <span class="mx-2 text-gray-300 divider">|</span>
                            <span class="summary-item-text">{{ $t('PROJECT.LANDING.CLOUD_SERVICES') }}
                                <span class="summary-item-num">{{ cardSummary[item.project_id].cloudServiceCount }}</span></span><br>
                        </div>
                        <template v-else>
                            <div v-for="v in skeletons" :key="v" class="skeleton-loading">
                                <p-skeleton />
                            </div>
                        </template>
                    </div>
                </div>

                <div class="card-bottom-wrapper">
                    <div class="accounts">
                        <span v-if="item.providers.length" class="label">{{ $t('PROJECT.LANDING.SERVICE_ACCOUNTS') }}</span>
                        <div class="provider-icon-wrapper">
                            <div class="provider">
                                <router-link v-for="(provider, index) in item.providers"
                                             :key="index"
                                             :to="{
                                                 name: 'serviceAccount',
                                                 query: { provider: getProvider(provider) ? provider : null },
                                             }"
                                             class="link"
                                             :style="{
                                                 backgroundImage: `url('${getProvider(provider).icon}')`
                                             }"
                                />
                            </div>
                        </div>
                        <div class="account-add">
                            <router-link class="icon-wrapper" :to="{name: 'serviceAccount',}">
                                <p-i name="ic_plus_thin" scale="0.8" />
                            </router-link>
                            <span v-if="item.providers.length === 0" class="add-label"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                        </div>
                    </div>
                    <div class="favorite-wrapper">
                        <favorite-button :item-id="item.project_id"
                                         favorite-type="project"
                                         resource-type="identity.Project"
                        />
                    </div>
                </div>
            </router-link>
        </template>
    </p-toolbox-grid-layout>
</template>


<script lang="ts">
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { getAllPage } from '@/components/organisms/paginations/text-pagination/helper';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { ProjectGroup } from '@/views/project/project/modules/ProjectSearch.toolset';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { range } from 'lodash';
import axios, { CancelTokenSource } from 'axios';
import { FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteButton from '@/views/common/components/favorites/FavoriteButton.vue';

interface Props {
    searchText: string;
    groupId: string;
    parentGroups: ProjectGroup[];
    noProjectGroup?: boolean;
}

export default {
    name: 'ProjectCardList',
    components: {
        FavoriteButton,
        PI,
        PButton,
        PSkeleton,
        PCheckBox,
        PToolboxGridLayout,
    },
    props: {
        searchText: {
            type: String,
            default: '',
        },
        groupId: {
            type: String,
            default: '',
        },
        parentGroups: {
            type: Array,
            default: () => [],
        },
        noProjectGroup: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props: Props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: [],
            totalCount: 0,
            loading: true,
            thisPage: 1,
            pageSize: 24,
            allPage: computed(() => getAllPage(state.totalCount, (state.pageSize))),
            cardSummary: {},
            showAllProjects: false,
            noProject: computed(() => !state.loading && state.totalCount === 0),
            hoveredProjectId: '',
            hoveredGroupId: '',
        });

        const getProvider = name => vm.$store.state.resource.provider.items[name] || {};
        const goToServiceAccount = (provider) => {
            vm.$router.push({
                name: 'serviceAccount',
                query: { provider: getProvider(provider) ? provider : null },
            });
        };

        const loadProjectFavorites = async () => {
            await vm.$store.dispatch('favorite/project/load');
        };

        const listProjectApi = SpaceConnector.client.identity.projectGroup.listProjects;
        const listAllProjectApi = SpaceConnector.client.identity.project.list;
        const listQuery = new QueryHelper();

        const getParams = (id?, text?) => {
            listQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize);

            if (text) listQuery.setFilter({ k: 'name', v: props.searchText, o: 'contain' });

            const params: any = { include_provider: true, query: listQuery.data };
            if (id) params.project_group_id = id;
            if (state.showAllProjects) params.recursive = true;

            return params;
        };


        let getCardToken: CancelTokenSource | undefined;
        const getCardSummary = async (items) => {
            if (getCardToken) {
                getCardToken.cancel('Next request has been called.');
                getCardToken = undefined;
            }

            getCardToken = axios.CancelToken.source();
            const cardSummary = {};
            try {
                const ids = items.map(item => item.project_id);
                const res = await SpaceConnector.client.statistics.topic.projectPage({
                    projects: ids,
                }, { cancelToken: getCardToken.token });

                res.results.forEach((d) => {
                    cardSummary[d.project_id] = {
                        ...d,
                        cloudServiceCount: d.cloud_service_count || 0,
                        serverCount: d.server_count || 0,
                    };
                });
            } catch (e) { console.error(e); }
            return cardSummary;
        };

        let listProjectToken: CancelTokenSource | undefined;
        const getData = async (id?, text?) => {
            // if request is already exist, cancel the request
            if (listProjectToken) {
                listProjectToken.cancel('Next request has been called.');
                listProjectToken = undefined;
            }
            // create a new token for upcoming request (overwrite the previous one)
            listProjectToken = axios.CancelToken.source();
            state.loading = true;
            try {
                let res;
                if (id) res = await listProjectApi(getParams(id, text), { cancelToken: listProjectToken.token });
                else res = await listAllProjectApi(getParams(undefined, text), { cancelToken: listProjectToken.token });

                state.cardSummary = await getCardSummary(res.results);
                state.items = res.results;
                state.totalCount = res.total_count;
                state.loading = false;
                listProjectToken = undefined;

                vm.$emit('list', state.totalCount);
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    state.items = [];
                    state.totalCount = 0;
                    state.loading = false;
                    vm.$emit('list', state.totalCount);
                } else console.error(e);
            }
        };

        const resetAll = () => {
            state.items = [];
            state.totalCount = 0;
            state.thisPage = 1;
            state.pageSize = 24;
        };

        const listProjects = async (groupId?, searchText?, reset = false) => {
            if (reset) resetAll();
            await getData(groupId, searchText);
        };

        watch(() => state.showAllProjects, async (after, before) => {
            if (after !== before) {
                await listProjects(props.groupId, props.searchText, true);
            }
        }, { immediate: false });

        /* Init */
        (async () => {
            await loadProjectFavorites();
        })();

        return {
            ...toRefs(state),
            getProvider,
            goToServiceAccount,
            getData,
            skeletons: range(1),
            listProjects,
        };
    },
};
</script>

<style lang="postcss" scoped>
.show-all-wrapper {
    @apply flex items-center text-base truncate leading-tight;
    .label {
        @apply text-sm ml-2 leading-relaxed;
    }
}

.empty-container {
    @apply flex-col text-center justify-start;
    .empty-project {
        @apply text-gray-300 text-center text-base;
    }
}

.project-cards::v-deep .card-item {
    @apply bg-white border border-gray-200 overflow-visible rounded cursor-pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    &:hover {
        @apply border-l border-gray-200 bg-blue-100;
    }
}

.project-card-container {
    @apply flex flex-col w-full h-full;
}

.card-top-wrapper {
    @apply flex-grow mx-4 my-6 flex flex-col;
    .group-name {
        @apply flex-shrink-0 text-gray-500 text-xs truncate;
        margin-bottom: 0.25rem;
    }
    .project-name {
        @apply flex-grow flex-shrink-0 font-bold overflow-hidden;
        display: -webkit-box;
        text-overflow: ellipsis;
        word-wrap: break-word;
        font-size: 1.125rem;
        line-height: 1.2;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }
    .project-summary {
        @apply flex-shrink-0;
        .summary-item-text {
            @apply text-sm text-left inline-block;
        }
        .summary-item-num {
            @apply ml-2 font-bold;
        }
        .skeleton-loading {
            @apply flex items-center pb-2 pr-15;
        }
    }
}
.card-bottom-wrapper {
    @apply flex-shrink-0 flex-grow-0 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500;
    height: 3rem;
    .accounts {
        @apply flex-grow-0 overflow-x-hidden flex items-center justify-between px-4;
        .label {
            @apply flex-shrink-0 flex-grow-0 mr-2;
        }
        .provider-icon-wrapper {
            @apply flex-shrink inline-flex items-center truncate;
            .provider {
                @apply truncate;
                min-width: 0;
            }
            .link {
                @apply flex-shrink-0 inline-block mr-2;
                height: 1.25rem;
                width: 1.25rem;
                background-repeat: no-repeat;
                background-size: 100%;
                background-position: bottom;
                line-height: 1.25rem;
            }
        }
        .account-add {
            @apply flex-shrink-0 inline-flex items-center text-gray-900;
            .add-label {
                @apply ml-2;
            }
            .icon-wrapper {
                @apply bg-gray-100 rounded-full inline-flex justify-center items-center;
                height: 1.25rem;
                width: 1.25rem;
            }
            &:hover {
                @apply text-secondary font-bold;
                .icon-wrapper {
                    @apply bg-blue-300;
                }
            }
        }
    }
    .favorite-wrapper {
        @apply flex-shrink-0 h-full px-4 border-l border-gray-100 inline-flex items-center;
    }
}
</style>