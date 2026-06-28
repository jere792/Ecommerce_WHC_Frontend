import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { StoreSettings } from '../lib/supabaseTypes'

interface StoreContextType {
  settings: StoreSettings | null
  loading: boolean
  isOpenNow: boolean
  toggleStore: () => Promise<{ success: boolean; error?: string }>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const defaultSettings: StoreSettings = {
  id: 1,
  is_open: false,
  weekday_open: '09:00:00',
  weekday_close: '18:00:00',
  saturday_open: '09:00:00',
  saturday_close: '13:00:00',
  sunday_open: null,
  sunday_close: null,
  updated_at: new Date().toISOString(),
}

function checkIsOpen(settings: StoreSettings): boolean {
  if (!settings.is_open) return false

  const now = new Date()
  const day = now.getDay()
  const time = now.getHours() * 60 + now.getMinutes()

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  if (day === 0) {
    if (!settings.sunday_open || !settings.sunday_close) return false
    return time >= toMinutes(settings.sunday_open) && time < toMinutes(settings.sunday_close)
  }

  if (day === 6) {
    return time >= toMinutes(settings.saturday_open) && time < toMinutes(settings.saturday_close)
  }

  return time >= toMinutes(settings.weekday_open) && time < toMinutes(settings.weekday_close)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setSettings(data as StoreSettings)
      } else {
        setSettings(defaultSettings)
      }
      setLoading(false)
    }

    fetchSettings()

    const channel = supabase
      .channel('store-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as StoreSettings)
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
    const newValue = !settings?.is_open
    const { data, error } = await supabase
      .from('store_settings')
      .update({ is_open: newValue })
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (data) {
      setSettings(data as StoreSettings)
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
