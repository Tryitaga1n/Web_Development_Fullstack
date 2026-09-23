const blockedTerms = [
    'arsehole',
    'asshole',
    'bastard',
    'bitch',
    'bullshit',
    'cunt',
    'dickhead',
    'fck',
    'fuck',
    'motherfucker',
    'piss off',
    'shit',
    'slut',
    'whore'
];

const normalise = (text) => String(text)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's')
    .replace(/(.)\1+/g, '$1')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const blockedPatterns = blockedTerms
    .map(normalise)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .map((term) => new RegExp(`(?:^|\\s)${term}(?:s|es|ed|ing|er|ers|ty|y)?(?:$|\\s)`, 'i'));

const containsProfanity = (...values) => {
    const text = normalise(values.join(' '));
    return blockedPatterns.some((pattern) => pattern.test(text));
};

module.exports = { containsProfanity };
