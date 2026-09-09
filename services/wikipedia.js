const CATEGORIE_MUSICALI = [
    'Categoria:Rapper_italiani',
    'Categoria:Rapper_statunitensi',
    'Categoria:Cantautori_italiani',
    'Categoria:Cantanti_pop',
    'Categoria:Gruppi_musicali_rock_italiani',
    'Categoria:Gruppi_musicali_rock_statunitensi',
    'Categoria:Cantanti_soul',
    'Categoria:Cantanti_blues'
];

async function fetchRandomArtist() {
    try {
        const randomCategory = CATEGORIE_MUSICALI[Math.floor(Math.random() * CATEGORIE_MUSICALI.length)];
        
        const categoryUrl = `https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${randomCategory}&cmlimit=500&cmnamespace=0&format=json&origin=*`;
        
        const catResponse = await fetch(categoryUrl);
        const catData = await catResponse.json();
        
        const members = catData.query.categorymembers;
        
        if (!members || members.length === 0) {
            throw new Error(`Nessun artista trovato nella categoria ${randomCategory}`);
        }

        const randomArtistTitle = members[Math.floor(Math.random() * members.length)].title;

        const textUrl = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(randomArtistTitle)}&explaintext=1&format=json&origin=*`;
        
        const textResponse = await fetch(textUrl);
        const textData = await textResponse.json();
        
        const pages = textData.query.pages;
        const pageId = Object.keys(pages)[0];
        const originalText = pages[pageId].extract;

        return {
            title: randomArtistTitle,
            text: originalText
        };
        
    } catch (error) {
        console.error("Errore durante il recupero da Wikipedia:", error);
        throw error;
    }
}

module.exports = { fetchRandomArtist };