// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// The upstream Signal Desktop version whose code this fork actually contains.
//
// GrapheneMessenger Desktop is a rebrand of Signal Desktop. The version we show
// users - package.json `version`, and therefore Electron's `app.getVersion()` -
// is our own release number, and it must stay that way in the window title, the
// About panel, support logs and the updater.
//
// `Signal-Desktop/<version>` is a different thing: it is how a client tells
// Signal's servers which protocol implementation it is speaking. Signal's
// `RemoteDeprecationFilter` reads that number and drops requests carrying a
// version it considers too old, before authentication even happens (HTTP 499).
// Our release number is not a Signal Desktop version at all, so reporting it
// made every request fail with "connection to server failed" - see issue #14.
//
// So the number we put on the wire has to be the upstream version we really
// incorporated, and nothing else. That is what this module records.
//
// Keep it in sync with the upstream commit we build from. Whenever we rebase
// onto a different Signal Desktop commit, update DEFAULT_SIGNAL_BASE_VERSION (or
// set the SIGNAL_BASE_VERSION environment variable for the build) to that
// commit's version. Never set it to a version whose code we do not actually
// have: the reported version is a claim about the protocol we speak, and
// claiming a newer one than we incorporated would be getting past a gate by
// lying, not by being compatible.
//
// Deliberately pure - no Electron, no config, no I/O - so it can be tested on
// its own.

import { parse } from 'semver';

// Build-time environment variable used to override the recorded base version.
export const SIGNAL_BASE_VERSION_ENV_VAR = 'SIGNAL_BASE_VERSION';

// Upstream Signal Desktop 8.30.0-alpha.1: the commit this fork was created from,
// whose `@signalapp/libsignal-client@0.101.2` and protocol code we carry.
export const DEFAULT_SIGNAL_BASE_VERSION = '8.30.0-alpha.1';

export function isSignalBaseVersion(value: unknown): value is string {
  return typeof value === 'string' && parse(value) !== null;
}

/**
 * Resolves the upstream Signal Desktop version this build reports to Signal
 * services. Missing or empty input falls back to the recorded default; anything
 * that is not a valid semantic version throws, so a typo can never end up on
 * the wire as a bogus client identity.
 */
export function resolveSignalBaseVersion(raw: unknown): string {
  if (raw === undefined || raw === null) {
    return DEFAULT_SIGNAL_BASE_VERSION;
  }

  if (typeof raw !== 'string') {
    throw new Error(
      `resolveSignalBaseVersion: expected a string, got ${typeof raw}`
    );
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_SIGNAL_BASE_VERSION;
  }

  const parsed = parse(trimmed);
  if (!parsed) {
    throw new Error(
      `resolveSignalBaseVersion: '${trimmed}' is not a valid semantic version`
    );
  }

  return parsed.version;
}
