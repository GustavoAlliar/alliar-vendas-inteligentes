import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/alliar/AuthPage';
import { seo } from '@/lib/seo';
export const Route=createFileRoute('/')({head:()=>seo('Alliar — acesso','Acesse sua plataforma comercial Alliar, com contatos e vendas separados por empresa.'),component:AuthPage});
