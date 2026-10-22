// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';

import {
  isSignalFeedHost,
  isUpdateArtifactOwned,
  resolveUpdatesBase,
} from '../../updater/feedPolicy.std.ts';

// The product name of this fork; artifacts we build are named after it because
// `artifactName` in package.json starts with `${name}`.
const PRODUCT = 'graphene-messenger-desktop';
const ALLOWED = ['updates.graphene.example'];

describe('updater/feedPolicy', () => {
  describe('#resolveUpdatesBase', () => {
    it('refuses to check for updates with no feed configured', () => {
      assert.throws(
        () => resolveUpdatesBase('', ALLOWED),
        /no update feed configured/
      );
      assert.throws(
        () => resolveUpdatesBase(undefined, ALLOWED),
        /no update feed configured/
      );
      assert.throws(
        () => resolveUpdatesBase('   ', ALLOWED),
        /no update feed configured/
      );
    });

    it('refuses the inherited Signal feed even when allow-listed', () => {
      // This is the exact feed that served Signal 8.31.0 to a GrapheneMessenger
      // install; applying it would replace this fork with a stock Signal build.
      assert.throws(
        () =>
          resolveUpdatesBase('https://updates2.signal.org/desktop', [
            'updates2.signal.org',
          ]),
        /refusing to use the inherited Signal feed/
      );

      assert.throws(
        () =>
          resolveUpdatesBase('https://updates.signal.org/desktop', [
            'updates.signal.org',
          ]),
        /refusing to use the inherited Signal feed/
      );
    });

    it('refuses hosts that are not allow-listed', () => {
      assert.throws(
        () => resolveUpdatesBase('https://example.com/desktop', ALLOWED),
        /not listed in updateFeedAllowedHosts/
      );
      assert.throws(
        () => resolveUpdatesBase('https://example.com/desktop', []),
        /not listed in updateFeedAllowedHosts/
      );
    });

    it('treats a missing allow-list as empty, so nothing is allowed', () => {
      assert.throws(
        () =>
          resolveUpdatesBase(
            'https://updates.graphene.example/desktop',
            undefined
          ),
        /not listed in updateFeedAllowedHosts/
      );
    });

    it('refuses insecure or malformed feed URLs', () => {
      assert.throws(
        () =>
          resolveUpdatesBase(
            'http://updates.graphene.example/desktop',
            ALLOWED
          ),
        /only https feeds are allowed/
      );
      assert.throws(
        () => resolveUpdatesBase('updates.graphene.example/desktop', ALLOWED),
        /not an absolute URL/
      );
    });

    it('returns our own allow-listed feed, without a trailing slash', () => {
      assert.strictEqual(
        resolveUpdatesBase('https://updates.graphene.example/desktop', ALLOWED),
        'https://updates.graphene.example/desktop'
      );
      assert.strictEqual(
        resolveUpdatesBase(
          'https://updates.graphene.example/desktop///',
          ALLOWED
        ),
        'https://updates.graphene.example/desktop'
      );
      assert.strictEqual(
        resolveUpdatesBase('https://UPDATES.GRAPHENE.EXAMPLE/desktop', ALLOWED),
        'https://UPDATES.GRAPHENE.EXAMPLE/desktop'
      );
    });
  });

  describe('#isUpdateArtifactOwned', () => {
    it('accepts artifacts we produced', () => {
      assert.isTrue(
        isUpdateArtifactOwned('graphene-messenger-desktop-win-x64.exe', PRODUCT)
      );
      assert.isTrue(
        isUpdateArtifactOwned(
          'graphene-messenger-desktop-win-arm64-1.0.4.exe',
          PRODUCT
        )
      );
      assert.isTrue(
        isUpdateArtifactOwned(
          'graphene-messenger-desktop-mac-x64-1.0.4.zip',
          PRODUCT
        )
      );
      assert.isTrue(
        isUpdateArtifactOwned(
          'GRAPHENE-MESSENGER-DESKTOP-mac-universal.dmg',
          PRODUCT
        )
      );
    });

    it('refuses official Signal artifacts', () => {
      // The installer named in the bug report.
      assert.isFalse(
        isUpdateArtifactOwned('signal-desktop-win-x64-8.31.0.exe', PRODUCT)
      );
      assert.isFalse(
        isUpdateArtifactOwned('signal-desktop-mac-x64-1.23.2.zip', PRODUCT)
      );
      assert.isFalse(
        isUpdateArtifactOwned(
          'signal-desktop-beta-win-1.23.2-beta.1.exe',
          PRODUCT
        )
      );
    });

    it('refuses everything when the product name is missing', () => {
      assert.isFalse(
        isUpdateArtifactOwned('graphene-messenger-desktop-win-x64.exe', '')
      );
      assert.isFalse(
        isUpdateArtifactOwned(
          'graphene-messenger-desktop-win-x64.exe',
          undefined
        )
      );
    });
  });

  describe('#isSignalFeedHost', () => {
    it('recognizes the Signal release hosts', () => {
      assert.isTrue(isSignalFeedHost('updates2.signal.org'));
      assert.isTrue(isSignalFeedHost('UPDATES.SIGNAL.ORG'));
      assert.isTrue(isSignalFeedHost('updates.signal.org'));
    });

    it('does not recognize our own or unrelated hosts', () => {
      assert.isFalse(isSignalFeedHost('updates.graphene.example'));
      assert.isFalse(isSignalFeedHost('chat.signal.org'));
      assert.isFalse(isSignalFeedHost(''));
    });
  });
});
