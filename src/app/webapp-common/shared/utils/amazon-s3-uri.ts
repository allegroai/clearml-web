import {parse, UrlWithStringQuery} from 'url';

const ENDPOINT_PATTERN = /^(.+\.)?s3[.-]([a-z0-9-]+)\./;
export const DEFAULT_REGION = 'us-east-1';

/**
 * A URI wrapper that can parse out information about an S3 URI
 *
 * @example <caption>instanciate AmazonS3URI</caption>
 * try {
 *  const uri = 'https://bucket.s3-aws-region.amazonaws.com/key'
 *  const { region, bucket, key } = new AmazonS3URI(uri)
 * } catch (err) {
 *  console.warn(`${uri} is not a valid S3 uri`) // should not happen because `uri` is valid in that example
 * }
 * @example <caption>functional interface: it automatically returns an AmazonS3URI instance</caption>
 *  const { region, bucket, key } = AmazonS3URI(uri)
 * @param uri - the URI to parse
 * @param [parseQueryString] - If true, `uri` property exposes `query` as an object instead of a string
 * @throws {TypeError|Error}
 */
export class AmazonS3URI {
  private uri: UrlWithStringQuery;
  bucket: string;
  key: string;
  region: string;
  /**
   * true if the URI contains the bucket in the path,
   * false if it contains the bucket in the authority
   *
   * @type { boolean }
   * */
  isPathStyle = false;

  constructor(uri: string) {
    this.uri = parse(uri);
    this.parse(uri);
  }

  private parse(uri: string) {
    if (this.uri.protocol === 's3:') {
      this.bucket = this.uri.host;

      if (!this.bucket) {
        throw new Error(`Invalid S3 URI: no bucket: ${uri}`);
      }

      if (!this.uri.pathname || this.uri.pathname.length <= 1) {
        // s3://bucket or s3://bucket/
        this.key = null;
      } else {
        // s3://bucket/key
        // Remove the leading '/'.
        this.key = this.uri.pathname.substring(1);
      }
      if (this.key !== null) {
        this.key = decodeURIComponent(this.key);
      }
      return;
    }

    if (!this.uri.host) {
      throw new Error(`Invalid S3 URI: no hostname: ${uri}`);
    }

    const matches = this.uri.host.match(ENDPOINT_PATTERN);
    if (!matches) {
      throw new Error(`Invalid S3 URI: hostname does not appear to be a valid S3 endpoint: ${uri}`);
    }

    const prefix = matches[1];
    if (!prefix) {
      // No bucket name in the host; parse it from the path.
      this.isPathStyle = true;

      if (this.uri.pathname === '/') {
        this.bucket = null;
        this.key = null;
      } else {
        const index = this.uri.pathname.indexOf('/', 1);
        if (index === -1) {
          // https://s3.amazonaws.com/bucket
          this.bucket = this.uri.pathname.substring(1);
          this.key = null;
        } else if (index === this.uri.pathname.length - 1) {
          // https://s3.amazonaws.com/bucket/
          this.bucket = this.uri.pathname.substring(1, index);
          this.key = null;
        } else {
          // https://s3.amazonaws.com/bucket/key
          this.bucket = this.uri.pathname.substring(1, index);
          this.key = this.uri.pathname.substring(index + 1);
        }
      }
    } else {
      // Bucket name was found in the host; path is the key.
      this.isPathStyle = false;

      // Remove the trailing '.' from the prefix to get the bucket.
      this.bucket = prefix.substring(0, prefix.length - 1);

      if (!this.uri.pathname || this.uri.pathname === '/') {
        this.key = null;
      } else {
        // Remove the leading '/'.
        this.key = this.uri.pathname.substring(1);
      }
    }

    if (matches[2] !== 'amazonaws') {
      this.region = matches[2];
    }
    // else {
    //   this.region = DEFAULT_REGION;
    // }

    if (this.key !== null) {
      this.key = decodeURIComponent(this.key);
    }

  }
}
