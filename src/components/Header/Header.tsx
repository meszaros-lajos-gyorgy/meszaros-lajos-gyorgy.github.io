import React, { FC } from 'react'
import s from './Header.module.scss'

type HeaderProps = {}

export const Header: FC<HeaderProps> = () => {
  return (
    <header className={s.Header}>
      <h1>The Monochord</h1>
    </header>
  )
}
