<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { apiErrorMessage } from '../services/api';

const auth = useAuthStore();
const toast = useToastStore();
const router = useRouter();
const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
});
const loading = ref(false);
const error = ref('');

const passwordHint = '8-32 characters with upper case, lower case, a number and a special character.';
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const validate = () => {
    if (!form.first_name) return 'Enter your first name.';
    if (!form.last_name) return 'Enter your last name.';
    if (!form.email) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8 || form.password.length > 32) return 'Password must be between 8 and 32 characters.';
    if (!passwordPattern.test(form.password)) return passwordHint;
    if (form.password !== form.confirm_password) return 'Passwords do not match.';
    return '';
};

const submit = async () => {
    error.value = validate();
    if (error.value) return;

    loading.value = true;
    try {
        await auth.register({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            password: form.password
        });
        await auth.login({ email: form.email, password: form.password });
        toast.push('Your Auctionary account is ready.', 'success');
        router.push('/');
    } catch (err) {
        error.value = apiErrorMessage(err, 'Unable to create your account.');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <section class="auth-page">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-7 col-xl-6">
                    <div class="auth-card">
                        <div class="text-center mb-4">
                            <span class="auth-icon"><i class="bi bi-person-plus" aria-hidden="true"></i></span>
                            <p class="eyebrow text-accent mt-3 mb-2">Join the club</p>
                            <h1 class="h2">Create your account</h1>
                            <p class="text-secondary">One account to buy, sell and keep track of every auction.</p>
                        </div>

                        <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

                        <form novalidate @submit.prevent="submit">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label" for="first-name">First name</label>
                                    <input id="first-name" v-model.trim="form.first_name" class="form-control" autocomplete="given-name" required />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label" for="last-name">Last name</label>
                                    <input id="last-name" v-model.trim="form.last_name" class="form-control" autocomplete="family-name" required />
                                </div>
                                <div class="col-12">
                                    <label class="form-label" for="register-email">Email address</label>
                                    <input id="register-email" v-model.trim="form.email" class="form-control" type="email" autocomplete="email" required />
                                </div>
                                <div class="col-12">
                                    <label class="form-label" for="register-password">Password</label>
                                    <input id="register-password" v-model="form.password" class="form-control" type="password" autocomplete="new-password" minlength="8" maxlength="32" aria-describedby="password-hint" required />
                                    <div id="password-hint" class="form-text">{{ passwordHint }}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label" for="confirm-password">Confirm password</label>
                                    <input id="confirm-password" v-model="form.confirm_password" class="form-control" type="password" autocomplete="new-password" required />
                                </div>
                            </div>
                            <button class="btn btn-dark btn-lg w-100 mt-4" type="submit" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                {{ loading ? 'Creating account...' : 'Create account' }}
                            </button>
                        </form>

                        <p class="text-center text-secondary mt-4 mb-0">
                            Already a member? <RouterLink to="/login">Log in</RouterLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
