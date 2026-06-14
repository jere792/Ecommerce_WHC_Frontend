import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

function AlertModal({ open, onClose, title, message, type = 'info' }: Props) {
  const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    success: { icon: CheckCircle, color: 'text-green-500' },
    error: { icon: XCircle, color: 'text-red-500' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    info: { icon: AlertTriangle, color: 'text-blue-500' },
  };
  const { icon: Icon, color } = iconMap[type] || iconMap.info;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                <div className="flex justify-end -mt-2 -mr-2">
                  <button onClick={onClose}>
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-3 text-center">
                  <Icon className={`w-10 h-10 ${color}`} />
                  {title && (
                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </Dialog.Title>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Aceptar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function useAlert() {
  const [state, setState] = useState<{ open: boolean; title?: string; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
  });

  const alert = (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => {
    setState({ open: true, message, type, title });
  };

  const close = () => setState(s => ({ ...s, open: false }));

  return { alert, modal: <AlertModal open={state.open} onClose={close} title={state.title} message={state.message} type={state.type} /> };
}

export default AlertModal;
