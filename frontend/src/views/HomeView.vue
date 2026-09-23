<script setup>
import { onMounted, ref } from 'vue';
import ItemCard from '../components/ItemCard.vue';
import api, { apiErrorMessage } from '../services/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const items = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');

const loadHome = async () => {
    loading.value = true;
    error.value = '';
    try {
        const [itemResponse, categoryResponse] = await Promise.all([
            api.get('/search', { params: { limit: 6 } }),
            api.get('/categories')
        ]);
        items.value = itemResponse.data;
        categories.value = categoryResponse.data;
    } catch (err) {
        error.value = apiErrorMessage(err, 'Unable to load the auction floor.');
    } finally {
        loading.value = false;
    }
};

onMounted(loadHome);
</script>

<template>
    <section class="hero-section">
        <div class="container position-relative">
            <div class="row align-items-center g-5 py-lg-5">
                <div class="col-lg-7 text-white">
                    <p class="eyebrow mb-3">Fine records. Serious listening.</p>
                    <h1 class="display-3 fw-bold lh-1 mb-4">Auction house for the analog obsessed.</h1>
                    <p class="lead text-white-50 mb-4 col-lg-10">
                        Discover rare pressings, collectable box sets and carefully kept audio equipment from sellers who know the groove.
                    </p>
                    <div class="d-flex flex-wrap gap-3">
                        <RouterLink class="btn btn-accent btn-lg" to="/search">
                            <i class="bi bi-search me-2" aria-hidden="true"></i>Browse auctions
                        </RouterLink>
                        <RouterLink class="btn btn-outline-light btn-lg" :to="auth.isAuthenticated ? '/create' : '/register'">
                            Start selling
                        </RouterLink>
                    </div>
                </div>
                <div class="col-lg-5 d-none d-lg-block">
                    <div class="hero-record-wrap" aria-hidden="true">
                        <div class="hero-record">
                            <div class="hero-record-label">
                                <i class="bi bi-vinyl-fill"></i>
                                <span>NOCTURNE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="container py-5">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="feature-panel h-100">
                    <i class="bi bi-patch-check feature-icon" aria-hidden="true"></i>
                    <h2 class="h5 mt-3">Clear lot details</h2>
                    <p class="text-secondary mb-0">Seller, condition notes and current bids are visible before you commit.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-panel h-100">
                    <i class="bi bi-people feature-icon" aria-hidden="true"></i>
                    <h2 class="h5 mt-3">Open questions</h2>
                    <p class="text-secondary mb-0">Ask the seller directly, just like you would in a real record shop.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-panel h-100">
                    <i class="bi bi-save feature-icon" aria-hidden="true"></i>
                    <h2 class="h5 mt-3">Draft your listing</h2>
                    <p class="text-secondary mb-0">Save unfinished auction ideas locally and publish when the details are right.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="container pb-5">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-3 mb-4">
            <div>
                <p class="eyebrow text-accent mb-2">Browse by crate</p>
                <h2 class="h1 mb-0">Find your next obsession</h2>
            </div>
            <RouterLink class="btn btn-outline-dark" to="/search">View all lots <i class="bi bi-arrow-right ms-1"></i></RouterLink>
        </div>
        <div v-if="categories.length" class="d-flex flex-wrap gap-2">
            <RouterLink
                v-for="category in categories"
                :key="category.category_id"
                class="category-pill"
                :to="{ name: 'search', query: { category: category.category_id } }"
            >
                {{ category.name }}
            </RouterLink>
        </div>
    </section>

    <section class="container pb-5 mb-4">
        <div class="section-heading mb-4">
            <p class="eyebrow text-accent mb-2">Closing soon</p>
            <h2 class="h1 mb-0">Freshly listed</h2>
        </div>

        <div v-if="loading" class="row g-4" aria-live="polite">
            <div v-for="n in 3" :key="n" class="col-md-6 col-xl-4">
                <div class="placeholder-card placeholder-glow">
                    <span class="placeholder col-12 placeholder-visual"></span>
                    <div class="p-4">
                        <span class="placeholder col-5 mb-3"></span>
                        <span class="placeholder col-10"></span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

        <div v-else-if="!items.length" class="empty-state">
            <i class="bi bi-vinyl" aria-hidden="true"></i>
            <h3 class="h4 mt-3">The auction floor is quiet</h3>
            <p class="text-secondary">No lots are listed yet. Be the first to create one.</p>
            <RouterLink class="btn btn-dark" :to="auth.isAuthenticated ? '/create' : '/login'">List an item</RouterLink>
        </div>

        <div v-else class="row g-4">
            <div v-for="item in items" :key="item.item_id" class="col-md-6 col-xl-4">
                <ItemCard :item="item" />
            </div>
        </div>
    </section>
</template>
