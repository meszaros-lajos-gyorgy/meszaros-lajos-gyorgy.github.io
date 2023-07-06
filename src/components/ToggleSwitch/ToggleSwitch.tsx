import React, { FC, useState } from 'react'
import cn from 'classnames'
import s from './style.module.scss'

type ToggleSwitchProps = {
  onClick: (isOn: boolean) => Promise<void>
}

export const ToggleSwitch: FC<ToggleSwitchProps> = ({ onClick }) => {
  const [isOn, setIsOn] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleOnClick = async () => {
    if (isSwitching) {
      return
    }

    setIsSwitching(true)

    await onClick(isOn)

    setIsOn(!isOn)
    setIsSwitching(false)
  }

  return (
    <button
      onClick={handleOnClick}
      className={cn(s.ToggleSwitch, {
        [s.on]: isOn,
        [s.off]: !isOn,
        [s.switching]: isSwitching
      })}
    >
      {isSwitching ? 'turning ' + (isOn ? 'off' : 'on') : '' + (isOn ? 'on' : 'off')}
    </button>
  )
}
