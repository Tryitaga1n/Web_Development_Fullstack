<script setup>
import { computed } from 'vue';
import { formatCurrency, formatDate, timeRemaining } from '../utils/format';

const props = defineProps({
    item: { type: Object, required: true }
});

const visibleCategories = computed(() => props.item.categories?.slice(0, 3) || []);

const visualStyle = computed(() => {
    const palettes = [
        'linear-gradient(135deg, #f0b35b 0%, #8d382f 100%)',
        'linear-gradient(135deg, #85a8a2 0%, #263c42 100%)',
        'linear-gradient(135deg, #d9b5a7 0%, #704b45 100%)',
        'linear-gradient(135deg, #c8c1aa 0%, #454038 100%)',
        'linear-gradient(135deg, #91a8d0 0%, #313a58 100%)'
    ];
    return { background: palettes[Number(props.item.item_id || 0) % palettes.length] };
});
</script>

<template>
    <article class="card item-card h-100 border-0 shadow-sm">
        <RouterLink class="item-visual" :to="`/item/${item.item_id}`" :style="visualStyle" :aria-label="`View ${item.name}`">
            <span class="record-disc" aria-hidden="true"></span>
            <span class="vinyl-label" aria-hidden="true">NOCTURNE</span>
            <span class="item-badge">{{ timeRemaining(item.end_date) }}</span>
        </RouterLink>
        <div class="card-body d-flex flex-column p-4">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <div class="small text-uppercase tracking-wide text-muted">Lot #{{ item.item_id }}</div>
                <span v-for="category in visibleCategories" :key="category.category_id" class="badge item-category">{{ category.name }}</span>
            </div>
            <h2 class="h5 card-title mb-2">
                <RouterLink class="stretched-link-heading" :to="`/item/${item.item_id}`">{{ item.name }}</RouterLink>
            </h2>
            <p class="card-text text-secondary line-clamp-3">{{ item.description }}</p>
            <div class="mt-auto d-flex justify-content-between align-items-end gap-3 pt-3">
                <div>
                    <div class="small text-muted">{{ item.current_bid !== undefined ? 'Current bid' : 'Opening bid' }}</div>
                    <div v-if="item.current_bid !== undefined" class="price">{{ formatCurrency(item.current_bid) }}</div>
                    <div v-else class="price price--link">View details</div>
                </div>
                <div class="text-end small text-muted">
                    <div>Ends {{ formatDate(item.end_date) }}</div>
                    <div v-if="item.first_name">By {{ item.first_name }} {{ item.last_name }}</div>
                </div>
            </div>
        </div>
    </article>
</template>
