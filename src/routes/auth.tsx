import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/alliar/AuthPage';
import { seo } from '@/lib/seo';
export const Route=createFileRoute('/auth')({head:()=>seo('Entrar','Entre ou crie sua conta Alliar para gerenciar suas empresas.'),component:AuthPage});
