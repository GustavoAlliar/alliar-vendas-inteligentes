import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect,useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { seo } from '@/lib/seo';
export const Route=createFileRoute('/reset-password')({head:()=>seo('Redefinir senha','Escolha uma nova senha para sua conta Alliar.'),component:Reset});
function Reset(){const nav=useNavigate();const [recovery,setRecovery]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);useEffect(()=>{setRecovery(new URLSearchParams(window.location.hash.slice(1)).get('type')==='recovery');},[]);return <div className="grid min-h-screen place-items-center p-6"><form className="w-full max-w-sm space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget);const {error}=await supabase.auth.updateUser({password:String(f.get('password'))});setBusy(false);if(error)setMessage(error.message);else{setMessage('Senha alterada.');await nav({to:'/dashboard'});}}}><h1 className="text-2xl font-semibold">Nova senha</h1>{recovery?<><label className="block text-sm">Senha<Input name="password" type="password" minLength={8} autoComplete="new-password" required/></label><Button disabled={busy}>Salvar nova senha</Button></>:<p className="text-sm text-muted-foreground">Abra o link de recuperação enviado por e-mail.</p>}<p role="status">{message}</p></form></div>;}
