<template>
    <p-widget-layout :title="$t('COMMON.WIDGETS.COLLECTOR_TITLE')" :help="$t('COMMON.WIDGETS.COLLECTOR_HELP')">
        <div class="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <collector-runs class="widget" />
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import { PWidgetLayout } from '@spaceone/design-system';
import CollectorRuns from '@/views/common/components/widgets/collector-runs/CollectorRuns.vue';

export default {
    name: 'Collectors',
    components: { PWidgetLayout, CollectorRuns },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.widget::v-deep {
    &.widget-layout {
        @apply border-0 border-transparent;
        .top {
            @apply mt-0 mb-4 mx-0;
        }
        .title {
            @apply text-base;
        }
        .widget-contents {
            @apply p-0;
        }
    }
}
</style>
