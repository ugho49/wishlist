import { useEffect, useState } from 'react';

/**
 * Object URL for a local file (to preview it in an `<img>`), revoked when the file changes or the component unmounts.
 */
export const useObjectUrl = (file: File | undefined): string | undefined => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
};
