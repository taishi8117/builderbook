const generateSlug = require('./slugify');

const MockUser = {
  slugs: ['john-johnson-jr', 'john-johnson-jr-1', 'john'],
  findOne({ slug }) {
    if (this.slugs.includes(slug)) {
      return Promise.resolve({ id: 'id' });
    }
    return Promise.resolve(null);
  },
};

describe('slugify', () => {
  test('no duplication', () => {
    expect.assertions(1);

    return generateSlug(MockUser, 'John Johnson').then((slug) => {
      expect(slug).toBe('john-johnson');
    });
  });

  test('one duplication', () => {
    expect.assertions(1);

    return generateSlug(MockUser, 'John.').then((slug) => {
      expect(slug).toBe('john-1');
    });
  });

  test('multiple duplications', () => {
    expect.assertions(1);

    return generateSlug(MockUser, 'John Johnson Jr.').then((slug) => {
      expect(slug).toBe('john-johnson-jr-2');
    });
  });
});
