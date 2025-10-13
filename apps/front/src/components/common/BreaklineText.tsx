import { Fragment } from 'react'

export const BreaklineText = ({ text }: { text: string }) => {
  return (
    <>
      {text.split('\n').map((item, key) => (
        <Fragment key={key}>
          {item}
          <br />
        </Fragment>
      ))}
    </>
  )
}
