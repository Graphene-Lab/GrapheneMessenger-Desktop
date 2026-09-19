// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

export type CreateSupportUrlOptionsType = Readonly<{
  locale: string;
  query?: Record<string, string>;
}>;

export function createSupportUrl({
  locale,
  query = {},
}: CreateSupportUrlOptionsType): string {
  const url = new URL(
    'https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/issues/new'
  );

  const lines = [`Locale: ${locale}`, 'Platform: desktop'];
  for (const [key, value] of Object.entries(query)) {
    lines.push(`${key}: ${value}`);
  }
  url.searchParams.set('body', lines.join('\n'));

  return url.toString();
}
