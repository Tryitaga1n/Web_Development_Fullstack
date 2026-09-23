<script setup>
import { onMounted, ref } from 'vue';
import { deleteDraft, getDrafts } from '../utils/drafts';
import { useToastStore } from '../stores/toast';
import { formatCurrency } from '../utils/format';

const toast = useToastStore();
const drafts = ref([]);

const load = () => {
    drafts.value = getDrafts();
};

const remove = (draft) => {
    if (!window.confirm(`Delete the draft "${draft.name || 'Untitled record'}"?`)) return;
    deleteDraft(draft.id);
    load();
    toast.push('Draft deleted.', 'info');
};

onMounted(load);
</script>

<template>
    <section class="page-hero compact-hero">
        <div class="container py-5">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                <div>
                    <p class="eyebrow text-accent mb-2">Local workspace</p>
                    <h1 class="display-5 fw-bold text-white mb-2">Your saved drafts</h1>
                    <p class="text-white-50 mb-0">These listings live only in this browser until you publish them.</p>
                </div>
                <RouterLink class="btn btn-accent" to="/create"><i class="bi bi-plus-lg me-2"></i>New draft</RouterLink>
            </div>
        </div>
    </section>

    <section class="container py-5">
        <div v-if="!drafts.length" class="empty-state">
            <i class="bi bi-archive" aria-hidden="true"></i>
            <h2 class="h3 mt-3">No drafts waiting</h2>
            <p class="text-secondary">Start a listing and save it before it is ready for the auction floor.</p>
            <RouterLink class="btn btn-dark" to="/create">Create a listing</RouterLink>
        </div>

        <div v-else class="row g-4">
            <div v-for="draft in drafts" :key="draft.id" class="col-lg-6">
                <article class="draft-card h-100">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <span class="badge text-bg-light mb-3">Draft</span>
                            <h2 class="h4">{{ draft.name || 'Untitled record' }}</h2>
                        </div>
                        <span class="text-secondary small">Updated {{ new Date(draft.updatedAt).toLocaleDateString() }}</span>
                    </div>
                    <p class="text-secondary line-clamp-3">{{ draft.description || 'No description added yet.' }}</p>
                    <div class="d-flex flex-wrap gap-4 my-4">
                        <div>
                            <div class="small text-secondary">Starting bid</div>
                            <strong>{{ draft.starting_bid ? formatCurrency(draft.starting_bid) : 'Not set' }}</strong>
                        </div>
                        <div>
                            <div class="small text-secondary">Closing</div>
                            <strong>{{ draft.end_date ? new Date(draft.end_date).toLocaleString() : 'Not set' }}</strong>
                        </div>
                    </div>
                    <div class="d-flex gap-2 mt-auto">
                        <RouterLink class="btn btn-dark" :to="{ name: 'create-item', query: { draft: draft.id } }"><i class="bi bi-pencil me-1"></i>Edit</RouterLink>
                        <button class="btn btn-outline-danger" type="button" @click="remove(draft)"><i class="bi bi-trash3 me-1"></i>Delete</button>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
