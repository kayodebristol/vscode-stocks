export class GeneralUtils {
  /**
   * Generate a 256 Element lookup table for fast UUID generation.
   * This uses `Array.fill.map` to emulate fast list comprehension
   * until it is officially supported in ECMAScript.
   *
   * @see: https://stackoverflow.com/a/45311014
   */
  /* tslint:disable:no-magic-numbers */
  static UUID_LOOKUP_TABLE_256_ELEM = new Array(256)
    .fill(0)
    .map(
      (_: number, i: number): string => (16 > i ? '0' : '') + i.toString(16),
    );
  /* tslint:enable:no-magic-numbers */

  /**
   * Fastest UUID4 generator that is RFC4122 compliant.
   *
   * @see: https://stackoverflow.com/a/21963136
   */
  static generateUUID4(): string {
    /* tslint:disable:no-bitwise no-magic-numbers */
    const a = (4294967295 * Math.random()) | 0,
      b = (4294967295 * Math.random()) | 0,
      c = (4294967295 * Math.random()) | 0,
      d = (4294967295 * Math.random()) | 0;

    return (
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[a & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(a >> 8) & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(a >> 16) & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(a >> 24) & 255] +
      '-' +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[b & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(b >> 8) & 255] +
      '-' +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[((b >> 16) & 15) | 64] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(b >> 24) & 255] +
      '-' +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(c & 63) | 128] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(c >> 8) & 255] +
      '-' +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(c >> 16) & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(c >> 24) & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[d & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(d >> 8) & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(d >> 16) & 255] +
      GeneralUtils.UUID_LOOKUP_TABLE_256_ELEM[(d >> 24) & 255]
    );
    /* tslint:enable:no-bitwise no-magic-numbers */
  }

  /**
   * Checks if the value is truthy. Checks against the following
   * values: `false`, `0`, `""`, `null`, `undefined`, `NaN`, `[]`,
   * and `{}`.
   *
   * @param o The object to check.
   * @see https://developer.mozilla.org/en-US/docs/Glossary/Truthy
   */
  static isTruthy(o: any): boolean {
    if (!!o && o.constructor === Object) {
      return !!Object.keys(o as Object).length;
    }
    if (Array.isArray(o)) {
      return !!(o as any[]).length;
    }
    return !!o;
  }

  /**
   * Performs a true deep copy and returns the deep copied object.
   * This is the fastest deep copy implementation known to date
   * in JavaScript.
   *
   * @param o The object to deep copy.
   */
  static deepCopyObj(o: Object): Object {
    return JSON.parse(JSON.stringify(o));
  }

  /**
   * Chunk the given array by a factor of `chunkFactor` into an
   * array of `n` elements.
   *
   * @param arr The array to chunk.
   * @param chunkFactor The chunk factor to chunk by which is greater than `0`.
   * @returns the chunked array.
   */
  static chunkArrayByN<T>(arr: T[], chunkFactor: number): T[][] {
    if (chunkFactor === 0) {
      throw new Error('Invalid chunkFactor of 0');
    }

    const chunkedArray = [];
    for (let i = 0, len = arr.length; i < len; i += chunkFactor) {
      chunkedArray.push(arr.slice(i, i + chunkFactor));
    }
    return chunkedArray;
  }

  /**
   * Gets the language from the locale code.
   *
   * @param locale The locale code (ex. `en-US`).
   * @returns the language from locale.
   */
  static getLanguageFromLocaleCode(locale: string): string {
    if (locale.indexOf('-') !== -1) {
      return locale.split('-')[0];
    }

    if (locale.indexOf('_') !== -1) {
      return locale.split('_')[0];
    }

    return locale;
  }

  static isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  static isObject(obj) {
    return !!obj && obj.constructor === Object;
  }

  /**
   * Fetch ISO8601 compliant date string with tz offset.
   * Use `Date.prototype.toISOString()` for UTC/GMT non-tz
   * datetime string.
   */
  static getISO8601StringWithTz(d: Date): string {
    const tzo = -d.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num: number): string => {
      const norm = Math.floor(Math.abs(num));
      // tslint:disable-next-line:no-magic-numbers
      return (norm < 10 ? '0' : '') + norm;
    };

    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds()) +
      dif +
      // tslint:disable-next-line:no-magic-numbers
      pad(tzo / 60) +
      ':' +
      // tslint:disable-next-line:no-magic-numbers
      pad(tzo % 60)
    );
  }

  /**
   * Takes a `Date` object (ex: `Wed Jan 02 2019 12:20:59 GMT-0500 (Eastern Standard Time)`)
   * and returns a string formatted version of the date in `YYYY-MM-DD`.
   */
  static extractDateStringFromDate(obj: Date) {
    return GeneralUtils.getISO8601StringWithTz(obj).split('T')[0];
  }

  static recursiveWhitespaceTrim(val) {
    return (function trimObj(obj) {
      if (!GeneralUtils.isTruthy(obj) || !GeneralUtils.isObject(obj)) {
        return obj;
      }
      if (!Array.isArray(obj) && typeof obj !== 'object') {
        return obj;
      }
      return Object.keys(obj).reduce(
        (acc, key) => {
          acc[key.trim()] =
            typeof obj[key] === 'string' ? obj[key].trim() : trimObj(obj[key]);
          return acc;
        },
        Array.isArray(obj) ? [] : {},
      );
    })(val);
  }
}
