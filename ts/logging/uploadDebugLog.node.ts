// Copyright 2018 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { Response } from 'got';
import { z } from 'zod';
import FormData from 'form-data';
import got from 'got';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { getUserAgent } from '../util/getUserAgent.node.ts';
import { maybeParseUrl } from '../util/url.std.ts';
import * as durations from '../util/durations/index.std.ts';
import type { LoggerType } from '../types/Logging.std.ts';
import { parseUnknown } from '../util/schemas.std.ts';

const gzipAsync = promisify(gzip);

const BASE_URL = 'https://debuglogs.org';

const UPLOAD_TIMEOUT = { request: durations.MINUTE };

const tokenBodySchema = z
  .object({
    fields: z.record(z.string(), z.unknown()),
    url: z.string(),
  })
  .strip();

const parseTokenBody = (
  rawBody: unknown
): { fields: Record<string, unknown>; url: string } => {
  const body = parseUnknown(tokenBodySchema, rawBody);

  const parsedUrl = maybeParseUrl(body.url);
  if (!parsedUrl) {
    throw new Error("Token body's URL was not a valid URL");
  }
  if (parsedUrl.protocol !== 'https:') {
    throw new Error("Token body's URL was not HTTPS");
  }

  return body;
};

export type UploadOptionsType = Readonly<{
  content: string | Buffer<ArrayBuffer> | Uint8Array<ArrayBuffer>;
  logger: LoggerType;
  extension?: string;
  contentType?: string;
  compress?: boolean;
  prefix?: string;
  // Used only to name the uploaded file, so support can tell which build
  // produced a log. It is never part of the identity we present to Signal.
  appVersion?: string;
}>;

export const upload = async ({
  content,
  logger,
  extension = 'gz',
  contentType = 'application/gzip',
  compress = true,
  prefix,
  appVersion = 'unknown',
}: UploadOptionsType): Promise<string> => {
  // The user-agent we send everywhere to Signal services must be the upstream
  // Signal Desktop version we are built from, never this product's release
  // number - see ts/util/signalBaseVersion.std.ts.
  const headers = { 'User-Agent': getUserAgent() };

  const formUrl = new URL(BASE_URL);

  if (prefix !== undefined) {
    formUrl.searchParams.set('prefix', prefix);
  }

  const signedForm = await got.get(formUrl.toString(), {
    responseType: 'json',
    headers,
    timeout: UPLOAD_TIMEOUT,
  });
  const { fields, url } = parseTokenBody(signedForm.body);

  // oxlint-disable-next-line typescript/restrict-template-expressions
  const uploadKey = `${fields.key}.${extension}`;

  const form = new FormData();
  // The API expects `key` to be the first field:
  form.append('key', uploadKey);
  Object.entries(fields)
    .filter(([key]) => key !== 'key')
    .forEach(([key, value]) => {
      form.append(key, value);
    });

  const contentBuffer = compress
    ? await gzipAsync(Buffer.from(content))
    : Buffer.from(content);
  form.append('Content-Type', contentType);
  form.append('file', contentBuffer, {
    contentType,
    filename: `signal-desktop-debug-log-${appVersion}.txt.gz`,
  });

  logger.info('Debug log upload starting...');
  try {
    const { statusCode, body } = await got.post(url, {
      headers,
      body: form,
      timeout: UPLOAD_TIMEOUT,
    });
    if (statusCode !== 204) {
      throw new Error(
        `Failed to upload to S3, got status ${statusCode}, body '${body}'`
      );
    }
  } catch (error) {
    const response = error.response as Response<string>;
    throw new Error(
      `Got threw on upload to S3: "${error.message}", got status ${response?.statusCode}, body '${response?.body}'  `
    );
  }
  logger.info('Debug log upload complete.');

  return `${BASE_URL}/${uploadKey}`;
};
