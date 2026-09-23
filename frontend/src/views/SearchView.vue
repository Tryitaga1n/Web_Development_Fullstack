<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ItemCard from '../components/ItemCard.vue';
import api, { apiErrorMessage } from '../services/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const PAGE_SIZE = 12;

const filters = reactive({
    q: String(route.query.q || ''),
    status: String(route.query.status || ''),
    category_id: String(route.query.category || '')
});
const categories = ref([]);
const items = ref([]);
const loading = ref(false);
const error = ref('');
const page = ref(0);

const search = async (targetPage = 0) => {
    loading.value = true;
    error.value = '';
    page.value = targetPage;

    const params = {
        limit: PAGE_SIZE,
        offset: targetPage * PAGE_SIZE
    };
    if (filters.q) params.q = filters.q;
    if (filters.status) params.status = filters.status;
    if (filters.category_id) params.category_id = filters.category_id;

    try {
        const { data } = await api.get('/search', { params });
        items.value = data;
        router.replace({
            query: {
                ...(filters.q ? { q: filters.q } : {}),
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.category_id ? { category: filters.category_id } : {})
            }
        });
    } catch (err) {
        items.value = [];
        error.value = apiErrorMessage(err, 'Unable to search the marketplace.');
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => search(0);

onMounted(async () => {
    try {
        const { data } = await api.get('/categories');
        categories.value = data;
    } catch {
        categories.value = [];
    }
    await search(0);
});
</script>

<template>
    <section class="page-hero compact-hero">
        <div class="container py-5">
            <p class="eyebrow text-accent mb-2">The marketplace</p>
            <h1 class="display-5 fw-bold mb-2">Browse every item</h1>
            <p class="text-secondary mb-0">Search by title, category or the auctions connected to your account.</p>
        </div>
    </section>

    <section class="container py-5">
        <form class="filter-panel mb-5" @submit.prevent="applyFilters">
            <div class="row g-3 align-items-end">
                <div class="col-lg-5">
                    <label class="form-label" for="search-q">Search titles</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
                        <input id="search-q" v-model.trim="filters.q" class="form-control" placeholder="Camera, furniture, watch..." />
                    </div>
                </div>
                <div class="col-sm-6 col-lg-2">
                    <label class="form-label" for="search-category">Category</label>
                    <select id="search-category" v-model="filters.category_id" class="form-select">
                        <option value="">All categories</option>
                        <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
                            {{ category.name }}
                        </option>
                    </select>
                </div>
                <div class="col-sm-6 col-lg-3">
                    <label class="form-label" for="search-status">Auction status</label>
                    <select id="search-status" v-model="filters.status" class="form-select">
                        <option value="">All auctions</option>
                        <option value="OPEN" :disabled="!auth.isAuthenticated">My open auctions</option>
                        <option value="BID" :disabled="!auth.isAuthenticated">Auctions I bid on</option>
                        <option value="ARCHIVE" :disabled="!auth.isAuthenticated">My ended auctions</option>
                    </select>
                </div>
                <div class="col-lg-2 d-grid">
                    <button class="btn btn-dark btn-lg" type="submit" :disabled="loading">Search</button>
                </div>
            </div>
            <p v-if="!auth.isAuthenticated" class="small text-secondary mt-3 mb-0">
                Log in to filter by your own listings or the auctions you have bid on.
            </p>
        </form>

        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="h3 mb-0">{{ page === 0 ? 'Search results' : `Results - page ${page + 1}` }}</h2>
            <span class="text-secondary small">{{ items.length }} item{{ items.length === 1 ? '' : 's' }} shown</span>
        </div>

        <div v-if="loading" class="text-center py-5" aria-live="polite">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading</span></div>
            <p class="text-secondary mt-3 mb-0">Searching listings...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

        <div v-else-if="!items.length" class="empty-state">
            <i class="bi bi-search" aria-hidden="true"></i>
            <h3 class="h4 mt-3">No items found</h3>
            <p class="text-secondary">Try a broader title, another category, or clear the filters.</p>
            <button class="btn btn-outline-dark" type="button" @click="Object.assign(filters, { q: '', status: '', category_id: '' }); search(0)">Clear filters</button>
        </div>

        <div v-else class="row g-4">
            <div v-for="item in items" :key="item.item_id" class="col-md-6 col-xl-4">
                <ItemCard :item="item" />
            </div>
        </div>

        <nav v-if="!loading && !error && (page > 0 || items.length === PAGE_SIZE)" class="d-flex justify-content-center align-items-center gap-3 mt-5" aria-label="Search results pages">
            <button class="btn btn-outline-dark" type="button" :disabled="page === 0" @click="search(page - 1)">
                <i class="bi bi-arrow-left me-1"></i>Previous
            </button>
            <span class="text-secondary">Page {{ page + 1 }}</span>
            <button class="btn btn-outline-dark" type="button" :disabled="items.length < PAGE_SIZE" @click="search(page + 1)">
                Next<i class="bi bi-arrow-right ms-1"></i>
            </button>
        </nav>
    </section>
</template>
