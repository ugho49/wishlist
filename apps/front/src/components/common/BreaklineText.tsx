import { Fragment } from 'react';

export const BreaklineText = ({ text }: { text: string }) => (
  <>
    {text.split('\n').map((item, key) => (
      <Fragment key={key}>
        {item}
        <br />
      </Fragment>
    ))}
  </>
);
