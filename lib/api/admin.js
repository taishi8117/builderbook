import sendRequest from './sendRequest';

const BASE_PATH = '/api/v1/admin';

export const getBookList = () => {
  return sendRequest(`${BASE_PATH}/books`, {
    method: 'GET',
  });
};

export const getBookDetail = ({ slug }) => {
  return sendRequest(`${BASE_PATH}/books/detail/${slug}`, {
    method: 'GET',
  });
};

export const addBook = ({ name, price, githubRepo }) => {
  return sendRequest(`${BASE_PATH}/books/add`, {
    body: JSON.stringify({ name, price, githubRepo }),
  });
};

export const editBook = ({ id, name, price, githubRepo }) => {
  return sendRequest(`${BASE_PATH}/books/edit`, {
    body: JSON.stringify({
      id,
      name,
      price,
      githubRepo,
    }),
  });
};

export const syncBookContent = ({ bookId }) => {
  return sendRequest(`${BASE_PATH}/books/sync-content`, {
    body: JSON.stringify({ bookId }),
  });
};

export const getGithubRepos = () => {
  return sendRequest(`${BASE_PATH}/github/repos`, {
    method: 'GET',
  });
};
