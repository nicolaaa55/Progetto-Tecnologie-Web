const axios = require('axios');

const artistPool = [
    "Vasco Rossi", "Ligabue", "Laura Pausini", "Eros Ramazzotti", "Tiziano Ferro",
    "Jovanotti", "Mina (cantante)", "Adriano Celentano", "Zucchero Fornaciari", "Andrea Bocelli",
    "Lucio Dalla", "Pino Daniele", "Fabrizio De André", "Rino Gaetano", "Claudio Baglioni",
    "Gianna Nannini", "Loredana Bertè", "Fiorella Mannoia", "Elisa (cantante)", "Giorgia (cantante)",
    "Francesco De Gregori", "Antonello Venditti", "Renato Zero", "Franco Battiato", "Ivano Fossati",
    "Cesare Cremonini (cantante)", "Max Pezzali", "Mango (cantante)", "Mia Martini", "Patty Pravo",
    "Ornella Vanoni", "Gianni Morandi", "Massimo Ranieri", "Al Bano", "Toto Cutugno",
    "Marco Mengoni", "Ultimo (cantante)", "Blanco (cantante)", "Mahmood", "Irama",
    "Elodie", "Annalisa", "Emma Marrone", "Alessandra Amoroso", "Carmen Consoli",
    "Max Gazzè", "Daniele Silvestri", "Samuele Bersani", 

    "Måneskin", "Pinguini Tattici Nucleari", "Negramaro", "Subsonica", "Afterhours",
    "Ricchi e Poveri", "Il Volo", "Pooh", "Baustelle", "Verdena", 
    "Ministri", "Marlene Kuntz", "Zen Circus", "Articolo 31", "Club Dogo",

    "J-Ax", "Fedez", "Salmo (rapper)", "Marracash", "Caparezza", 
    "Fabri Fibra", "Ghali", "Sfera Ebbasta", "Guè", "Lazza", 
    "Shiva (rapper)", "Geolier", "Madame (cantante)", "Clementino", "Rocco Hunt",
    "Frankie hi-nrg mc", "Neffa",

    "Michael Jackson", "Madonna (cantante)", "Lady Gaga", "Taylor Swift", "Beyoncé", 
    "Katy Perry", "Justin Timberlake", "Bruno Mars", "Whitney Houston", "Mariah Carey",
    "Aretha Franklin", "Stevie Wonder", "Ray Charles", "Ariana Grande", "Billie Eilish",
    "Olivia Rodrigo", "Tina Turner", "James Brown", "Prince", "Michael Bolton",
    "Lionel Richie", "Donna Summer", "Cher", "Alicia Keys", "John Legend",
    "Chris Brown", "Frank Ocean", "Usher",

    "Eminem", "Snoop Dogg", "Tupac Shakur", "The Notorious B.I.G.", "Jay-Z", 
    "Kanye West", "50 Cent", "Dr. Dre", "Ice Cube", "Nas", 
    "Pharrell Williams", "Post Malone", "Travis Scott", "Kendrick Lamar",

    "Elvis Presley", "Bruce Springsteen", "Frank Sinatra", "Bob Dylan", "Nirvana (gruppo musicale)", 
    "Metallica", "Red Hot Chili Peppers", "Guns N' Roses", "Aerosmith", "Bon Jovi", 
    "Green Day", "Linkin Park", "Foo Fighters", "Pearl Jam", "The Doors", 
    "Jimi Hendrix", "Chuck Berry", "Johnny Cash", "Buddy Holly", "The Beach Boys",
    "Ramones", "Blondie", "Talking Heads", "R.E.M.", "The Smashing Pumpkins",
    "Nine Inch Nails", "Slipknot", "System of a Down", "Korn", "Megadeth", 
    "Slayer", "Anthrax", "Pantera", "Mötley Crüe", "Kiss (gruppo musicale)",
    "Alice Cooper", "Marilyn Manson", "Tom Petty", "Billy Joel", "Paul Simon",
    "The Eagles", "Lynyrd Skynyrd", "ZZ Top", "The Black Keys", "The White Stripes",
    "The Strokes", "The Killers", "Imagine Dragons", "Twenty One Pilots", "Paramore",
    "My Chemical Romance", "Fall Out Boy", "Blink-182"
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
        const randomIndex = Math.floor(Math.random() * artistPool.length);
        const randomArtist = artistPool[randomIndex];

        const extractUrl = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(randomArtist)}&format=json`;
        const extractRes = await axios.get(extractUrl, axiosConfig);

        const pages = extractRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        let fullText = pages[pageId].extract;

        if (!fullText) {
            return fetchRandomWikipediaArtistArticle();
        }

        fullText = cleanWikipediaText(fullText);

        const MAX_LENGTH = 1500;
        if (fullText.length > MAX_LENGTH) {
            const truncated = fullText.substring(0, MAX_LENGTH);
            fullText = truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
        }

        return { title: randomArtist, text: fullText };

    } catch (error) {
        console.error("Errore nel recupero da Wikipedia:", error.message);
        throw error;
    }
}

module.exports = {
    fetchRandomWikipediaArtistArticle
};