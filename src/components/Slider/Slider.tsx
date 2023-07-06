import React, { ChangeEvent, FC, useState } from 'react'
import { clamp } from '@src/functions'

type SliderProps = {
  min: number
  max: number
  /**
   * Default value is 1
   */
  step?: number
  value: number
  onChange: (value: number) => Promise<void>
}

export const Slider: FC<SliderProps> = ({ min, max, step = 1, value, onChange }) => {
  const [isChanging, setIsChanging] = useState(false)

  const handleOnInput = async (e: ChangeEvent<HTMLInputElement>) => {
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

  return <input type="range" min={min} max={max} step={step} value={value} onInput={handleOnInput} />
}
