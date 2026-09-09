const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WIKIPEDIA_API_ENDPOINTS = [
    'https://it.wikipedia.org/w/api.php',
    'https://en.wikipedia.org/w/api.php'
];
const RANDOM_ARTICLE_QUERY = {
    action: 'query',
    list: 'random',
    rnnamespace: 0,
    rnfilterredir: 'nonredirects',
    rnminsize: 500,
    rnmaxsize: 30000,
    rnlimit: 10,
    format: 'json'
};
const RECENT_ARTICLE_TITLES = new Set();
const ARTICLE_CACHE_FILE = path.join(__dirname, 'random-artist-cache.json');
const WIKIBLANK_USER_AGENT = 'WikiBlankApp/1.0 (Educational Project; contact: wikiblank@example.com)';

function readCachedArtist() {
    try {
        const cachedArtists = JSON.parse(fs.readFileSync(ARTICLE_CACHE_FILE, 'utf8'));
        const availableArtists = cachedArtists.filter(artist =>
            artist.title && artist.text && !RECENT_ARTICLE_TITLES.has(artist.title)
        );
        return availableArtists[Math.floor(Math.random() * availableArtists.length)] || null;
    } catch {
        return null;
    }
}

function cacheArtist(artist) {
    let cachedArtists = [];
    try {
        cachedArtists = JSON.parse(fs.readFileSync(ARTICLE_CACHE_FILE, 'utf8'));
    } catch {
        // La cache viene creata al primo risultato valido.
    }

    const updatedCache = [artist, ...cachedArtists.filter(item => item.title !== artist.title)].slice(0, 20);
    fs.writeFileSync(ARTICLE_CACHE_FILE, JSON.stringify(updatedCache), 'utf8');
}

function isMusicalArtistArticle(text) {
    const normalizedText = text.toLowerCase();
    const introduction = normalizedText.substring(0, 700);
    const isArtist = /cantante|musicista|compositore|compositrice|rapper|dj|gruppo musicale|band musicale/.test(introduction);
    const isItalianOrAmerican = /italian[oa]|italian[oi]|statunitense|statunitensi|americano|americana|americani|stati uniti|usa|american|united states/.test(introduction);
    const isMusicRelease = /\b(album|ep|singolo|brano|canzone|discografia)\b/.test(introduction);

    return isArtist && isItalianOrAmerican && !isMusicRelease;
}

function isValidRandomArtistArticleTitle(title) {
    return typeof title === 'string'
        && title.trim().toLowerCase() !== 'vincitori italiani del grammy award';
}

async function fetchRandomWikipediaArtistArticle() {
    for (let attempt = 0; attempt < 8; attempt++) {
        try {
            const randomResult = await fetchRandomWikipediaArticles();

            const pageContents = await fetchPageContents(
                randomResult.pages.map(page => page.title),
                randomResult.apiEndpoint
            );
            const validArtists = pageContents.filter(pageContent =>
                isMusicalArtistArticle(pageContent.text)
                && !RECENT_ARTICLE_TITLES.has(pageContent.title)
            );

            if (validArtists.length > 0) {
                const selectedArtist = validArtists[Math.floor(Math.random() * validArtists.length)];
                RECENT_ARTICLE_TITLES.add(selectedArtist.title);
                if (RECENT_ARTICLE_TITLES.size > 20) {
                    RECENT_ARTICLE_TITLES.delete(RECENT_ARTICLE_TITLES.values().next().value);
                }
                cacheArtist(selectedArtist);
                return selectedArtist;
            }
        } catch (error) {
            console.error('Tentativo di selezione casuale fallito:', error.message);
            if (error.response?.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    const cachedArtist = readCachedArtist();
    if (cachedArtist) {
        RECENT_ARTICLE_TITLES.add(cachedArtist.title);
        return cachedArtist;
    }

    const storedArtist = await readStoredArtistArticle();
    if (storedArtist) {
        RECENT_ARTICLE_TITLES.add(storedArtist.title);
        cacheArtist(storedArtist);
        return storedArtist;
    }

    throw new Error('Impossibile recuperare un artista musicale casuale da Wikipedia.');
}

async function readStoredArtistArticle() {
    try {
        const { Match } = require('../models');
        const storedMatches = await Match.findAll({
            attributes: ['targetTitle', 'originalText'],
            where: { originalText: { [require('sequelize').Op.ne]: null } },
            order: [['startTime', 'DESC']],
            limit: 100
        });

        const validStoredArtists = storedMatches
            .map(match => ({ title: match.targetTitle, text: match.originalText }))
            .filter(artist =>
                isValidRandomArtistArticleTitle(artist.title)
                && isMusicalArtistArticle(artist.text)
                && !RECENT_ARTICLE_TITLES.has(artist.title)
            );

        return validStoredArtists[Math.floor(Math.random() * validStoredArtists.length)] || null;
    } catch (error) {
        console.error('Fallback database non disponibile:', error.message);
        return null;
    }
}

async function fetchRandomWikipediaArticles() {
    const apiEndpoint = WIKIPEDIA_API_ENDPOINTS[Math.floor(Math.random() * WIKIPEDIA_API_ENDPOINTS.length)];
    const query = new URLSearchParams(RANDOM_ARTICLE_QUERY);
    const response = await axios.get(`${apiEndpoint}?${query}`, {
        headers: { 'User-Agent': WIKIBLANK_USER_AGENT },
        timeout: 8000
    });

    return {
        apiEndpoint,
        pages: response.data.query?.random || []
    };
}

async function fetchPageContents(titles, apiEndpoint) {
    const query = new URLSearchParams({
        action: 'query',
        prop: 'extracts',
        explaintext: '1',
        titles: titles.join('|'),
        format: 'json'
    });

    const response = await axios.get(`${apiEndpoint}?${query}`, {
        headers: { 'User-Agent': WIKIBLANK_USER_AGENT },
        timeout: 8000
    });

    return Object.values(response.data.query.pages)
        .filter(page => page.pageid !== -1 && page.extract)
        .map(page => ({
            title: page.title,
            text: page.extract.length > 2000
                ? `${page.extract.substring(0, 2000)}...`
                : page.extract
        }));
}

module.exports = {
    fetchRandomWikipediaArtistArticle,
    isValidRandomArtistArticleTitle,
    fetchRandomWikipediaArticles,
    fetchPageContents,
    isMusicalArtistArticle
};