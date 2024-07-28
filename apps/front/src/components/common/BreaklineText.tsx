import React from 'react'

export const BreaklineText = ({ text }: { text: string }) => {
  return (
    <>
      {text.split('\n').map((item, key) => (
        <React.Fragment key={key}>
          {item}
          <br />
        </React.Fragment>
      ))}
    </>
  )
}
