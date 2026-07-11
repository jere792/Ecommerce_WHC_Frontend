import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ConfiguracionTienda } from '../lib/supabaseTypes'

interface StoreContextType {
  settings: ConfiguracionTienda | null
  loading: boolean
  isOpenNow: boolean
  toggleStore: () => Promise<{ success: boolean; error?: string }>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const defaultSettings: ConfiguracionTienda = {
  id: 1,
  esta_abierto: false,
  apertura_semana: '09:00:00',
  cierre_semana: '18:00:00',
  apertura_sabado: '09:00:00',
  cierre_sabado: '13:00:00',
  apertura_domingo: null,
  cierre_domingo: null,
  actualizado_en: new Date().toISOString(),
}

function checkIsOpen(settings: ConfiguracionTienda): boolean {
  if (!settings.esta_abierto) return false

  const now = new Date()
  const day = now.getDay()
  const time = now.getHours() * 60 + now.getMinutes()

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  if (day === 0) {
    if (!settings.apertura_domingo || !settings.cierre_domingo) return false
    return time >= toMinutes(settings.apertura_domingo) && time < toMinutes(settings.cierre_domingo)
  }

  if (day === 6) {
    return time >= toMinutes(settings.apertura_sabado) && time < toMinutes(settings.cierre_sabado)
  }

  return time >= toMinutes(settings.apertura_semana) && time < toMinutes(settings.cierre_semana)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConfiguracionTienda | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('configuracion_tienda')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setSettings(data as ConfiguracionTienda)
      } else {
        setSettings(defaultSettings)
      }
      setLoading(false)
    }

    fetchSettings()

    const channel = supabase
      .channel('configuracion-tienda-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configuracion_tienda', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as ConfiguracionTienda)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const isOpenNow = settings ? checkIsOpen(settings) : false

  const toggleStore = async (): Promise<{ success: boolean; error?: string }> => {
    const newValue = !settings?.esta_abierto
    const { data, error } = await supabase
      .from('configuracion_tienda')
      .update({ esta_abierto: newValue })
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (data) {
      setSettings(data as ConfiguracionTienda)
    }
    return { success: true }
  }

  return (
    <StoreContext.Provider value={{ settings, loading, isOpenNow, toggleStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
