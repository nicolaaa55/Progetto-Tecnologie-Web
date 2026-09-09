describe('Wikiblank E2E Tests', () => {
  const baseUrl = 'http://localhost:4200';

  it('1. Reindirizza l\'utente dalla root alla pagina di gioco', () => {
    cy.visit(baseUrl + '/');
    cy.url().should('include', '/game');
  });

  it('2. Mostra correttamente la barra di navigazione principale', () => {
    cy.visit(baseUrl + '/game');
    cy.get('.navbar').should('be.visible');
    cy.contains('.nav-link', 'Gioca');
    cy.contains('.nav-link', 'Classifiche');
  });

  it('3. Blocca l\'accesso e non cambia pagina se si inseriscono credenziali errate', () => {
    cy.visit(baseUrl + '/login');
    cy.get('input[name="username"]').type('UtenteInesistente123');
    cy.get('input[name="password"]').type('PasswordSbagliata');
    
    cy.get('button').first().click(); 
    
    cy.url().should('include', '/login');
  });

  it('4. Naviga correttamente dal Login alla schermata di Registrazione', () => {
    cy.visit(baseUrl + '/login');
    cy.contains('Registrati qui').click();
    cy.url().should('include', '/register');
  });

  it('5. Blocca la registrazione se i campi sono vuoti', () => {
    cy.visit(baseUrl + '/register');
    cy.contains('button', 'Registrati').click();
    cy.get('.alert-danger').should('contain', 'Compila tutti i campi');
  });

  it('6. Registra un nuovo utente con successo', () => {
    cy.visit(baseUrl + '/register');
    const randomUser = 'tester_' + Math.floor(Math.random() * 100000);
    cy.get('input[name="username"]').type(randomUser);
    cy.get('input[name="password"]').type('password_sicura');
    cy.get('button').first().click();
    
    cy.url({ timeout: 10000 }).should('satisfy', (url) => url.includes('/login') || url.includes('/game'));
  });

  it('7. Permette a un utente Ospite di iniziare una Nuova Partita', () => {
    cy.visit(baseUrl + '/game');
    cy.contains('button', 'Inizia Nuova Partita').click();
    cy.contains('Partita avviata', { timeout: 15000 }).should('be.visible');
    cy.get('input[name="guessWord"]').should('be.visible');
  });

  it('8. Aumenta il contatore dei tentativi dopo una parola inserita', () => {
    cy.visit(baseUrl + '/game');
    cy.get('button').contains(/Inizia/i).click();
    
    cy.get('input[name="guessWord"]', { timeout: 15000 }).type('tentativosbagliatotest');
    cy.get('button').contains(/Prova|Indovina|Invia/i).click();
    
    cy.contains(/Tentativ.*1/i, { timeout: 5000 }).should('be.visible');
  });

  it('9. Carica la struttura della schermata Classifiche', () => {
    cy.visit(baseUrl + '/leaderboard');
    cy.get('h2').should('contain', 'Classifica Giocatori');
  });

  it('10. Carica la schermata delle Partite Concluse (Storico Ospite/Utente)', () => {
    cy.visit(baseUrl + '/completed');
    cy.url().should('include', '/completed');
  });
});