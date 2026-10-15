import { describe, expect, it } from 'vitest';
import { isCodespacesOrigin } from './config.js';

describe('Codespaces web origins', () => {
  const workspace = 'supreme-fishstick-v6pv55q6j69j3xprr';

  it('allows HTTPS forwarded ports for this Codespace', () => {
    expect(isCodespacesOrigin(
      `https://${workspace}-8081.app.github.dev`,
      workspace,
      'app.github.dev',
    )).toBe(true);
  });

  it('rejects other workspaces, HTTP, and malformed forwarding ports', () => {
    expect(isCodespacesOrigin(
      'https://another-workspace-8081.app.github.dev',
      workspace,
      'app.github.dev',
    )).toBe(false);
    expect(isCodespacesOrigin(
      `http://${workspace}-8081.app.github.dev`,
      workspace,
      'app.github.dev',
    )).toBe(false);
    expect(isCodespacesOrigin(
      `https://${workspace}-preview.app.github.dev`,
      workspace,
      'app.github.dev',
    )).toBe(false);
  });
});
