import { Clock } from 'lucide-react'
import { useStore } from '../../contexts/StoreContext'

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function StoreTopBar() {
  const { settings } = useStore()

  if (!settings) return null

  const now = new Date()
  const day = now.getDay()
  const dayName = dayNames[day]

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  let todaySchedule = ''
  if (day === 0 && settings.sunday_open && settings.sunday_close) {
    todaySchedule = `${formatTime(settings.sunday_open)} - ${formatTime(settings.sunday_close)}`
  } else if (day === 6) {
    todaySchedule = `${formatTime(settings.saturday_open)} - ${formatTime(settings.saturday_close)}`
  } else {
    todaySchedule = `${formatTime(settings.weekday_open)} - ${formatTime(settings.weekday_close)}`
  }

  return (
    <div className={`w-full text-white text-sm font-medium transition-colors duration-500 ${
      settings.is_open ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <span>
          {settings.is_open ? (
            <>Abierto ahora — {dayName} {todaySchedule}</>
          ) : (
            <>Cerrado ahora — Horario: Lun-Sáb {formatTime(settings.weekday_open)} - {formatTime(settings.saturday_close)}</>
          )}
        </span>
      </div>
    </div>
  )
}
