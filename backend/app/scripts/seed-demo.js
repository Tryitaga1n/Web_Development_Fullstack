const API_URL = (process.env.API_URL || 'http://127.0.0.1:3333').replace(/\/$/, '');

const seller = {
    first_name: 'Maya',
    last_name: 'Turner',
    email: 'maya.demo@auctionary.co.uk',
    password: 'AuctionDemo9!'
};

const buyer = {
    first_name: 'Ethan',
    last_name: 'Brooks',
    email: 'ethan.demo@auctionary.co.uk',
    password: 'AuctionDemo8!'
};

const items = [
    {
        name: 'Canon AE-1 35mm camera kit',
        description: 'Working film camera with a 50mm lens, strap, protective case and a freshly installed battery.',
        starting_bid: 120,
        days: 6,
        categories: ['Cameras & Audio', 'Electronics'],
        bid: 145
    },
    {
        name: 'Keychron Q1 mechanical keyboard',
        description: 'Solid aluminium keyboard with tactile switches, detachable cable and original packaging.',
        starting_bid: 80,
        days: 4,
        categories: ['Electronics'],
        bid: 96
    },
    {
        name: 'Mid-century oak coffee table',
        description: 'Well-kept solid oak table with tapered legs and a useful lower shelf. Minor surface marks are shown in the photos.',
        starting_bid: 150,
        days: 8,
        categories: ['Home & Living'],
        bid: 180
    },
    {
        name: 'Leather weekender travel bag',
        description: 'Full-grain leather holdall with cotton lining, detachable shoulder strap and brass hardware.',
        starting_bid: 65,
        days: 5,
        categories: ['Fashion & Accessories'],
        bid: 74
    },
    {
        name: 'Specialized Allez road bike, 54cm',
        description: 'Lightweight aluminium road bike with 18 gears, recently serviced brakes and new bar tape.',
        starting_bid: 390,
        days: 9,
        categories: ['Sports & Outdoors'],
        bid: 420
    },
    {
        name: 'Vintage Seiko automatic watch',
        description: 'Serviced automatic watch with a clean dial, stainless-steel case and new leather strap.',
        starting_bid: 210,
        days: 7,
        categories: ['Fashion & Accessories', 'Collectibles'],
        bid: null
    },
    {
        name: 'Pair of KEF bookshelf speakers',
        description: 'Compact passive speakers in excellent working order, supplied with removable grilles and speaker cable.',
        starting_bid: 180,
        days: 3,
        categories: ['Cameras & Audio', 'Electronics'],
        bid: null
    },
    {
        name: 'Complete LEGO botanical display set',
        description: 'Complete display model with all pieces, printed instructions and original box.',
        starting_bid: 85,
        days: 10,
        categories: ['Collectibles', 'Home & Living'],
        bid: null
    }
];

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        }
    });
    const text = await response.text();
    let body = null;

    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        body = text;
    }

    if (!response.ok) {
        const error = new Error(body?.error_message || `Request failed with ${response.status}`);
        error.status = response.status;
        error.body = body;
        throw error;
    }

    return body;
};

const ensureAccount = async (account) => {
    try {
        await request('/users', {
            method: 'POST',
            body: JSON.stringify(account)
        });
    } catch (error) {
        if (error.status !== 400 || !String(error.body?.error_message).includes('already exists')) {
            throw error;
        }
    }

    return request('/login', {
        method: 'POST',
        body: JSON.stringify({ email: account.email, password: account.password })
    });
};

const authHeaders = (session) => ({ 'X-Authorization': session.session_token });

const findItem = async (name) => {
    const results = await request(`/search?q=${encodeURIComponent(name)}&limit=100`);
    return results.find((item) => item.name === name) || null;
};

const ensureItem = async (session, categoryLookup, item) => {
    const existing = await findItem(item.name);
    if (existing) return existing.item_id;

    const created = await request('/item', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify({
            name: item.name,
            description: item.description,
            starting_bid: item.starting_bid,
            end_date: Date.now() + item.days * 86400000,
            category_ids: item.categories.map((name) => categoryLookup.get(name)).filter(Boolean)
        })
    });

    return created.item_id;
};

const ensureBid = async (session, itemId, amount) => {
    if (!amount) return;

    const item = await request(`/item/${itemId}`);
    if (amount <= item.current_bid) return;

    try {
        await request(`/item/${itemId}/bid`, {
            method: 'POST',
            headers: authHeaders(session),
            body: JSON.stringify({ amount })
        });
    } catch (error) {
        if (error.status !== 400 || !String(error.body?.error_message).includes('greater than the current bid')) {
            throw error;
        }
    }
};

const ensureQuestion = async (sellerSession, buyerSession, itemId) => {
    const questionText = 'Could you confirm the condition and any signs of wear?';
    const existing = await request(`/item/${itemId}/question`);
    const match = existing.find((question) => question.question_text === questionText);

    if (match) return;

    await request(`/item/${itemId}/question`, {
        method: 'POST',
        headers: authHeaders(buyerSession),
        body: JSON.stringify({ question_text: questionText })
    });

    const updatedQuestions = await request(`/item/${itemId}/question`);
    const createdQuestion = updatedQuestions.find((question) => question.question_text === questionText);

    await request(`/question/${createdQuestion.question_id}`, {
        method: 'POST',
        headers: authHeaders(sellerSession),
        body: JSON.stringify({
            answer_text: 'It is in very good condition for its age. Any visible marks are described in the listing.'
        })
    });
};

const seed = async () => {
    const sellerSession = await ensureAccount(seller);
    const buyerSession = await ensureAccount(buyer);
    const categories = await request('/categories');
    const categoryLookup = new Map(categories.map((category) => [category.name, category.category_id]));

    for (const item of items) {
        const itemId = await ensureItem(sellerSession, categoryLookup, item);
        await ensureBid(buyerSession, itemId, item.bid);
    }

    const firstItem = await findItem(items[0].name);
    if (firstItem) await ensureQuestion(sellerSession, buyerSession, firstItem.item_id);

    console.log('Auctionary demo data is ready.');
    console.log(`Seller: ${seller.email} / ${seller.password}`);
    console.log(`Bidder: ${buyer.email} / ${buyer.password}`);
};

seed().catch((error) => {
    console.error(`Unable to seed demo data: ${error.message}`);
    console.error('Start the backend with "npm run dev" before running "npm run seed".');
    process.exitCode = 1;
});
