import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
export const Route=createFileRoute('/convite')({validateSearch:(s:Record<string,unknown>)=>({token:typeof s.token==='string'?s.token:''}),head:()=>seo('Convite para empresa','Aceite seu convite para colaborar com uma equipe na Alliar.'),component:Invite});
function Invite(){const {token}=Route.useSearch();const {user}=useAuth();const nav=useNavigate();const query=useQueryClient();const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);return <div className="grid min-h-screen place-items-center p-6"><div className="w-full max-w-sm space-y-4"><h1 className="text-2xl font-semibold">Convite para a Alliar</h1>{user?<><p className="text-sm text-muted-foreground">Entre na empresa com sua conta atual.</p><Button disabled={!token||busy} onClick={async()=>{setBusy(true);const {error}=await supabase.rpc('accept_invitation',{invite_token:token});setBusy(false);if(error)setMessage('Convite inválido, expirado ou destinado a outro e-mail.');else{await query.invalidateQueries();await nav({to:'/dashboard'});}}}>Aceitar convite</Button></>:<><p className="text-sm text-muted-foreground">Entre ou crie uma conta com o e-mail que recebeu o convite. Depois abra este link novamente.</p><Button asChild><Link to="/auth">Entrar ou criar conta</Link></Button></>}<p role="status" className="text-sm text-muted-foreground">{message}</p></div></div>;}
