const STOP_WORDS = new Set([
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'e', 'ed', 'o', 'ma', 'se', 'che', 'non', 'è', 'ha', 'sono', 'hanno',
    'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
    'del', 'dello', 'della', 'dei', 'degli', 'delle',
    'al', 'allo', 'alla', 'ai', 'agli', 'alle',
    'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
    'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
    'come', 'più', 'cui', 'chi', 'già', 'vi', 'ci', 'si', 'mi', 'ti', 'lo', 'li', 'c'
]);

function maskText(originalText, guessedWords = []) {
    const normalizedGuesses = guessedWords.map(w => w.toLowerCase());

    const wordRegex = /[a-zA-ZàèéìòùÀÈÉÌÒÙ0-9]+/g;

    return originalText.replace(wordRegex, (match) => {
        const lowerMatch = match.toLowerCase();

        if (!isNaN(match)) {
            return match;
        }

        if (STOP_WORDS.has(lowerMatch) || normalizedGuesses.includes(lowerMatch)) {
            return match;
        }

        return '█'.repeat(match.length);
    });
}

module.exports = {
    maskText
};