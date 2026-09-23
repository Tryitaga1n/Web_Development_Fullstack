const blockedTerms = [
    'arsehole',
    'asshole',
    'bastard',
    'bitch',
    'bullshit',
    'cunt',
    'dickhead',
    'fuck',
    'motherfucker',
    'piss off',
    'shit',
    'slut',
    'whore'
];

const normalise = (text) => String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const containsProfanity = (...values) => {
    const text = normalise(values.join(' '));
    return blockedTerms.some((term) => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(?:^|\\s)${escaped}(?:$|\\s)`).test(text);
    });
};

module.exports = { containsProfanity };
