<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { apiErrorMessage } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { formatCurrency, formatDate, timeRemaining } from '../utils/format';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const item = ref(null);
const bids = ref([]);
const questions = ref([]);
const loading = ref(true);
const error = ref('');
const bidAmount = ref('');
const bidError = ref('');
const bidLoading = ref(false);
const questionText = ref('');
const questionError = ref('');
const questionLoading = ref(false);
const answerDrafts = reactive({});
const answerErrors = reactive({});
const answering = reactive({});

const isSeller = computed(() => auth.user?.user_id === item.value?.creator_id);
const auctionOpen = computed(() => Number(item.value?.end_date) > Date.now());
const canBid = computed(() => auth.isAuthenticated && !isSeller.value && auctionOpen.value);
const minimumBid = computed(() => Number(item.value?.current_bid || item.value?.starting_bid || 0) + 1);

const load = async () => {
    loading.value = true;
    error.value = '';
    try {
        const id = route.params.id;
        const [itemResponse, bidResponse, questionResponse] = await Promise.all([
            api.get(`/item/${id}`),
            api.get(`/item/${id}/bid`),
            api.get(`/item/${id}/question`)
        ]);
        item.value = itemResponse.data;
        bids.value = bidResponse.data;
        questions.value = questionResponse.data;
        bidAmount.value = String(Number(item.value.current_bid) + 1);
    } catch (err) {
        item.value = null;
        error.value = apiErrorMessage(err, 'Unable to load this auction.');
    } finally {
        loading.value = false;
    }
};

const requireLogin = () => {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
};

const placeBid = async () => {
    bidError.value = '';
    const amount = Number(bidAmount.value);
    if (!Number.isInteger(amount) || amount < minimumBid.value) {
        bidError.value = `Enter a whole number of at least ${formatCurrency(minimumBid.value)}.`;
        return;
    }

    bidLoading.value = true;
    try {
        await api.post(`/item/${item.value.item_id}/bid`, { amount });
        toast.push(`Bid of ${formatCurrency(amount)} placed.`, 'success');
        await load();
    } catch (err) {
        bidError.value = apiErrorMessage(err, 'Unable to place this bid.');
    } finally {
        bidLoading.value = false;
    }
};

const askQuestion = async () => {
    questionError.value = '';
    if (!questionText.value.trim()) {
        questionError.value = 'Write a question before submitting.';
        return;
    }

    questionLoading.value = true;
    try {
        await api.post(`/item/${item.value.item_id}/question`, { question_text: questionText.value.trim() });
        questionText.value = '';
        toast.push('Your question has been sent to the seller.', 'success');
        const { data } = await api.get(`/item/${item.value.item_id}/question`);
        questions.value = data;
    } catch (err) {
        questionError.value = apiErrorMessage(err, 'Unable to send your question.');
    } finally {
        questionLoading.value = false;
    }
};

const answerQuestion = async (questionId) => {
    answerErrors[questionId] = '';
    const answer = String(answerDrafts[questionId] || '').trim();
    if (!answer) {
        answerErrors[questionId] = 'Write an answer before submitting.';
        return;
    }

    answering[questionId] = true;
    try {
        await api.post(`/question/${questionId}`, { answer_text: answer });
        answerDrafts[questionId] = '';
        toast.push('Answer published.', 'success');
        const { data } = await api.get(`/item/${item.value.item_id}/question`);
        questions.value = data;
    } catch (err) {
        answerErrors[questionId] = apiErrorMessage(err, 'Unable to publish this answer.');
    } finally {
        answering[questionId] = false;
    }
};

onMounted(load);
</script>

<template>
    <div v-if="loading" class="container py-5 text-center">
        <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading</span></div>
        <p class="text-secondary mt-3">Opening the sleeve...</p>
    </div>

    <section v-else-if="error" class="container py-5">
        <div class="empty-state">
            <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
            <h1 class="h3 mt-3">Auction unavailable</h1>
            <p class="text-secondary">{{ error }}</p>
            <RouterLink class="btn btn-dark" to="/search">Back to auctions</RouterLink>
        </div>
    </section>

    <template v-else-if="item">
        <section class="item-detail-hero">
            <div class="container py-4 py-lg-5">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-4">
                        <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
                        <li class="breadcrumb-item"><RouterLink to="/search">Auctions</RouterLink></li>
                        <li class="breadcrumb-item active" aria-current="page">{{ item.name }}</li>
                    </ol>
                </nav>

                <div class="row g-5 align-items-center">
                    <div class="col-lg-6">
                        <div class="record-detail-visual" :class="`record-palette-${Number(item.item_id) % 5}`">
                            <div class="record-sleeve">
                                <span class="sleeve-kicker">NOCTURNE SELECTS</span>
                                <i class="bi bi-vinyl-fill" aria-hidden="true"></i>
                                <span class="sleeve-lot">LOT {{ String(item.item_id).padStart(3, '0') }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <span v-for="category in item.categories" :key="category.category_id" class="badge text-bg-light">{{ category.name }}</span>
                        </div>
                        <p class="eyebrow text-accent mb-2">Lot #{{ item.item_id }}</p>
                        <h1 class="display-5 fw-bold mb-3">{{ item.name }}</h1>
                        <p class="lead text-secondary">{{ item.description }}</p>

                        <div class="bid-overview my-4">
                            <div>
                                <div class="small text-uppercase tracking-wide text-secondary">Current bid</div>
                                <div class="display-5 fw-bold">{{ formatCurrency(item.current_bid) }}</div>
                                <div v-if="item.current_bid_holder" class="small text-secondary">
                                    Leading: {{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }}
                                </div>
                                <div v-else class="small text-secondary">No bids yet - opening bid {{ formatCurrency(item.starting_bid) }}</div>
                            </div>
                            <div class="text-lg-end">
                                <div class="small text-uppercase tracking-wide text-secondary">Auction ends</div>
                                <div class="h5 mb-1">{{ formatDate(item.end_date) }}</div>
                                <div class="badge text-bg-warning">{{ timeRemaining(item.end_date) }}</div>
                            </div>
                        </div>

                        <div class="seller-line d-flex align-items-center gap-3">
                            <span class="avatar-circle">{{ item.first_name.charAt(0) }}{{ item.last_name.charAt(0) }}</span>
                            <div>
                                <div class="small text-secondary">Listed by</div>
                                <RouterLink class="fw-semibold text-dark" :to="`/users/${item.creator_id}`">{{ item.first_name }} {{ item.last_name }}</RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="container py-5">
            <div class="row g-5">
                <div class="col-lg-5">
                    <div class="action-panel">
                        <h2 class="h3 mb-3">Place a bid</h2>

                        <div v-if="isSeller" class="alert alert-info mb-0" role="status">
                            You listed this item, so you cannot bid on your own auction.
                        </div>
                        <div v-else-if="!auctionOpen" class="alert alert-warning mb-0" role="status">
                            This auction has closed.
                        </div>
                        <div v-else-if="!auth.isAuthenticated" class="text-center">
                            <p class="text-secondary">Log in to join the bidding.</p>
                            <button class="btn btn-dark btn-lg w-100" type="button" @click="requireLogin">Log in to bid</button>
                        </div>
                        <form v-else @submit.prevent="placeBid">
                            <div v-if="bidError" class="alert alert-danger" role="alert">{{ bidError }}</div>
                            <label class="form-label" for="bid-amount">Your bid (GBP)</label>
                            <div class="input-group input-group-lg mb-3">
                                <span class="input-group-text">£</span>
                                <input id="bid-amount" v-model.number="bidAmount" class="form-control" type="number" min="1" step="1" inputmode="numeric" required />
                            </div>
                            <p class="small text-secondary">Minimum next bid: <strong>{{ formatCurrency(minimumBid) }}</strong></p>
                            <button class="btn btn-accent btn-lg w-100" type="submit" :disabled="bidLoading">
                                <span v-if="bidLoading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                {{ bidLoading ? 'Placing bid...' : 'Place bid' }}
                            </button>
                        </form>
                    </div>

                    <div class="action-panel mt-4">
                        <h2 class="h4 mb-3">Bid history</h2>
                        <div v-if="!bids.length" class="text-secondary">No bids have been placed yet.</div>
                        <ol v-else class="bid-list list-unstyled mb-0">
                            <li v-for="bid in bids" :key="`${bid.user_id}-${bid.amount}-${bid.timestamp}`">
                                <div>
                                    <strong>{{ bid.first_name }} {{ bid.last_name }}</strong>
                                    <div class="small text-secondary">{{ formatDate(bid.timestamp) }}</div>
                                </div>
                                <span class="fw-bold">{{ formatCurrency(bid.amount) }}</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div class="col-lg-7">
                    <div class="questions-header d-flex justify-content-between align-items-end gap-3 mb-4">
                        <div>
                            <p class="eyebrow text-accent mb-2">Before you bid</p>
                            <h2 class="h2 mb-0">Questions & answers</h2>
                        </div>
                        <span class="badge rounded-pill text-bg-light">{{ questions.length }}</span>
                    </div>

                    <div v-if="auth.isAuthenticated && !isSeller && auctionOpen" class="question-composer mb-4">
                        <div v-if="questionError" class="alert alert-danger" role="alert">{{ questionError }}</div>
                        <label class="form-label" for="new-question">Ask the seller a question</label>
                        <textarea id="new-question" v-model="questionText" class="form-control" rows="3" maxlength="1000" placeholder="Is the sleeve included? How does the record play?"></textarea>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="small text-secondary">{{ questionText.length }}/1000</span>
                            <button class="btn btn-dark" type="button" :disabled="questionLoading" @click="askQuestion">
                                {{ questionLoading ? 'Sending...' : 'Send question' }}
                            </button>
                        </div>
                    </div>

                    <button v-else-if="!auth.isAuthenticated && auctionOpen" class="btn btn-outline-dark mb-4" type="button" @click="requireLogin">
                        Log in to ask a question
                    </button>

                    <div v-if="!questions.length" class="empty-state empty-state-small">
                        <i class="bi bi-chat-square-text" aria-hidden="true"></i>
                        <h3 class="h5 mt-3">No questions yet</h3>
                        <p class="text-secondary mb-0">Be the first to ask about this lot.</p>
                    </div>

                    <div v-else class="question-list">
                        <article v-for="question in questions" :key="question.question_id" class="question-card">
                            <div class="question-row">
                                <span class="question-icon" aria-hidden="true">Q</span>
                                <p class="mb-0">{{ question.question_text }}</p>
                            </div>
                            <div v-if="question.answer_text" class="answer-row">
                                <span class="answer-icon" aria-hidden="true">A</span>
                                <p class="mb-0">{{ question.answer_text }}</p>
                            </div>
                            <form v-else-if="isSeller" class="answer-form mt-3" @submit.prevent="answerQuestion(question.question_id)">
                                <div v-if="answerErrors[question.question_id]" class="alert alert-danger py-2" role="alert">{{ answerErrors[question.question_id] }}</div>
                                <label class="form-label" :for="`answer-${question.question_id}`">Answer as seller</label>
                                <textarea
                                    :id="`answer-${question.question_id}`"
                                    v-model="answerDrafts[question.question_id]"
                                    class="form-control"
                                    rows="2"
                                    maxlength="2000"
                                ></textarea>
                                <button class="btn btn-sm btn-dark mt-2" type="submit" :disabled="answering[question.question_id]">
                                    {{ answering[question.question_id] ? 'Publishing...' : 'Publish answer' }}
                                </button>
                            </form>
                            <p v-else class="small text-secondary mb-0 mt-3">Awaiting seller response.</p>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    </template>
</template>
