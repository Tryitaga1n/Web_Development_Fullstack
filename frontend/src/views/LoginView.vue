<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { apiErrorMessage } from '../services/api';

const auth = useAuthStore();
const toast = useToastStore();
const route = useRoute();
const router = useRouter();
const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');

const validate = () => {
    if (!form.email) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password) return 'Enter your password.';
    return '';
};

const submit = async () => {
    error.value = validate();
    if (error.value) return;

    loading.value = true;
    try {
        await auth.login(form);
        toast.push('Welcome back to Auctionary.', 'success');
        router.push(route.query.redirect || '/');
    } catch (err) {
        error.value = apiErrorMessage(err, 'Unable to log in with those details.');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <section class="auth-page">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-6 col-xl-5">
                    <div class="auth-card">
                        <div class="text-center mb-4">
                            <span class="auth-icon"><i class="bi bi-person-lock" aria-hidden="true"></i></span>
                            <p class="eyebrow text-accent mt-3 mb-2">Member access</p>
                            <h1 class="h2">Welcome back</h1>
                            <p class="text-secondary">Log in to bid, sell and manage your auctions.</p>
                        </div>

                        <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

                        <form novalidate @submit.prevent="submit">
                            <div class="mb-3">
                                <label class="form-label" for="login-email">Email address</label>
                                <input id="login-email" v-model.trim="form.email" class="form-control form-control-lg" type="email" autocomplete="email" required />
                            </div>
                            <div class="mb-4">
                                <label class="form-label" for="login-password">Password</label>
                                <input id="login-password" v-model="form.password" class="form-control form-control-lg" type="password" autocomplete="current-password" required />
                            </div>
                            <button class="btn btn-dark btn-lg w-100" type="submit" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                {{ loading ? 'Logging in...' : 'Log in' }}
                            </button>
                        </form>

                        <p class="text-center text-secondary mt-4 mb-0">
                            New here? <RouterLink to="/register">Create an account</RouterLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
