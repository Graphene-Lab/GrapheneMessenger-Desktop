// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import os from 'node:os';

import { getOwn } from './getOwn.std.ts';
import {
  DEFAULT_SIGNAL_BASE_VERSION,
  resolveSignalBaseVersion,
  SIGNAL_BASE_VERSION_ENV_VAR,
} from './signalBaseVersion.std.ts';

const PLATFORM_STRINGS: { [platform: string]: string } = {
  win32: 'Windows',
  darwin: 'macOS',
  linux: 'Linux',
};

/**
 * The upstream Signal Desktop version whose code this build runs: the
 * `SIGNAL_BASE_VERSION` build-time override if one was set, otherwise the
 * recorded `DEFAULT_SIGNAL_BASE_VERSION`. This is what we tell Signal's servers
 * we are, and it has to be the version we actually incorporated.
 */
export function getReportedSignalVersion(): string {
  return resolveSignalBaseVersion(
    typeof process === 'undefined'
      ? undefined
      : process.env[SIGNAL_BASE_VERSION_ENV_VAR]
  );
}

/**
 * Formats the `User-Agent` we send to Signal services. `baseVersion` must be the
 * upstream Signal Desktop version whose code we run - never this product's own
 * release number, which is not a Signal Desktop version at all, and which
 * Signal's `RemoteDeprecationFilter` rejects with HTTP 499 before it even looks
 * at credentials. Exposed separately so tests can check the formatting without
 * depending on build configuration.
 */
export function formatUserAgent(
  baseVersion: string,
  release: string,
  platform = process.platform
): string {
  const platformString = getOwn(PLATFORM_STRINGS, platform);

  let result = `Signal-Desktop/${baseVersion}`;
  if (platformString) {
    result += ` ${platformString} ${release}`;
  }

  return result;
}

/**
 * The `User-Agent` for every request this build makes to Signal services.
 *
 * Takes no version on purpose: the version we report to Signal is the recorded
 * upstream base version, decided in exactly one place, and no caller can pass a
 * different one.
 *
 * `process.platform` could be missing if someone figures out how to compile Signal on
 *   an unsupported OS and forgets to update this file. We'd rather send nothing than
 *   crash.
 */
export function getUserAgent(release = os.release()): string {
  return formatUserAgent(getReportedSignalVersion(), release);
}
