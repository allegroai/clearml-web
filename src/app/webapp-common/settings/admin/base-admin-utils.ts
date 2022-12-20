import {AmazonS3URI} from '@common/shared/utils/amazon-s3-uri';
import {Credentials} from '@common/core/reducers/common-auth-reducer';

export const isS3Url = (src) => src?.startsWith('s3://');
const replaceAll = (baseString: string, toReplace: string, replaceWith: string, ignore = false) =>
  baseString.replace(new RegExp(toReplace.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'), (ignore ? 'gi' : 'g')), (typeof (replaceWith) == 'string') ? replaceWith.replace(/\$/g, '$$$$') : replaceWith);
const encodeSpecialCharacters = (src: string) => {
  src = replaceAll(src, '%', '%25');
  src = replaceAll(src, '#', '%23');
  src = replaceAll(src, '\\', '%5C');
  src = replaceAll(src, '^', '%5E');
  return src;
};
export const getBucketAndKeyFromSrc = (src) => {
  let key = '';
  if (src && src.includes('azure://')) {
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      Bucket: 'azure',
      Endpoint: 'azure',
      Key: 'azure',
      Secret: key
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  }
  const srcArr = src.split('/');
  if (!isS3Url(src)) {
    return null;
  } else if (srcArr[2].includes(':')) {
    // We identify minio cae by it's port (:) and use same behavior in case user already set credentials for that endpoint
    srcArr.forEach((part, index) => {
      if (index > 3) {
        key += part + '/';
      }
    });
    key = key.slice(0, -1);
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      Bucket: srcArr[3],
      Endpoint: srcArr[2],
      Key: key,
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  } else {
    try {
      src = encodeSpecialCharacters(src);
      const amazon = new AmazonS3URI(src);
      /* eslint-disable @typescript-eslint/naming-convention */
      return {
        Bucket: amazon.bucket,
        Key: amazon.key,
        Region: amazon.region,
        Endpoint: null
      };
      /* eslint-enable @typescript-eslint/naming-convention */
    } catch (err) {
      console.log(err);
      return null;
    }
  }
};
export const inBucket = (url: string, bucket: string, endpoint: string) => {
  const {Bucket: urlBucket, Endpoint: urlEndpoint} = getBucketAndKeyFromSrc(url);
  return urlBucket === bucket && urlEndpoint === endpoint;
};

export interface SignResponse {
  type: 'popup' | 'sign' | 'none';
  signed?: string;
  expires?: number;
  bucket?: Credentials;
  azure?: boolean;
}
