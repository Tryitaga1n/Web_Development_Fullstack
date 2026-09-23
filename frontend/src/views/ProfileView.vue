<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ItemCard from '../components/ItemCard.vue';
import api, { apiErrorMessage } from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const auth = useAuthStore();
const profile = ref(null);
const loading = ref(true);
const error = ref('');

const isOwnProfile = computed(() => auth.user?.user_id === profile.value?.user_id);
const initials = computed(() => profile.value
    ? `${profile.value.first_name.charAt(0)}${profile.value.last_name.charAt(0)}`
    : '?');

const load = async () => {
    const userId = route.params.id || auth.user?.user_id;
    if (!userId) {
        error.value = 'Log in to view your profile.';
        loading.value = false;
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const { data } = await api.get(`/users/${userId}`);
        profile.value = data;
    } catch (err) {
        error.value = apiErrorMessage(err, 'Unable to load this profile.');
    } finally {
        loading.value = false;
    }
};

onMounted(load);
</script>

<template>
    <div v-if="loading" class="container py-5 text-center">
        <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading</span></div>
    </div>

    <section v-else-if="error" class="container py-5">
        <div class="empty-state">
            <i class="bi bi-person-x" aria-hidden="true"></i>
            <h1 class="h3 mt-3">Profile unavailable</h1>
            <p class="text-secondary">{{ error }}</p>
            <RouterLink class="btn btn-dark" to="/">Return home</RouterLink>
        </div>
    </section>

    <template v-else-if="profile">
        <section class="profile-header">
            <div class="container py-5">
                <div class="d-flex flex-column flex-md-row align-items-md-center gap-4">
                    <span class="profile-avatar">{{ initials }}</span>
                    <div class="flex-grow-1">
                        <p class="eyebrow text-accent mb-2">Collector profile</p>
                        <h1 class="display-5 fw-bold text-white mb-2">{{ profile.first_name }} {{ profile.last_name }}</h1>
                        <p class="text-white-50 mb-0">Member #{{ profile.user_id }} in the Nocturne listening room.</p>
                    </div>
                    <div v-if="isOwnProfile" class="d-flex flex-wrap gap-2">
                        <RouterLink class="btn btn-accent" to="/create"><i class="bi bi-plus-lg me-2"></i>New listing</RouterLink>
                        <RouterLink class="btn btn-outline-light" to="/drafts"><i class="bi bi-archive me-2"></i>Drafts</RouterLink>
                    </div>
                </div>
            </div>
        </section>

        <section class="container py-5">
            <div class="row g-4 mb-5">
                <div class="col-md-4">
                    <div class="stat-card">
                        <span>{{ profile.selling.length }}</span>
                        <small>Open listings</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <span>{{ profile.bidding_on.length }}</span>
                        <small>Active bids</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <span>{{ profile.auctions_ended.length }}</span>
                        <small>Completed auctions</small>
                    </div>
                </div>
            </div>

            <div class="profile-section mb-5">
                <div class="section-heading mb-4">
                    <p class="eyebrow text-accent mb-2">On the block</p>
                    <h2 class="h2 mb-0">{{ isOwnProfile ? 'Your listings' : 'Open listings' }}</h2>
                </div>
                <div v-if="!profile.selling.length" class="empty-state empty-state-small">
                    <i class="bi bi-vinyl" aria-hidden="true"></i>
                    <p class="text-secondary mb-0 mt-3">No open auctions right now.</p>
                </div>
                <div v-else class="row g-4">
                    <div v-for="item in profile.selling" :key="item.item_id" class="col-md-6 col-xl-4">
                        <ItemCard :item="item" />
                    </div>
                </div>
            </div>

            <div class="profile-section mb-5">
                <div class="section-heading mb-4">
                    <p class="eyebrow text-accent mb-2">Chasing a grail</p>
                    <h2 class="h2 mb-0">{{ isOwnProfile ? 'Auctions you are bidding on' : 'Active bids' }}</h2>
                </div>
                <div v-if="!profile.bidding_on.length" class="empty-state empty-state-small">
                    <i class="bi bi-hammer" aria-hidden="true"></i>
                    <p class="text-secondary mb-0 mt-3">No active bids yet.</p>
                </div>
                <div v-else class="row g-4">
                    <div v-for="item in profile.bidding_on" :key="item.item_id" class="col-md-6 col-xl-4">
                        <ItemCard :item="item" />
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="section-heading mb-4">
                    <p class="eyebrow text-accent mb-2">The archive</p>
                    <h2 class="h2 mb-0">Completed auctions</h2>
                </div>
                <div v-if="!profile.auctions_ended.length" class="empty-state empty-state-small">
                    <i class="bi bi-clock-history" aria-hidden="true"></i>
                    <p class="text-secondary mb-0 mt-3">No completed auctions yet.</p>
                </div>
                <div v-else class="row g-4">
                    <div v-for="item in profile.auctions_ended" :key="item.item_id" class="col-md-6 col-xl-4">
                        <ItemCard :item="item" />
                    </div>
                </div>
            </div>
        </section>
    </template>
</template>
