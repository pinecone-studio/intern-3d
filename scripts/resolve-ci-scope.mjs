#!/usr/bin/env node

import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const TEAM_PROJECTS = {
  TOM: ['@org/web', '@org/api', '@org/api-e2e'],
  team2: ['something-project', 'something-project-e2e'],
};

function readPullRequestEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !existsSync(eventPath)) {
    return null;
  }

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  return event.pull_request ? event : null;
}

function getTeamLabel(event) {
  const labels = event.pull_request.labels
    .map((label) => label.name)
    .filter((label) => Object.hasOwn(TEAM_PROJECTS, label));

  if (labels.length === 0) {
    return null;
  }

  if (labels.length !== 1) {
    throw new Error(
      `Expected exactly one team label. Found: ${
        labels.length ? labels.join(', ') : 'none'
      }.`
    );
  }

  return labels[0];
}

function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }
  appendFileSync(outputPath, `${name}=${value}\n`);
}

function main() {
  const event = readPullRequestEvent();

  if (!event) {
    setOutput('is_pr', 'false');
    setOutput('team', '');
    setOutput('projects', '');
    console.log('Non-PR event detected; CI should use full workspace scope.');
    return;
  }

  const team = getTeamLabel(event);

  if (!team) {
    setOutput('is_pr', 'true');
    setOutput('team', '');
    setOutput('projects', '');
    console.log('No team label detected; CI should use full workspace scope.');
    return;
  }

  const projects = TEAM_PROJECTS[team].join(',');

  setOutput('is_pr', 'true');
  setOutput('team', team);
  setOutput('projects', projects);

  console.log(`Resolved team "${team}" with projects: ${projects}`);
}

main();
