import { cookies } from 'next/headers';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth_pin');

  // Si la cookie no existe o no es válida, mostramos la pantalla de bloqueo (PIN)
  if (authCookie?.value !== 'authenticated') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-200 font-sans">
        <AdminLoginForm />
      </div>
    );
  }

  // Si el PIN es correcto, cargamos el contenido real del panel admin
  return <>{children}</>;
}