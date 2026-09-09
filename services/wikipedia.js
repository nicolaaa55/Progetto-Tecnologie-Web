const axios = require('axios');

// Funzione di validazione richiesta dal tuo file matchRoutes.js
function isValidRandomArtistArticleTitle(title) {
    if (!title) return false;
    // Escludiamo titoli con prefissi strani che potrebbero sfuggire
    if (title.includes('Wikipedia:') || title.includes('Categoria:') || title.includes('Utente:')) {
        return false;
    }
    return true;
}

// Funzione VITALE per ripristinare la fluidità del testo e togliere porzioni sconnesse
function cleanWikipediaText(text) {
    const unwantedSections = [
        /==\s*Note\s*==[\s\S]*/i,
        /==\s*Bibliografia\s*==[\s\S]*/i,
        /==\s*Voci correlate\s*==[\s\S]*/i,
        /==\s*Altri progetti\s*==[\s\S]*/i,
        /==\s*Collegamenti esterni\s*==[\s\S]*/i,
        /==\s*Discografia\s*==[\s\S]*/i,
        /==\s*Filmografia\s*==[\s\S]*/i
    ];

    let cleaned = text;
    for (const pattern of unwantedSections) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Rimuoviamo righe troppo corte, elenchi puntati o tabellari (spesso cause di "frammenti")
    const lines = cleaned.split('\n');
    const filteredLines = lines.filter(line => {
        if (line.match(/^\d{4}\b/) || line.match(/^[•*-]\s/)) {
            return false;
        }
        return true;
    });

    return filteredLines.join('\n').trim();
}

async function fetchRandomWikipediaArtistArticle() {
    try {
        // =========================================================
        // STEP 1: IMPLEMENTAZIONE SPECIFICA DELLA TRACCIA (Professore)
        // Usiamo action=query, list=random, rnnamespace=0, rnfilterredir=nonredirects
        // Aggiungiamo anche rnminsize per evitare le pagine stub (troppo brevi)
        // =========================================================
        const randomUrl = `https://it.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnfilterredir=nonredirects&rnminsize=1500&rnlimit=1&format=json`;
        
        const randomRes = await axios.get(randomUrl, {
            headers: { 'User-Agent': 'WikiBlankApp/1.0' }
        });

        const randomData = randomRes.data.query?.random;
        if (!randomData || randomData.length === 0) {
            throw new Error("Nessuna pagina trovata dalla query random.");
        }

        const randomTitle = randomData[0].title;

        // =========================================================
        // STEP 2: RECUPERO DEL TESTO CORPOSO (Per la giocabilità)
        // Usiamo il titolo random per recuperare il testo pulito (explaintext)
        // =========================================================
        const extractUrl = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(randomTitle)}&format=json`;
        
        const extractRes = await axios.get(extractUrl, {
            headers: { 'User-Agent': 'WikiBlankApp/1.0' }
        });

        const pages = extractRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        let fullText = pages[pageId].extract;

        // Se la pagina pescata fosse comunque strana o vuota, peschiamo di nuovo in automatico
        if (!fullText || fullText.length < 500) {
            return fetchRandomWikipediaArtistArticle();
        }

        // Applichiamo la pulizia per togliere note ed elenchi
        fullText = cleanWikipediaText(fullText);

        // Assicuriamoci che ci sia sempre abbastanza testo, tagliandolo se troppo lungo
        if (fullText.length > 2000) {
            fullText = fullText.substring(0, 2000) + '...';
        }

        return {
            title: randomTitle,
            text: fullText
        };

    } catch (error) {
        console.error("Errore nel recupero da Wikipedia:", error.message);
        throw error;
    }
}

module.exports = {
    fetchRandomWikipediaArtistArticle,
    isValidRandomArtistArticleTitle
};