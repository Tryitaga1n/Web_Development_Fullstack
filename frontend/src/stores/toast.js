import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', () => {
    const messages = ref([]);
    let nextId = 1;

    const remove = (id) => {
        messages.value = messages.value.filter((message) => message.id !== id);
    };

    const push = (text, type = 'success', duration = 4200) => {
        const id = nextId++;
        messages.value.push({ id, text, type });
        window.setTimeout(() => remove(id), duration);
    };

    return { messages, push, remove };
});
