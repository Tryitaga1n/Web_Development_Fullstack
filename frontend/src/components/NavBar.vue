<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { getDrafts } from '../utils/drafts';

const auth = useAuthStore();
const toast = useToastStore();
const route = useRoute();
const router = useRouter();
const open = ref(false);
const draftCount = ref(0);

const displayName = computed(() => auth.user?.first_name || 'Account');
const profileLink = computed(() => auth.user ? `/users/${auth.user.user_id}` : '/login');

const refreshDraftCount = () => {
    draftCount.value = getDrafts().length;
};

const closeMenu = () => {
    open.value = false;
};

const logout = async () => {
    await auth.logout();
    refreshDraftCount();
    closeMenu();
    toast.push('You have been logged out.', 'info');
    router.push('/');
};

onMounted(() => {
    refreshDraftCount();
    window.addEventListener('auctionary:drafts-updated', refreshDraftCount);
});

onUnmounted(() => {
    window.removeEventListener('auctionary:drafts-updated', refreshDraftCount);
});
</script>

<template>
    <header class="site-header sticky-top">
        <nav class="navbar navbar-expand-lg navbar-light container py-3" aria-label="Main navigation">
            <RouterLink class="navbar-brand brand-lockup" to="/" @click="closeMenu">
                <span class="brand-mark" aria-hidden="true"><i class="bi bi-box-seam"></i></span>
                <span>
                    <strong>Auctionary</strong>
                    <small>ONLINE AUCTIONS</small>
                </span>
            </RouterLink>

            <button
                class="navbar-toggler border-0"
                type="button"
                :aria-expanded="open"
                aria-controls="main-navigation"
                aria-label="Toggle navigation"
                @click="open = !open"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <div id="main-navigation" class="collapse navbar-collapse" :class="{ show: open }">
                <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                    <li class="nav-item">
                        <RouterLink class="nav-link" :class="{ active: route.name === 'home' }" to="/" @click="closeMenu">Home</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" :class="{ active: route.name === 'search' }" to="/search" @click="closeMenu">Browse</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" :class="{ active: route.name === 'create-item' }" to="/create" @click="closeMenu">Sell an item</RouterLink>
                    </li>
                    <template v-if="auth.isAuthenticated">
                        <li class="nav-item">
                            <RouterLink class="nav-link position-relative" :class="{ active: route.name === 'drafts' }" to="/drafts" @click="closeMenu">
                                Drafts
                                <span v-if="draftCount" class="badge rounded-pill text-bg-light ms-1">{{ draftCount }}</span>
                            </RouterLink>
                        </li>
                        <li class="nav-item dropdown">
                            <button class="nav-link dropdown-toggle btn btn-link" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-person-circle me-1" aria-hidden="true"></i>{{ displayName }}
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow">
                                <li><RouterLink class="dropdown-item" :to="profileLink" @click="closeMenu">My profile</RouterLink></li>
                                <li><RouterLink class="dropdown-item" to="/create" @click="closeMenu">Create auction</RouterLink></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><button class="dropdown-item text-danger" type="button" @click="logout">Log out</button></li>
                            </ul>
                        </li>
                    </template>
                    <template v-else>
                        <li class="nav-item"><RouterLink class="nav-link" to="/login" @click="closeMenu">Log in</RouterLink></li>
                        <li class="nav-item">
                            <RouterLink class="btn btn-accent ms-lg-2" to="/register" @click="closeMenu">Create account</RouterLink>
                        </li>
                    </template>
                </ul>
            </div>
        </nav>
    </header>
</template>
