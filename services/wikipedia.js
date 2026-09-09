const axios = require('axios');

const CATEGORIES = [
    'Cantanti_italiani',
    'Gruppi_musicali_italiani',
    'Musicisti_italiani',
    'Cantautori_italiani'
];

async function fetchRandomArtist() {
    for (let i = 0; i < 3; i++) {
        const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const url = `https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Categoria:${randomCategory}&cmlimit=500&cmnamespace=0&format=json`;

        try {
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'WikiBlankApp/1.0 (Educational Project)' },
                timeout: 8000
            });

            const members = response.data.query?.categorymembers;

            if (members && members.length > 0) {
                const randomPage = members[Math.floor(Math.random() * members.length)];
                
                const pageContent = await fetchPageContent(randomPage.title);
                return pageContent;
            }
        } catch (error) {
            console.error(`Tentativo fallito per la categoria ${randomCategory}:`, error.message);
        }
    }

    throw new Error('Impossibile recuperare un artista da Wikipedia dopo vari tentativi.');
}

async function fetchPageContent(title) {
    const url = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(title)}&format=json`;

    const response = await axios.get(url, {
        headers: { 'User-Agent': 'WikiBlankApp/1.0 (Educational Project)' },
        timeout: 8000
    });

    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === '-1' || !pages[pageId].extract) {
        throw new Error(`Impossibile estrarre il testo per la pagina: ${title}`);
    }

    let fullText = pages[pageId].extract;

    if (fullText.length > 2000) {
        fullText = fullText.substring(0, 2000) + '...';
    }

    return {
        title: pages[pageId].title,
        text: fullText
    };
}

module.exports = {
    fetchRandomArtist
};