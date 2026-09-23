<script setup>
import { computed } from 'vue';
import { formatCurrency, formatDate, timeRemaining } from '../utils/format';

const props = defineProps({
    item: { type: Object, required: true }
});

const visibleCategories = computed(() => props.item.categories?.slice(0, 3) || []);

const visualStyle = computed(() => {
    const palettes = [
        'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
        'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
        'linear-gradient(135deg, #ecfccb 0%, #a3e635 100%)',
        'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
        'linear-gradient(135deg, #f3e8ff 0%, #c4b5fd 100%)'
    ];
    return { background: palettes[Number(props.item.item_id || 0) % palettes.length] };
});
</script>

<template>
    <article class="card item-card h-100 border-0 shadow-sm">
        <RouterLink class="item-visual" :to="`/item/${item.item_id}`" :style="visualStyle" :aria-label="`View ${item.name}`">
            <span class="product-mark" aria-hidden="true"><i class="bi bi-box-seam"></i></span>
            <span class="item-visual-label" aria-hidden="true">AUCTIONARY</span>
            <span class="item-badge">{{ timeRemaining(item.end_date) }}</span>
        </RouterLink>
        <div class="card-body d-flex flex-column p-4">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <div class="small text-uppercase tracking-wide text-muted">Item #{{ item.item_id }}</div>
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
