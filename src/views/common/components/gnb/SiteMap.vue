<template>
    <div class="sitemap-container" :class="{'disabled': disabled}">
        <div class="sitemap-button" :class="visible ? 'visible' : ''" @click="toggleMenu">
            <p-i class="sitemap-icon" :name="visible ? 'ic_delete' : 'ic_gnb_service_2'"
                 :color="visible ? 'transparent inherit' : 'inherit transparent'"
                 width="2rem" height="2rem"
            />
        </div>
        <div v-if="visible" v-click-outside="hideMenu" class="sitemap">
            <ul v-for="(menu, aIdx) in siteMapMenuList"
                :key="aIdx"
            >
                <template v-if="menu.show !== false">
                    <router-link :to="menu.to">
                        <li class="menu" @click="hideMenu">
                            <p-i :name="MENU_ICON[menu.name]"
                                 color="inherit inherit"
                                 height="1.5rem" width="1.5rem"
                            /> {{ menu.label }}
                        </li>
                    </router-link>
                    <div v-if="menu.subMenuList.length > 0">
                        <div v-for="(subMenu, sIdx) in menu.subMenuList"
                             :key="sIdx"
                        >
                            <div v-if="subMenu.show">
                                <router-link v-if="subMenu" :to="subMenu.to">
                                    <li class="submenu" @click="hideMenu">
                                        {{ subMenu.label }}
                                        <span v-if="subMenu.isNew" class="new-text">new</span>
                                    </li>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </template>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import { PI } from '@spaceone/design-system';

import vClickOutside from 'v-click-outside';
import { store } from '@/store';


enum MENU_ICON {
    dashboard = 'ic_dashboard',
    project = 'ic_project',
    inventory = 'ic_inventory',
    identity = 'ic_identity',
    automation = 'ic_automation',
    plugin = 'ic_plugin',
    management = 'ic_management',
}

export default {
    name: 'SiteMap',
    components: {
        PI,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        menuList: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            showAutomation: store.state.user.powerSchedulerState,
            siteMapMenuList: computed(() => ([
                {
                    name: 'dashboard',
                    label: vm.$t('MENU.DASHBOARD.DASHBOARD'),
                    to: { name: 'dashboard' },
                    subMenuList: [],
                },
                ...props.menuList,
            ])),
        });

        const hideMenu = () => {
            emit('update:visible', false);
        };
        const toggleMenu = () => {
            if (!props.disabled) {
                emit('update:visible', !props.visible);
            }
        };

        return {
            ...toRefs(state),
            MENU_ICON,
            hideMenu,
            toggleMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sitemap-container {
    .sitemap-button {
        position: relative;
        cursor: pointer;
        text-decoration: none;
        opacity: 0.5;
        &:hover {
            @apply text-primary;
            opacity: 1;
            .sitemap-icon {
                @apply bg-primary4;
            }
        }
        &.visible {
            @apply text-primary;
            opacity: 1;
        }
        .sitemap-icon {
            @apply rounded-full;
        }
    }
    .sitemap {
        @apply bg-white border border-gray-200 text-gray-900;
        position: absolute;
        top: 2.5rem;
        left: 0;
        max-height: calc(100vh - 4rem);
        width: 15rem;
        font-size: 0.875rem;
        box-shadow: 0 0 14px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        z-index: 999;
        padding: 1.5rem 0;
        margin-left: 1.5rem;
        ul:first-child .menu {
            margin-top: 0;
        }
        li {
            @apply cursor-pointer;
            display: block;
            font-size: 0.875rem;
            &:hover {
                @apply text-primary;
                transition: all ease 0.3s;
                &.menu .p-i-icon {
                    @apply text-primary;
                    transition: all ease 0.3s;
                }
            }
            &.menu {
                @apply font-bold;
                line-height: 2rem;
                padding-left: 1.5rem;
                margin-top: 1.5rem;
                .p-i-icon {
                    @apply text-primary-dark;
                    margin-right: 0.25rem;
                }
            }
            &.submenu {
                @apply text-gray-500;
                line-height: 1.75rem;
                padding-left: 3.5rem;
                &:hover {
                    @apply text-primary;
                    transition: all ease 0.3s;
                }
                .new-text {
                    font-size: 0.75rem;
                    background: linear-gradient(to right, theme('colors.primary'), theme('colors.secondary'));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    vertical-align: super;
                    cursor: default;
                    margin-left: 0.25rem;
                }
            }
        }
    }

    &.disabled {
        .sitemap-button {
            cursor: not-allowed;
            opacity: 0.2;
            &:hover {
                @apply text-gray-900;
                opacity: 0.2;
            }
        }
    }
}
</style>
