import React, { useState, type ChangeEvent, type FC } from 'react'
import cn from 'classnames'
import { clamp } from '@src/functions'
import s from './Slider.module.scss'

type SliderProps = {
  min: number
  max: number
  /**
   * Default value is 1
   */
  step?: number
  value: number
  onChange: (value: number) => Promise<void>
  /**
   * Default value is true
   */
  isActive?: boolean
}

export const Slider: FC<SliderProps> = ({ min, max, step = 1, value, onChange, isActive = true }) => {
  const [isChanging, setIsChanging] = useState(false)

  async function handleOnInput(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (isChanging) {
      return
    }

    let newValue = parseInt(e.target.value)
    if (isNaN(newValue)) {
      newValue = 1
    } else {
      newValue = clamp(1, 16, newValue)
    }

    setIsChanging(true)
    await onChange(newValue)
    setIsChanging(false)
  }

  return (
    <div className={cn(s.Slider, { [s.active]: isActive })}>
      <input type="range" min={min} max={max} step={step} value={value} onInput={handleOnInput} />
    </div>
  )
}
