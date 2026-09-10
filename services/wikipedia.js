const axios = require('axios');

const artistCategories = [
    'Categoria:Cantautori_italiani',
    'Categoria:Cantanti_statunitensi',
    'Categoria:Gruppi_musicali_italiani',
    'Categoria:Gruppi_musicali_statunitensi',
    'Categoria:Rapper_italiani',
    'Categoria:Rapper_statunitensi'
];

function cleanWikipediaText(text) {
    let cleaned = text;
    const unwantedSections = [
        /==\s*Note\s*==[\s\S]*/i, /==\s*Bibliografia\s*==[\s\S]*/i, /==\s*Voci correlate\s*==[\s\S]*/i,
        /==\s*Altri progetti\s*==[\s\S]*/i, /==\s*Collegamenti esterni\s*==[\s\S]*/i, 
        /==\s*Discografia\s*==[\s\S]*/i, /==\s*Filmografia\s*==[\s\S]*/i
    ];
    for (const pattern of unwantedSections) {
        cleaned = cleaned.replace(pattern, '');
    }

    const lines = cleaned.split('\n');
    return lines.filter(line => !line.match(/^\d{4}\b/) && !line.match(/^[•*-]\s/)).join('\n').trim();
}

const axiosConfig = { headers: { 'User-Agent': 'WikiBlankApp/1.0 (StudentProject)' } };

async function fetchRandomWikipediaArtistArticle() {
    try {
        const randomCategory = artistCategories[Math.floor(Math.random() * artistCategories.length)];
        
        const listUrl = `https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(randomCategory)}&cmlimit=500&cmnamespace=0&format=json`;
        const listRes = await axios.get(listUrl, axiosConfig);
        
        const members = listRes.data.query?.categorymembers;
        if (!members || members.length === 0) return fetchRandomWikipediaArtistArticle();

        const randomArtist = members[Math.floor(Math.random() * members.length)];
        const title = randomArtist.title;

        if (title.length > 30 || title.includes('(')) {
            return fetchRandomWikipediaArtistArticle(); 
        }

        const extractUrl = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(title)}&format=json`;
        const extractRes = await axios.get(extractUrl, axiosConfig);
        const pages = extractRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        let fullText = pages[pageId].extract;

        if (!fullText || fullText.length < 800) {
            return fetchRandomWikipediaArtistArticle();
        }

        fullText = cleanWikipediaText(fullText);

        const MAX_LENGTH = 1500;
        if (fullText.length > MAX_LENGTH) {
            let truncated = fullText.substring(0, MAX_LENGTH);
            fullText = truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
        }

        return { title: title, text: fullText };

    } catch (error) {
        console.error("Errore nel recupero da Wikipedia:", error.message);
        throw error;
    }
}

module.exports = {
    fetchRandomWikipediaArtistArticle
};