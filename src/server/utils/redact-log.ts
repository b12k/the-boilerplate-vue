import { parseJson } from './parse-json';

const REDACTED = '[Redacted]';
const SENSITIVE_FIELD_PATTERN =
  /authorization|cookie|password|passwd|credentials?|secret|token|apikey|privatekey|debugonkey|envoverrides|sessionid|^auth$|^pwd$/iu;

interface LogRedactorOptions {
  secrets: Array<string | undefined>;
  urls: Array<string>;
}

function checkIsSensitiveField(fieldName: string) {
  return SENSITIVE_FIELD_PATTERN.test(fieldName.replaceAll(/[^a-z0-9]/giu, ''));
}

function decodeUrlComponent(component: string) {
  try {
    return decodeURIComponent(component);
  } catch {
    return component;
  }
}

function getUrlSecrets(urlString: string) {
  const url = new URL(urlString);
  return [
    decodeUrlComponent(url.password),
    ...[...url.searchParams]
      .filter(([parameterName]) => checkIsSensitiveField(parameterName))
      .map(([, parameterContent]) => parameterContent),
  ];
}

export function createLogRedactor({ secrets, urls }: LogRedactorOptions) {
  const secretPatterns = [
    ...new Set(
      [...secrets, ...urls.flatMap((urlString) => getUrlSecrets(urlString))]
        .filter((secret): secret is string => Boolean(secret))
        .flatMap((secret) => [secret, encodeURIComponent(secret)]),
    ),
  ]
    .toSorted(
      (firstSecret, secondSecret) => secondSecret.length - firstSecret.length,
    )
    .map((secret) => new RegExp(RegExp.escape(secret), 'giu'));

  function redactText(text: string) {
    let redactedText = text;
    for (const secretPattern of secretPatterns) {
      redactedText = redactedText.replaceAll(secretPattern, REDACTED);
    }
    return redactedText
      .replaceAll(
        /(?<scheme>[a-z][a-z\d+.-]*:\/\/)[^/\s?#]*@/giu,
        `$<scheme>${REDACTED}@`,
      )
      .replaceAll(
        /(?<separator>[?&])(?<parameterName>[^=&#\s]+)=[^&#\s]*/gu,
        (queryParameter: string, separator: string, parameterName: string) =>
          checkIsSensitiveField(decodeUrlComponent(parameterName))
            ? `${separator}${parameterName}=${REDACTED}`
            : queryParameter,
      )
      .replaceAll(
        /\b(?<authScheme>Bearer|Basic)\s+[\w+/=.-]+/giu,
        `$<authScheme> ${REDACTED}`,
      );
  }

  function redactPayload(payload: unknown): unknown {
    if (typeof payload === 'string') return redactText(payload);
    if (Array.isArray(payload)) {
      return payload.map((entry: unknown) => redactPayload(entry));
    }
    if (typeof payload === 'object' && payload !== null) {
      return Object.fromEntries(
        Object.entries(payload).map(([fieldName, fieldContent]) => [
          redactText(fieldName),
          checkIsSensitiveField(fieldName)
            ? REDACTED
            : redactPayload(fieldContent),
        ]),
      );
    }
    return payload;
  }

  return function redactLog(logLine: string) {
    try {
      return `${JSON.stringify(redactPayload(parseJson<unknown>(logLine)))}\n`;
    } catch {
      return `${JSON.stringify({ level: 50, msg: 'Log redaction failed; contents omitted' })}\n`;
    }
  };
}
