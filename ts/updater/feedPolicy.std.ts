// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// Update feed policy for this fork.
//
// GrapheneMessenger Desktop is a fork of Signal Desktop and still carries
// Signal's update feed settings (`updatesUrl`), which serve the official Signal
// installers signed by Signal Messenger, LLC. Applying one of those over a
// GrapheneMessenger installation would silently replace this fork with an
// unmodified Signal build, so we must never download or install them.
//
// The updater is only allowed to use a feed that we operate ourselves: the URL
// in `updateFeedUrl`, whose host must also be listed in `updateFeedAllowedHosts`,
// and only artifacts named after this product (`<package name>-...`, which is
// what `artifactName` produces). That infrastructure does not exist yet, so
// `updateFeedUrl` is left empty and the updater stays off. Users get new
// versions by hand from the releases page instead.
//
// To turn automatic updates on once we have our own feed, set `updateFeedUrl`
// and `updateFeedAllowedHosts`, and replace `updatesPublicKey` (and
// `appImageUpdatesPublicKey`) with keys we control. Signature verification with
// Signal's key cannot succeed for our artifacts, and verifying against their key
// would be meaningless, so all of them must be swapped together.
//
// These helpers are deliberately pure - no Electron, no config, no network - so
// they can be tested on their own.

export const RELEASES_URL =
  'https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/releases';

// Hosts operated by Signal Messenger, LLC for its own installers.
const SIGNAL_HOSTS: ReadonlySet<string> = new Set([
  'updates.signal.org',
  'updates2.signal.org',
]);

export function isSignalFeedHost(hostname: string): boolean {
  return SIGNAL_HOSTS.has(hostname.toLowerCase());
}

/**
 * Resolves the base URL used for update checks and artifact downloads. Throws
 * unless the configured feed is one that we operate.
 */
export function resolveUpdatesBase(
  feedUrl: string | undefined,
  allowedHosts: ReadonlyArray<string> | undefined
): string {
  const trimmed = (feedUrl ?? '').trim();

  if (!trimmed) {
    throw new Error('resolveUpdatesBase: no update feed configured');
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      `resolveUpdatesBase: '${trimmed}' is not an absolute URL, ignoring it`
    );
  }

  if (url.protocol !== 'https:') {
    throw new Error(
      `resolveUpdatesBase: only https feeds are allowed, got '${url.protocol}'`
    );
  }

  const hostname = url.hostname.toLowerCase();

  if (isSignalFeedHost(hostname)) {
    throw new Error(
      `resolveUpdatesBase: refusing to use the inherited Signal feed '${hostname}', ` +
        'it serves official Signal installers'
    );
  }

  const allowed = (allowedHosts ?? []).map(host => host.trim().toLowerCase());
  if (!allowed.includes(hostname)) {
    throw new Error(
      `resolveUpdatesBase: host '${hostname}' is not listed in updateFeedAllowedHosts`
    );
  }

  return trimmed.replace(/\/+$/, '');
}

/**
 * Only artifacts produced by this fork may be downloaded and applied. Anything
 * else - most notably `signal-desktop-*.exe` - is an official Signal build.
 */
export function isUpdateArtifactOwned(
  fileName: string,
  productName: string | undefined
): boolean {
  const prefix = (productName ?? '').trim().toLowerCase();

  if (!prefix) {
    return false;
  }

  return fileName.trim().toLowerCase().startsWith(prefix);
}
