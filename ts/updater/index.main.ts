// Copyright 2019 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import config from 'config';
import { app } from 'electron';
import type { Updater, UpdaterOptionsType } from './common.main.ts';
import { MacOSUpdater } from './macos.main.ts';
import { WindowsUpdater } from './windows.main.ts';
import { LinuxAppImageUpdater } from './linuxAppImage.main.ts';
import { initLinux } from './linux.main.ts';
import { RELEASES_URL, resolveUpdatesBase } from './feedPolicy.std.ts';

let initialized = false;

let updater: Updater | undefined;

export async function start(options: UpdaterOptionsType): Promise<void> {
  const { platform } = process;
  const { logger } = options;

  if (initialized) {
    throw new Error('updater/start: Updates have already been initialized!');
  }
  initialized = true;

  if (!logger) {
    throw new Error('updater/start: Must provide logger!');
  }

  const disabledReason = autoUpdateDisabledReason();
  if (disabledReason) {
    logger.info(
      `updater/start: Updates disabled (${disabledReason}) - ` +
        'not starting new version checks; ' +
        `install new versions by hand from ${RELEASES_URL}`
    );

    return;
  }

  if (platform === 'win32') {
    updater = new WindowsUpdater(options);
  } else if (platform === 'darwin') {
    updater = new MacOSUpdater(options);
  } else if (platform === 'linux') {
    if (process.env.APPIMAGE != null) {
      updater = new LinuxAppImageUpdater(options);
    } else {
      initLinux(options);
    }
  } else {
    throw new Error(`updater/start: Unsupported platform ${platform}`);
  }

  await updater?.start();
}

export async function force(): Promise<void> {
  if (!initialized) {
    throw new Error("updater/force: Updates haven't been initialized!");
  }

  if (updater) {
    await updater.force();
  }
}

export function onRestartCanceled(): void {
  if (updater) {
    updater.onRestartCanceled();
  }
}

// Even when `updatesEnabled` is on, checks must never reach a feed that is not
// ours. The inherited Signal feed serves official Signal installers, and
// applying one would replace this fork with an unmodified Signal build.
function autoUpdateDisabledReason(): string | undefined {
  if (!app.isPackaged) {
    return 'not a packaged install';
  }

  if (!config.get<boolean>('updatesEnabled')) {
    return 'updatesEnabled is false';
  }

  try {
    resolveUpdatesBase(
      config.get<string>('updateFeedUrl'),
      config.get<ReadonlyArray<string>>('updateFeedAllowedHosts')
    );
  } catch (error) {
    return (error as Error).message;
  }

  return undefined;
}
