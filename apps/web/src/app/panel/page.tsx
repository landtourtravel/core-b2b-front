import { redirect } from 'next/navigation';

// El panel visual vive en /dashboard (construido por Antigravity).
// Esta ruta existe como alias por si alguien llega directamente a /panel.
export default function PanelPage() {
  redirect('/dashboard');
}
