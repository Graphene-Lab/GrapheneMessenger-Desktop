// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';

import {
  DEFAULT_SIGNAL_BASE_VERSION,
  isSignalBaseVersion,
  resolveSignalBaseVersion,
} from '../../util/signalBaseVersion.std.ts';

describe('signalBaseVersion', () => {
  describe('#isSignalBaseVersion', () => {
    it('accepts real upstream versions', () => {
      for (const value of [
        '8.30.0-alpha.1',
        '8.30.0',
        '8.31.0',
        '10.0.0-beta.2',
      ]) {
        assert.isTrue(isSignalBaseVersion(value), `expected ${value} to pass`);
      }
    });

    it('rejects things that are not versions', () => {
      for (const value of [
        '',
        '   ',
        'latest',
        'Signal-Desktop/8.30.0',
        '8.30',
        '8.30.0-',
        null,
        undefined,
        42,
        {},
      ]) {
        assert.isFalse(
          isSignalBaseVersion(value),
          `expected ${String(value)} to fail`
        );
      }
    });
  });

  describe('#resolveSignalBaseVersion', () => {
    it('falls back to the recorded default when nothing is given', () => {
      assert.strictEqual(
        resolveSignalBaseVersion(undefined),
        DEFAULT_SIGNAL_BASE_VERSION
      );
      assert.strictEqual(
        resolveSignalBaseVersion(null),
        DEFAULT_SIGNAL_BASE_VERSION
      );
      assert.strictEqual(
        resolveSignalBaseVersion(''),
        DEFAULT_SIGNAL_BASE_VERSION
      );
      assert.strictEqual(
        resolveSignalBaseVersion('  \t '),
        DEFAULT_SIGNAL_BASE_VERSION
      );
    });

    it('returns the given version, trimmed', () => {
      assert.strictEqual(resolveSignalBaseVersion('  8.31.0  '), '8.31.0');
      assert.strictEqual(
        resolveSignalBaseVersion('8.30.0-alpha.1'),
        '8.30.0-alpha.1'
      );
    });

    it('strips a leading v and any build metadata', () => {
      assert.strictEqual(resolveSignalBaseVersion('v8.31.0+build5'), '8.31.0');
    });

    it('throws rather than letting a non-version reach the wire', () => {
      // A bogus identity makes every request fail with HTTP 499, so we stop
      // instead of sending something meaningless.
      assert.throws(
        () => resolveSignalBaseVersion('nightly'),
        /not a valid semantic version/
      );
      assert.throws(
        () => resolveSignalBaseVersion('8.30'),
        /not a valid semantic version/
      );
      assert.throws(
        () => resolveSignalBaseVersion('Signal-Desktop/8.30.0'),
        /not a valid semantic version/
      );
      assert.throws(() => resolveSignalBaseVersion(123), /expected a string/);
    });

    it('does not judge whether a well-formed version is the right one', () => {
      // Which upstream version we actually incorporated cannot be checked
      // mechanically - that is decided by whoever sets DEFAULT_SIGNAL_BASE_VERSION
      // or the SIGNAL_BASE_VERSION build flag. This only guarantees that what
      // goes on the wire parses as a version.
      assert.strictEqual(resolveSignalBaseVersion('1.0.3'), '1.0.3');
    });
  });
});
