export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const isValidEmail = (value: string): boolean => {
  if (value.trim() === '') {
    return false;
  }
  const emailRegexp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegexp.test(value);
};

export const getUrlParameter = (name: string): string | undefined => {
  const match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  if (!match) {
    return undefined;
  }
  const param = decodeURIComponent(match[1].replace(/\+/g, ' '));
  return param ? param : undefined;
};
