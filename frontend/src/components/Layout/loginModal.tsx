import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { User, X, LogOut, Shield, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../hooks/AuthContext'

export default function LoginModal() {
  const navigate = useNavigate()
  const { user, login, register, logout, forgotPassword } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showForgot, setShowForgot] = useState(false)
  const [forgotCorreo, setForgotCorreo] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    setIsRegister(false)
    setCorreo('')
    setPassword('')
    setConfirmPassword('')
    setNombre('')
    setError('')
    setFieldErrors({})
    setShowForgot(false)
    setForgotCorreo('')
    setForgotMsg('')
    setIsSubmitting(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
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

  const validateNombre = (n: string) => {
    const name = n.trim()
    if (!name) return 'El nombre es requerido'
    if (name.length > 100) return 'El nombre no puede exceder 100 caracteres'
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

  const runRegisterValidations = () => {
    const eNombre = validateNombre(nombre)
    const eCorreo = validateEmail(correo)
    const ePass = validatePassword(password)
    const errs: Record<string, string> = {}
    if (eNombre) errs.nombre = eNombre
    if (eCorreo) errs.correo = eCorreo
    if (ePass) errs.password = ePass
    if (password !== confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (!runRegisterValidations()) return
    setIsSubmitting(true)
    try {
      await register(nombre.trim(), correo.trim(), password)
      setIsRegister(false)
      setCorreo('')
      setPassword('')
      setConfirmPassword('')
      setNombre('')
      setError('')
      setForgotMsg('Registro exitoso. Revisa tu correo para confirmar tu cuenta.')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotMsg('')
    setError('')
    setFieldErrors({})
    const eCorreo = validateEmail(forgotCorreo)
    if (eCorreo) {
      setFieldErrors({ forgotCorreo: eCorreo })
      return
    }
    setIsSubmitting(true)
    try {
      await forgotPassword(forgotCorreo.trim())
      setForgotMsg('Se ha enviado un correo para restablecer la contraseña')
      setForgotCorreo('')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Error desconocido')
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
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <Dialog.Title className="text-lg font-bold text-gray-900">
                      {user
                        ? `Bienvenido, ${user.nombre_persona}`
                        : (isRegister ? 'Crear cuenta' : (showForgot ? 'Recuperar contraseña' : 'Iniciar sesión'))
                      }
                    </Dialog.Title>
                    <button onClick={closeModal}>
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>

                  {user ? (
                    <div className="flex flex-col items-center gap-4 mt-6">
                      <span className="text-lg text-gray-800 mb-2">
                        ¡Hola, <b>{user.nombre_persona}</b>!
                      </span>
                      <button
                        onClick={() => {
                          closeModal()
                          navigate('/admin')
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Shield className="w-5 h-5" />
                        Panel de administración
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                      >
                        <LogOut className="w-5 h-5" />
                        Cerrar sesión
                      </button>
                    </div>
                  ) : showForgot ? (
                    <form className="flex flex-col gap-4 mt-4" onSubmit={handleForgotPassword}>
                      <input
                        ref={emailRef}
                        type="email"
                        value={forgotCorreo}
                        onChange={e => { setForgotCorreo(e.target.value); setFieldErrors({}) }}
                        placeholder="Correo electrónico"
                        className="border rounded px-3 py-2 w-full"
                        required
                        autoFocus
                      />
                      {fieldErrors.forgotCorreo && <span className="text-red-500">{fieldErrors.forgotCorreo}</span>}
                      {error && <span className="text-red-500">{error}</span>}
                      {forgotMsg && <span className="text-green-600">{forgotMsg}</span>}
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Enviando...' : 'Recuperar contraseña'}
                      </button>
                      <button
                        type="button"
                        className="text-blue-700 hover:underline"
                        onClick={() => setShowForgot(false)}
                      >
                        Volver al inicio de sesión
                      </button>
                    </form>
                  ) : !isRegister ? (
                    <form className="flex flex-col gap-4 mt-4" onSubmit={handleLogin}>
                      <div>
                        <input
                          ref={emailRef}
                          type="email"
                          value={correo}
                          onChange={e => { setCorreo(e.target.value); setFieldErrors({}) }}
                          placeholder="Correo electrónico"
                          className="border rounded px-3 py-2 w-full"
                          required
                          autoFocus
                        />
                        {fieldErrors.correo && <span className="text-red-500">{fieldErrors.correo}</span>}
                      </div>

                      <div className="relative">
                        <input
                          ref={passwordRef}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); setFieldErrors({}) }}
                          placeholder="Contraseña"
                          className="border rounded px-3 py-2 w-full pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(s => !s)}
                          className="absolute right-2 top-2 text-gray-600"
                          aria-label="Mostrar contraseña"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {fieldErrors.password && <span className="text-red-500">{fieldErrors.password}</span>}
                      </div>

                      {error && <span className="text-red-500">{error}</span>}
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                      </button>

                      <span className="text-sm text-center">
                        ¿No tienes cuenta?{' '}
                        <button
                          type="button"
                          className="text-blue-700 hover:underline"
                          onClick={() => { setIsRegister(true); setFieldErrors({}); setTimeout(() => emailRef.current?.focus(), 50) }}
                        >
                          Crear cuenta
                        </button>
                      </span>
                      <button
                        type="button"
                        className="text-blue-700 text-sm mt-2 hover:underline"
                        onClick={() => setShowForgot(true)}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </form>
                  ) : (
                    <form className="flex flex-col gap-4 mt-4" onSubmit={handleRegister}>
                      <div>
                        <input
                          type="text"
                          value={nombre}
                          onChange={e => { setNombre(e.target.value); setFieldErrors({}) }}
                          placeholder="Nombre completo"
                          className="border rounded px-3 py-2 w-full"
                          required
                          autoFocus
                        />
                        <div className="text-xs text-gray-500 mt-1">Solo letras y espacios. Máx 100 caracteres.</div>
                        {fieldErrors.nombre && <span className="text-red-500">{fieldErrors.nombre}</span>}
                      </div>

                      <div>
                        <input
                          ref={emailRef}
                          type="email"
                          value={correo}
                          onChange={e => { setCorreo(e.target.value); setFieldErrors({}) }}
                          placeholder="Correo electrónico"
                          className="border rounded px-3 py-2 w-full"
                          required
                        />
                        {fieldErrors.correo && <span className="text-red-500">{fieldErrors.correo}</span>}
                      </div>

                      <div className="relative">
                        <input
                          ref={passwordRef}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); setFieldErrors({}) }}
                          placeholder="Contraseña"
                          className="border rounded px-3 py-2 w-full pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(s => !s)}
                          className="absolute right-2 top-2 text-gray-600"
                          aria-label="Mostrar contraseña"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <div className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</div>
                        {fieldErrors.password && <span className="text-red-500">{fieldErrors.password}</span>}
                      </div>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); setFieldErrors({}) }}
                          placeholder="Confirmar contraseña"
                          className="border rounded px-3 py-2 w-full pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(s => !s)}
                          className="absolute right-2 top-2 text-gray-600"
                          aria-label="Mostrar confirmar contraseña"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {fieldErrors.confirmPassword && <span className="text-red-500">{fieldErrors.confirmPassword}</span>}
                      </div>

                      {error && <span className="text-red-500">{error}</span>}
                      <button
                        type="submit"
                        className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Registrando...' : 'Registrarme'}
                      </button>

                      <span className="text-sm text-center">
                        ¿Ya tienes cuenta?{' '}
                        <button
                          type="button"
                          className="text-blue-700 hover:underline"
                          onClick={() => { setIsRegister(false); setFieldErrors({}) }}
                        >
                          Iniciar sesión
                        </button>
                      </span>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
