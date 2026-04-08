import { getGreeting } from '../support/app.po';

describe('something-project-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    cy.login('team2@example.com', 'password');
    getGreeting().contains(/something-project/i);
  });
});
