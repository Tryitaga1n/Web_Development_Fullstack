<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { apiErrorMessage } from '../services/api';
import { useToastStore } from '../stores/toast';
import { deleteDraft, getDraft, saveDraft } from '../utils/drafts';
import { toDateTimeLocal } from '../utils/format';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const defaultEnd = () => Date.now() + 7 * 86400000;
const form = reactive({
    name: '',
    description: '',
    starting_bid: '',
    end_date: toDateTimeLocal(defaultEnd()),
    category_ids: []
});
const categories = ref([]);
const loadingCategories = ref(true);
const publishing = ref(false);
const error = ref('');
const draftId = ref(String(route.query.draft || ''));
const savedAt = ref('');

const isEditingDraft = computed(() => Boolean(draftId.value));
const endDatePreview = computed(() => {
    const value = new Date(form.end_date).getTime();
    return Number.isFinite(value) ? value : 0;
});

const loadDraft = () => {
    if (!draftId.value) return;
    const draft = getDraft(draftId.value);
    if (!draft) {
        toast.push('That draft could not be found.', 'error');
        router.replace('/create');
        return;
    }
    Object.assign(form, {
        name: draft.name || '',
        description: draft.description || '',
        starting_bid: draft.starting_bid ?? '',
        end_date: draft.end_date || toDateTimeLocal(defaultEnd()),
        category_ids: draft.category_ids || []
    });
    savedAt.value = draft.updatedAt || '';
};

const payload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    starting_bid: Number(form.starting_bid),
    end_date: new Date(form.end_date).getTime(),
    category_ids: form.category_ids.map(Number)
});

const saveCurrentDraft = (quiet = false) => {
    const saved = saveDraft({
        id: draftId.value || undefined,
        ...payload(),
        end_date: form.end_date
    });
    draftId.value = saved.id;
    savedAt.value = saved.updatedAt;
    router.replace({ query: { draft: saved.id } });
    if (!quiet) toast.push('Draft saved in this browser.', 'success');
};

const validate = (data) => {
    if (!data.name) return 'Give your auction a title.';
    if (!data.description) return 'Add a description so buyers know what they are bidding on.';
    if (!Number.isInteger(data.starting_bid) || data.starting_bid < 1) return 'Starting bid must be a positive whole number.';
    if (!Number.isFinite(data.end_date) || data.end_date <= Date.now()) return 'Choose a closing date and time in the future.';
    return '';
};

const publish = async () => {
    error.value = '';
    const data = payload();
    const validationMessage = validate(data);
    if (validationMessage) {
        error.value = validationMessage;
        return;
    }

    publishing.value = true;
    try {
        const { data: created } = await api.post('/item', data);
        if (draftId.value) deleteDraft(draftId.value);
        toast.push('Your auction is now live.', 'success');
        router.push(`/item/${created.item_id}`);
    } catch (err) {
        error.value = apiErrorMessage(err, 'Unable to publish this auction.');
    } finally {
        publishing.value = false;
    }
};

onMounted(async () => {
    loadDraft();
    try {
        const { data } = await api.get('/categories');
        categories.value = data;
    } catch {
        categories.value = [];
    } finally {
        loadingCategories.value = false;
    }
});
</script>

<template>
    <section class="page-hero compact-hero">
        <div class="container py-5">
            <div class="row align-items-end g-3">
                <div class="col-lg-8">
                    <p class="eyebrow text-accent mb-2">Seller studio</p>
                    <h1 class="display-5 fw-bold text-white mb-2">{{ isEditingDraft ? 'Edit your draft' : 'List a new lot' }}</h1>
                    <p class="text-white-50 mb-0">Write the story, set the opening bid and choose when the needle drops.</p>
                </div>
                <div class="col-lg-4 text-lg-end">
                    <RouterLink class="btn btn-outline-light" to="/drafts"><i class="bi bi-archive me-2"></i>View saved drafts</RouterLink>
                </div>
            </div>
        </div>
    </section>

    <section class="container py-5">
        <div class="row g-5">
            <div class="col-lg-8">
                <form class="listing-form" @submit.prevent="publish">
                    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
                    <div v-if="savedAt" class="alert alert-success d-flex justify-content-between align-items-center" role="status">
                        <span><i class="bi bi-check-circle me-2"></i>Draft saved locally.</span>
                        <span class="small">{{ new Date(savedAt).toLocaleString() }}</span>
                    </div>

                    <div class="form-section">
                        <span class="step-number">01</span>
                        <div class="flex-grow-1">
                            <h2 class="h4 mb-1">The essential details</h2>
                            <p class="text-secondary mb-4">Keep the title specific and the description honest.</p>
                            <div class="mb-3">
                                <label class="form-label" for="item-name">Auction title</label>
                                <input id="item-name" v-model="form.name" class="form-control form-control-lg" maxlength="120" placeholder="e.g. Fleetwood Mac - Rumours, 1977 first pressing" />
                            </div>
                            <div>
                                <label class="form-label" for="item-description">Description</label>
                                <textarea id="item-description" v-model="form.description" class="form-control" rows="6" maxlength="2000" placeholder="Condition, pressing details, sleeve notes, included extras..."></textarea>
                                <div class="form-text text-end">{{ form.description.length }}/2000</div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <span class="step-number">02</span>
                        <div class="flex-grow-1">
                            <h2 class="h4 mb-1">Bid and deadline</h2>
                            <p class="text-secondary mb-4">Set a fair starting point and allow enough time for collectors to find it.</p>
                            <div class="row g-4">
                                <div class="col-md-5">
                                    <label class="form-label" for="starting-bid">Starting bid (GBP)</label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text">£</span>
                                        <input id="starting-bid" v-model.number="form.starting_bid" class="form-control" type="number" min="1" step="1" inputmode="numeric" />
                                    </div>
                                </div>
                                <div class="col-md-7">
                                    <label class="form-label" for="end-date">Closing date and time</label>
                                    <input id="end-date" v-model="form.end_date" class="form-control form-control-lg" type="datetime-local" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <span class="step-number">03</span>
                        <div class="flex-grow-1">
                            <h2 class="h4 mb-1">Browse categories</h2>
                            <p class="text-secondary mb-4">Choose up to six categories to help the right collectors find your lot.</p>
                            <div v-if="loadingCategories" class="text-secondary">Loading categories...</div>
                            <div v-else class="category-grid">
                                <label v-for="category in categories" :key="category.category_id" class="category-choice">
                                    <input v-model="form.category_ids" type="checkbox" :value="category.category_id" />
                                    <span>{{ category.name }}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-end pt-4 border-top">
                        <button class="btn btn-outline-dark btn-lg" type="button" @click="saveCurrentDraft()">
                            <i class="bi bi-save me-2"></i>{{ isEditingDraft ? 'Save changes' : 'Save as draft' }}
                        </button>
                        <button class="btn btn-accent btn-lg" type="submit" :disabled="publishing">
                            <span v-if="publishing" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                            {{ publishing ? 'Publishing...' : 'Publish auction' }}
                        </button>
                    </div>
                </form>
            </div>

            <aside class="col-lg-4">
                <div class="preview-card sticky-lg-top">
                    <p class="eyebrow text-accent mb-2">Live preview</p>
                    <h2 class="h3">{{ form.name || 'Untitled record' }}</h2>
                    <div class="preview-record my-4">
                        <i class="bi bi-vinyl-fill" aria-hidden="true"></i>
                    </div>
                    <p class="text-secondary">{{ form.description || 'Your description will appear here.' }}</p>
                    <div class="d-flex justify-content-between border-top pt-3 mt-4">
                        <span class="text-secondary">Opening bid</span>
                        <strong>{{ form.starting_bid ? `£${form.starting_bid}` : 'Not set' }}</strong>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-3 mt-2">
                        <span class="text-secondary">Closes</span>
                        <strong v-if="endDatePreview">{{ new Date(endDatePreview).toLocaleString() }}</strong>
                        <strong v-else>Not set</strong>
                    </div>
                </div>
            </aside>
        </div>
    </section>
</template>
