import { describe, expect, test } from 'bun:test';

import { createKeyedValueStore } from './registry.js';

interface Link {
  readonly providerId: string;
  readonly credentialsRef: string;
}

function createLink(providerId = 'google'): Link {
  return { providerId, credentialsRef: `auth/oauth/${providerId}` };
}

describe('keyed value store', () => {
  test('stored recovery survives consumer remounts through one shared store', () => {
    const recovery = createKeyedValueStore<string, Link>((link) => link.providerId);
    const consumerA = recovery;

    consumerA.set(createLink('google'));

    const consumerB = recovery;
    expect(consumerB.get('google')).toEqual(createLink('google'));

    consumerB.delete('google');
    expect(consumerA.get('google')).toBeNull();
  });

  test('separate stores isolate recovery state', () => {
    const first = createKeyedValueStore<string, Link>((link) => link.providerId);
    const second = createKeyedValueStore<string, Link>((link) => link.providerId);

    first.set(createLink('google'));

    expect(first.list()).toEqual([createLink('google')]);
    expect(second.list()).toEqual([]);
  });
});
