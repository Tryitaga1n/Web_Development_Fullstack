const DRAFTS_KEY = 'auctionary_drafts_v1';

const write = (drafts) => {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    window.dispatchEvent(new CustomEvent('auctionary:drafts-updated'));
};

export const getDrafts = () => {
    try {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || [];
        return Array.isArray(drafts) ? drafts : [];
    } catch {
        return [];
    }
};

export const getDraft = (id) => getDrafts().find((draft) => draft.id === id) || null;

export const saveDraft = (draft) => {
    const now = new Date().toISOString();
    const existing = getDrafts();
    const id = draft.id || window.crypto?.randomUUID?.() || `draft-${Date.now()}`;
    const saved = {
        ...draft,
        id,
        createdAt: draft.createdAt || now,
        updatedAt: now
    };

    const index = existing.findIndex((item) => item.id === id);
    if (index >= 0) existing[index] = saved;
    else existing.unshift(saved);

    write(existing);
    return saved;
};

export const deleteDraft = (id) => {
    write(getDrafts().filter((draft) => draft.id !== id));
};
