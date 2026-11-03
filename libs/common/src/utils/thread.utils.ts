export const sleep = (x: number) =>
  new Promise(resolve => {
    setTimeout(resolve, x);
  });
