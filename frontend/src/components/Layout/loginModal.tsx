import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useRef, useState } from 'react'
import { User, X, LogOut, Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../hooks/AuthContext'

export default function LoginModal() {
  const navigate = useNavigate()
  const { user, login, logout } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const emailRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const openModal = () => {
    resetFormState()
    setIsOpen(true)
    setTimeout(() => emailRef.current?.focus(), 50)
  }
  const closeModal = () => {
    setIsOpen(false)
    resetFormState()
  }

  const resetFormState = () => {
    setCorreo('')
    setPassword('')
    setError('')
    setFieldErrors({})
    setIsSubmitting(false)
    setShowPassword(false)
  }

  const validateEmail = (e: string) => {
    const email = e.trim()
    if (!email) return 'El correo es requerido'
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) return 'Formato de email inválido'
    if (email.length > 100) return 'El correo no puede exceder 100 caracteres'
    return ''
  }

  const validatePassword = (p: string) => {
    if (!p) return 'La contraseña es requerida'
    if (p.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    return ''
  }

  const runLoginValidations = () => {
    const eCorreo = validateEmail(correo)
    const ePass = validatePassword(password)
    const errs: Record<string, string> = {}
    if (eCorreo) errs.correo = eCorreo
    if (ePass) errs.password = ePass
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (!runLoginValidations()) return
    setIsSubmitting(true)
    try {
      await login(correo.trim(), password)
      closeModal()
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        if (msg.includes('invalid login credentials')) {
          setError('Correo o contraseña incorrectos')
        } else {
          setError(err.message)
        }
      } else setError('Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    closeModal()
  }

  return (
    <>
      <button
        className="flex items-center gap-2 p-2 bg-transparent hover:bg-blue-50 rounded cursor-pointer"
        onClick={openModal}
        title={user ? 'Panel de administración' : 'Iniciar sesión'}
      >
        <User className="w-7 h-7 text-blue-900" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white shadow-xl transition-all min-h-[320px] flex flex-col overflow-hidden">
                  <div className="flex-1 flex flex-col px-8 py-6">
                    {user ? (
                      <>
                        <div className="flex justify-between items-center">
                          <Dialog.Title className="text-xl font-bold text-gray-900">
                            Bienvenido
                          </Dialog.Title>
                          <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition">
                            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <div className="flex flex-col items-center gap-4 mt-8 flex-1 justify-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                            <User className="w-8 h-8 text-blue-600" />
                          </div>
                          <span className="text-lg text-gray-800">
                            ¡Hola, <b>{user.nombre_persona}</b>!
                          </span>
                          <button
                            onClick={() => {
                              closeModal()
                              navigate('/admin')
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            <Shield className="w-5 h-5" />
                            Panel de administración
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                          >
                            <LogOut className="w-5 h-5" />
                            Cerrar sesión
                          </button>
                        </div>
                      </>
                    ) : (
                      <form className="flex flex-col flex-1 justify-between" onSubmit={handleLogin}>
                        <div className="flex justify-between items-center">
                          <div>
                            <Dialog.Title className="text-2xl font-bold text-gray-900">
                              Iniciar sesión
                            </Dialog.Title>
                            <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales</p>
                          </div>
                          <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition">
                            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>

                        <div className="flex flex-col gap-5">
                          <div>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                ref={emailRef}
                                type="email"
                                value={correo}
                                onChange={e => { setCorreo(e.target.value); setFieldErrors({}) }}
                                placeholder="Correo electrónico"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
                                required
                                autoFocus
                              />
                            </div>
                            {fieldErrors.correo && <span className="text-red-500 text-sm mt-1 block">{fieldErrors.correo}</span>}
                          </div>

                          <div>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                ref={passwordRef}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setFieldErrors({}) }}
                                placeholder="Contraseña"
                                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                aria-label="Mostrar contraseña"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {fieldErrors.password && <span className="text-red-500 text-sm mt-1 block">{fieldErrors.password}</span>}
                          </div>

                          {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                              {error}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Ingresando...
                            </span>
                          ) : 'Ingresar'}
                        </button>
                      </form>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
