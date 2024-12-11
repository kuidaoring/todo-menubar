import {
  formatRepeat,
  hasRepeat,
  isEveryday,
  isMonthly,
  isWeekdays,
  isWeekly
} from '@renderer/repeat'
import { Repeat } from '@renderer/types'
import { useRef } from 'react'

type Props = {
  repeat?: Repeat
  onSubmit?: (repeat: Repeat) => void
}

function DetailRepeat({ repeat, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className={repeat && repeat.type !== 'none' ? 'text-blue-500' : ''}
      >
        🔁 {hasRepeat(repeat) ? formatRepeat(repeat) : '繰り返しを設定'}
      </button>
      <dialog
        ref={dialogRef}
        className="rounded-lg p-3"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current?.close()
            formRef.current?.reset()
          }
        }}
      >
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const repeat = buildRepeatFromFormData(formData)
            onSubmit?.(repeat)
            dialogRef.current?.close()
          }}
        >
          <div className="text-gray-700 text-sm flex flex-col h-[80dvh] w-[50dvw]">
            <h3 className="p-2 text-xl">🔁 繰り返しを設定</h3>

            <div className="m-2 p-2 flex-1 overflow-scroll">
              <div>
                <input
                  type="radio"
                  name="repeat-type"
                  id="repeat-none"
                  value="repeat-none"
                  className="m-2"
                  defaultChecked={repeat?.type === 'none' || !repeat}
                />
                <label htmlFor="repeat-none">繰り返さない</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="repeat-type"
                  id="repeat-daily"
                  value="repeat-daily"
                  className="m-2"
                  defaultChecked={isEveryday(repeat)}
                />
                <label htmlFor="repeat-daily">毎日</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="repeat-type"
                  id="repeat-weekdays"
                  value="repeat-weekdays"
                  className="m-2"
                  defaultChecked={isWeekdays(repeat)}
                />
                <label htmlFor="repeat-weekdays">平日</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="repeat-type"
                  id="repeat-weekly"
                  value="repeat-weekly"
                  className="m-2 peer"
                  defaultChecked={isWeekly(repeat)}
                />
                <label htmlFor="repeat-weekly">毎週</label>
                <div className="rounded-lg border border-gray-200 m-2 overflow-hidden hidden peer-checked:flex">
                  {window.constants.repeat.DAY_OF_WEEKS.map((dayOfWeek) => {
                    return (
                      <label
                        key={`dayOfWeek-${dayOfWeek.number}`}
                        className="flex-auto inline-block text-center has-[:checked]:bg-blue-500 has-[:checked]:text-white "
                      >
                        {dayOfWeek.label}
                        <input
                          type="checkbox"
                          name={`repeat-weekly-day-${dayOfWeek.number}`}
                          className="hidden"
                          defaultChecked={
                            repeat?.type === 'weekly' &&
                            repeat.dayOfWeeks.some((day) => day.number === dayOfWeek.number)
                          }
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
              <div>
                <input
                  type="radio"
                  name="repeat-type"
                  id="repeat-monthly"
                  value="repeat-monthly"
                  className="m-2 peer"
                  defaultChecked={isMonthly(repeat)}
                />
                <label htmlFor="repeat-monthly">毎月</label>
                <div className="hidden peer-checked:block">
                  <select
                    name="repeat-monthly-day"
                    className="border border-gray-200 rounded-lg m-2"
                    defaultValue={isMonthly(repeat) ? repeat.dayOfMonth : 1}
                  >
                    {[...Array(31).keys()].map((day) => {
                      return (
                        <option key={day + 1} value={day + 1}>
                          {day + 1}日
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex space-x-5 justify-center">
              <button
                type="submit"
                className="w-20 border border-blue-500 bg-blue-500 text-white px-3 py-1.5 rounded-lg"
              >
                設定
              </button>
              <button
                className="w-20 border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg"
                onClick={(e) => {
                  e.preventDefault()
                  dialogRef.current?.close()
                  formRef.current?.reset()
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default DetailRepeat

function buildRepeatFromFormData(formData: FormData): Repeat {
  const type = formData.get('repeat-type') as string
  if (type === 'repeat-none') {
    return window.constants.repeat.REPEAT_NONE
  }
  if (type === 'repeat-weekdays') {
    return window.constants.repeat.REPEAT_WEEKDAYS
  }
  if (type === 'repeat-daily') {
    return window.constants.repeat.REPEAT_DAILY
  }
  if (type === 'repeat-weekly') {
    return {
      type: 'weekly',
      dayOfWeeks: window.constants.repeat.DAY_OF_WEEKS.filter(
        (day) => formData.get(`repeat-weekly-day-${day.number}`) === 'on'
      )
    }
  }
  return { type: 'monthly', dayOfMonth: Number(formData.get('repeat-monthly-day')) }
}
