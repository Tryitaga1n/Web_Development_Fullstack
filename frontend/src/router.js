import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

const routes = [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/search', name: 'search', component: () => import('./views/SearchView.vue') },
    { path: '/item/:id', name: 'item-detail', component: () => import('./views/ItemDetailView.vue') },
    { path: '/create', name: 'create-item', component: () => import('./views/CreateItemView.vue'), meta: { requiresAuth: true } },
    { path: '/drafts', name: 'drafts', component: () => import('./views/DraftsView.vue'), meta: { requiresAuth: true } },
    { path: '/users/:id', name: 'profile', component: () => import('./views/ProfileView.vue') },
    { path: '/login', name: 'login', component: () => import('./views/LoginView.vue'), meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('./views/RegisterView.vue'), meta: { guestOnly: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 })
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
        return { name: 'home' };
    }
    return true;
});

export default router;
