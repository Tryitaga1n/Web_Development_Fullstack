<script setup>
import { useToastStore } from '../stores/toast';

const toast = useToastStore();
</script>

<template>
    <div class="toast-host" aria-live="polite" aria-atomic="true">
        <div
            v-for="message in toast.messages"
            :key="message.id"
            class="app-toast shadow-sm"
            :class="`app-toast--${message.type}`"
            role="status"
        >
            <i class="bi" :class="{
                'bi-check-circle-fill': message.type === 'success',
                'bi-info-circle-fill': message.type === 'info',
                'bi-exclamation-triangle-fill': message.type === 'error'
            }" aria-hidden="true"></i>
            <span>{{ message.text }}</span>
            <button type="button" class="btn-close btn-close-white ms-auto" aria-label="Close" @click="toast.remove(message.id)"></button>
        </div>
    </div>
</template>
