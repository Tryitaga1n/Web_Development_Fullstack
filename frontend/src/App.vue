<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from './components/NavBar.vue';
import FooterBar from './components/FooterBar.vue';
import ToastHost from './components/ToastHost.vue';
import { useAuthStore } from './stores/auth';
import { useToastStore } from './stores/toast';

const auth = useAuthStore();
const toast = useToastStore();
const route = useRoute();
const router = useRouter();

const handleUnauthorised = () => {
    if (!auth.isAuthenticated) return;
    auth.clear();
    toast.push('Your session has expired. Please log in again.', 'info');
    if (route.meta.requiresAuth) {
        router.push({ name: 'login', query: { redirect: route.fullPath } });
    }
};

onMounted(() => window.addEventListener('auctionary:unauthorised', handleUnauthorised));
onUnmounted(() => window.removeEventListener('auctionary:unauthorised', handleUnauthorised));
</script>

<template>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <NavBar />
    <main id="main-content" tabindex="-1">
        <RouterView />
    </main>
    <FooterBar />
    <ToastHost />
</template>
