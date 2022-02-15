export const wait = ms => new Promise(r => setTimeout(r, ms));

export const retryOperation = (operation, delay, retries) => new Promise((resolve, reject) => {
  return operation()
    .then(resolve )
    .catch((reason) => {
      if (retries > 0) {
        return wait(delay)
          .then(retryOperation.bind(null, operation, delay, retries - 1))
          .then(resolve)
          .catch(reject);
      }
      return reject(reason);
    });
});
