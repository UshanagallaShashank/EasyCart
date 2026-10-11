// Checks which photos customers may send. No storage or database is used.
import { describe, expect, it } from 'vitest';
import { read_photo, MAX_PHOTO_BYTES } from '../../../src/modules/photos/photo-rules.js';

const tiny = Buffer.from('fake image bytes').toString('base64');

describe('read_photo', () => {
  it('reads a JPEG, PNG or WEBP photo', () => {
    expect(read_photo(`data:image/jpeg;base64,${tiny}`)).toMatchObject({ mime: 'image/jpeg', ext: 'jpg' });
    expect(read_photo(`data:image/png;base64,${tiny}`)).toMatchObject({ ext: 'png' });
    expect(read_photo(`data:image/webp;base64,${tiny}`)).toMatchObject({ ext: 'webp' });
  });

  it('refuses SVG, because it can carry code', () => {
    expect(() => read_photo(`data:image/svg+xml;base64,${tiny}`)).toThrow('Only JPEG, PNG or WEBP');
  });

  it('refuses things that are not photos', () => {
    expect(() => read_photo('hello')).toThrow();
    expect(() => read_photo(undefined)).toThrow();
    expect(() => read_photo(`data:text/html;base64,${tiny}`)).toThrow('Only JPEG, PNG or WEBP');
    expect(() => read_photo('data:image/png,not-base64')).toThrow();
  });

  it('refuses an empty or too large photo', () => {
    expect(() => read_photo('data:image/png;base64,')).toThrow('empty');
    const big = Buffer.alloc(MAX_PHOTO_BYTES + 1).toString('base64');
    expect(() => read_photo(`data:image/png;base64,${big}`)).toThrow('too large');
  });
});
