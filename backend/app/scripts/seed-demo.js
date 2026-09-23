const API_URL = (process.env.API_URL || 'http://127.0.0.1:3333').replace(/\/$/, '');

const seller = {
    first_name: 'Maya',
    last_name: 'Turner',
    email: 'maya.demo@nocturne.co.uk',
    password: 'VinylDemo9!'
};

const buyer = {
    first_name: 'Ethan',
    last_name: 'Brooks',
    email: 'ethan.demo@nocturne.co.uk',
    password: 'VinylDemo8!'
};

const items = [
    {
        name: 'Miles Davis - Kind of Blue, 1959 mono pressing',
        description: 'A clean six-eye Columbia mono pressing with deep, warm sound. Sleeve shows light shelf wear; vinyl has been play-tested throughout.',
        starting_bid: 185,
        days: 6,
        categories: ['Vinyl Records', 'Collectibles'],
        bid: 210
    },
    {
        name: 'Fleetwood Mac - Rumours, 1977 US pressing',
        description: 'Classic Warner Bros. pressing with the original inner sleeve. Both record and jacket remain in excellent condition.',
        starting_bid: 48,
        days: 4,
        categories: ['Vinyl Records'],
        bid: 61
    },
    {
        name: 'The Beatles - Abbey Road, 1969 Apple pressing',
        description: 'Original UK-style Apple label pressing. Strong gloss, clean labels and no jumps or skips during play.',
        starting_bid: 120,
        days: 8,
        categories: ['Vinyl Records', 'Collectibles'],
        bid: 145
    },
    {
        name: 'Pink Floyd - The Dark Side of the Moon, Harvest pressing',
        description: 'Complete copy with both posters and stickers. The iconic gatefold sleeve is crisp with only minor corner wear.',
        starting_bid: 160,
        days: 7,
        categories: ['Vinyl Records', 'Box Sets'],
        bid: 190
    },
    {
        name: 'Joni Mitchell - Blue, early UK pressing',
        description: 'A beautifully preserved copy of Joni Mitchell at her finest. Includes the original textured inner sleeve.',
        starting_bid: 58,
        days: 5,
        categories: ['Vinyl Records'],
        bid: 72
    },
    {
        name: 'Pro-Ject Debut Carbon EVO turntable',
        description: 'Barely used turntable in satin black with the factory Ortofon cartridge, dust cover and all original packaging.',
        starting_bid: 295,
        days: 9,
        categories: ['Turntables', 'Audio Equipment'],
        bid: 325
    },
    {
        name: 'Ortofon 2M Blue replacement stylus',
        description: 'New-old-stock stylus in an unopened original box. Suitable for the 2M Blue cartridge and compatible bodies.',
        starting_bid: 95,
        days: 3,
        categories: ['Audio Equipment', 'Accessories'],
        bid: null
    },
    {
        name: 'Blue Note collector box set and liner notes',
        description: 'A handsome collector box containing three jazz reissues plus the original illustrated liner-note booklet.',
        starting_bid: 135,
        days: 10,
        categories: ['Box Sets', 'Collectibles', 'Vinyl Records'],
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
    const questionText = 'Could you confirm how the record plays from start to finish?';
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
            answer_text: 'Yes, it has been played through and there are no jumps, repeats or distracting surface issues.'
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

    console.log('Nocturne Vinyl demo data is ready.');
    console.log(`Seller: ${seller.email} / ${seller.password}`);
    console.log(`Bidder: ${buyer.email} / ${buyer.password}`);
};

seed().catch((error) => {
    console.error(`Unable to seed demo data: ${error.message}`);
    console.error('Start the backend with "npm run dev" before running "npm run seed".');
    process.exitCode = 1;
});
