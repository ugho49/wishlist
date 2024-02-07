export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const getUrlParameter = (name: string): string | undefined => {
  const match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  if (!match) {
    return undefined;
  }
  const param = decodeURIComponent(match[1].replace(/\+/g, ' '));
  return param ? param : undefined;
};
