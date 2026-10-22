// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';
import * as sinon from 'sinon';

import {
  formatUserAgent,
  getReportedSignalVersion,
  getUserAgent,
} from '../../util/getUserAgent.node.ts';
import {
  DEFAULT_SIGNAL_BASE_VERSION,
  SIGNAL_BASE_VERSION_ENV_VAR,
} from '../../util/signalBaseVersion.std.ts';

describe('getUserAgent', () => {
  beforeEach(function (this: Mocha.Context) {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(function (this: Mocha.Context) {
    this.sandbox.restore();
  });

  describe('#formatUserAgent', () => {
    it('formats the right User-Agent on Windows', () => {
      assert.strictEqual(
        formatUserAgent('8.30.0-alpha.1', '10.0.22000', 'win32'),
        'Signal-Desktop/8.30.0-alpha.1 Windows 10.0.22000'
      );
    });

    it('formats the right User-Agent on macOS', () => {
      assert.strictEqual(
        formatUserAgent('8.30.0-alpha.1', '21.5.0', 'darwin'),
        'Signal-Desktop/8.30.0-alpha.1 macOS 21.5.0'
      );
    });

    it('formats the right User-Agent on Linux', () => {
      assert.strictEqual(
        formatUserAgent('8.30.0-alpha.1', '20.04', 'linux'),
        'Signal-Desktop/8.30.0-alpha.1 Linux 20.04'
      );
    });

    it('omits the platform on unsupported platforms', () => {
      assert.strictEqual(
        formatUserAgent('8.30.0-alpha.1', '13.1', 'freebsd'),
        'Signal-Desktop/8.30.0-alpha.1'
      );
    });

    it('never puts anything but the base version after the product name', () => {
      // The version directly after `Signal-Desktop/` is what Signal's servers
      // parse to decide whether to accept the request at all.
      assert.match(
        formatUserAgent('1.2.3', '10.0.0', 'win32'),
        /^Signal-Desktop\/1\.2\.3 Windows 10\.0\.0$/
      );
    });
  });

  describe('#getReportedSignalVersion', () => {
    afterEach(() => {
      delete process.env[SIGNAL_BASE_VERSION_ENV_VAR];
    });

    it('uses the recorded upstream version when nothing overrides it', () => {
      delete process.env[SIGNAL_BASE_VERSION_ENV_VAR];
      assert.strictEqual(
        getReportedSignalVersion(),
        DEFAULT_SIGNAL_BASE_VERSION
      );
    });

    it('uses the build-time override when one is set', () => {
      process.env[SIGNAL_BASE_VERSION_ENV_VAR] = '8.31.0';
      assert.strictEqual(getReportedSignalVersion(), '8.31.0');
    });

    it('falls back to the recorded version when the override is blank', () => {
      process.env[SIGNAL_BASE_VERSION_ENV_VAR] = '   ';
      assert.strictEqual(
        getReportedSignalVersion(),
        DEFAULT_SIGNAL_BASE_VERSION
      );
    });

    it('throws on an override that is not a version, rather than sending junk', () => {
      process.env[SIGNAL_BASE_VERSION_ENV_VAR] = 'latest';
      assert.throws(
        () => getReportedSignalVersion(),
        /not a valid semantic version/
      );
    });
  });

  describe('#getUserAgent', () => {
    beforeEach(function (this: Mocha.Context) {
      this.sandbox.stub(process, 'platform').get(() => 'win32');
    });

    afterEach(() => {
      delete process.env[SIGNAL_BASE_VERSION_ENV_VAR];
    });

    it('reports the recorded upstream version, not this product version', () => {
      delete process.env[SIGNAL_BASE_VERSION_ENV_VAR];
      assert.strictEqual(
        getUserAgent('10.0.22000'),
        `Signal-Desktop/${DEFAULT_SIGNAL_BASE_VERSION} Windows 10.0.22000`
      );
    });

    it('honours a build-time override', () => {
      process.env[SIGNAL_BASE_VERSION_ENV_VAR] = '8.31.0';
      assert.strictEqual(
        getUserAgent('10.0.22000'),
        'Signal-Desktop/8.31.0 Windows 10.0.22000'
      );
    });
  });
});
