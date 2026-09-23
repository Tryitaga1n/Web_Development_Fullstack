import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import api, { TOKEN_KEY } from '../services/api';

const USER_KEY = 'auctionary_user';

const readStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
};

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem(TOKEN_KEY) || '');
    const user = ref(readStoredUser());

    const isAuthenticated = computed(() => Boolean(token.value && user.value));

    const persist = () => {
        if (token.value) localStorage.setItem(TOKEN_KEY, token.value);
        else localStorage.removeItem(TOKEN_KEY);

        if (user.value) localStorage.setItem(USER_KEY, JSON.stringify(user.value));
        else localStorage.removeItem(USER_KEY);
    };

    const setSession = (session) => {
        token.value = session.session_token;
        user.value = {
            user_id: session.user_id,
            first_name: session.first_name || user.value?.first_name || '',
            last_name: session.last_name || user.value?.last_name || ''
        };
        persist();
    };

    const login = async (credentials) => {
        const { data } = await api.post('/login', credentials);
        const { data: profile } = await api.get(`/users/${data.user_id}`);
        const session = {
            ...data,
            first_name: profile.first_name,
            last_name: profile.last_name
        };
        setSession(session);
        return session;
    };

    const register = (payload) => api.post('/users', payload).then((response) => response.data);

    const logout = async () => {
        try {
            if (token.value) await api.post('/logout');
        } catch {
            // Local cleanup must still happen if the session has already expired.
        } finally {
            token.value = '';
            user.value = null;
            persist();
        }
    };

    const clear = () => {
        token.value = '';
        user.value = null;
        persist();
    };

    return {
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        clear,
        setSession
    };
});
