// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';

import { createSupportUrl } from '../../util/createSupportUrl.std.ts';

describe('createSupportUrl', () => {
  it('points to the fork GitHub issues with the locale in the body', () => {
    const url = new URL(createSupportUrl({ locale: 'fr' }));
    assert.strictEqual(
      url.origin + url.pathname,
      'https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/issues/new'
    );
    assert.include(url.searchParams.get('body') ?? '', 'Locale: fr');
  });

  it('includes query params in the body', () => {
    const url = new URL(
      createSupportUrl({ locale: 'en', query: { debugLog: 'https://' } })
    );
    assert.include(url.searchParams.get('body') ?? '', 'debugLog: https://');
  });
});
