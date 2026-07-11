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
  if (day === 0 && settings.apertura_domingo && settings.cierre_domingo) {
    todaySchedule = `${formatTime(settings.apertura_domingo)} - ${formatTime(settings.cierre_domingo)}`
  } else if (day === 6) {
    todaySchedule = `${formatTime(settings.apertura_sabado)} - ${formatTime(settings.cierre_sabado)}`
  } else {
    todaySchedule = `${formatTime(settings.apertura_semana)} - ${formatTime(settings.cierre_semana)}`
  }

  return (
    <div className={`w-full text-white text-sm font-medium transition-colors duration-500 ${
      settings.esta_abierto ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <span>
          {settings.esta_abierto ? (
            <>Abierto ahora — {dayName} {todaySchedule}</>
          ) : (
            <>Cerrado ahora — Horario: Lun-Sáb {formatTime(settings.apertura_semana)} - {formatTime(settings.cierre_sabado)}</>
          )}
        </span>
      </div>
    </div>
  )
}
