import { useState } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { useApp } from '@/lib/store';
import { lookupCnpj } from '@/lib/cnpj.functions';
import { cnpjDigits, formatCnpj, isValidCnpj, type CnpjData } from '@/lib/cnpj';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog,DialogContent,DialogHeader,DialogTitle } from '@/components/ui/dialog';

const EMPTY = { name: '', company: '', phone: '', email: '', value: '0' };
export function NewLead(){
  const app=useApp();const lookup=useServerFn(lookupCnpj);
  const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);
  const [f,setF]=useState(EMPTY);const [cnpj,setCnpj]=useState('');const [info,setInfo]=useState<CnpjData|null>(null);const [looking,setLooking]=useState(false);
  const search=async(v:string)=>{if(!isValidCnpj(v))return;setLooking(true);try{const r=await lookup({data:{cnpj:v}});if(r.error||!r.data){toast.error(r.error??'CNPJ não encontrado');setInfo(null);return;}const d=r.data;setInfo(d);setF(x=>({...x,company:d.nome_fantasia||d.razao_social,phone:x.phone||d.telefone,email:x.email||d.email,name:x.name||d.socios[0]?.nome||''}));toast.success('Dados da empresa preenchidos');}finally{setLooking(false);}};
  const field=(k:keyof typeof EMPTY,label:string,type='text')=><label className="block text-sm">{label}<Input name={k} type={type} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} required={k==='name'||k==='value'} min={type==='number'?0:undefined} step={type==='number'?'0.01':undefined} maxLength={k==='email'?254:k==='phone'?40:120} className="mt-1"/></label>;
  return <><Button onClick={()=>setOpen(true)}><Plus/>Novo negócio</Button><Dialog open={open} onOpenChange={o=>{setOpen(o);if(!o){setF(EMPTY);setCnpj('');setInfo(null);}}}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Novo negócio</DialogTitle></DialogHeader>
  <form className="space-y-3" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await app.addLead(f,info?{cnpj:info.cnpj,razao_social:info.razao_social,cnae:info.cnae,endereco:info.endereco,socios:info.socios}:undefined);setOpen(false);setF(EMPTY);setCnpj('');setInfo(null);toast.success('Negócio salvo');}catch(err){toast.error(err instanceof Error?err.message:'Não foi possível salvar');}finally{setBusy(false);}}}>
   <label className="block text-sm">CNPJ (opcional — preenche tudo sozinho)<div className="mt-1 flex gap-2"><Input value={cnpj} inputMode="numeric" maxLength={18} placeholder="00.000.000/0000-00" onChange={e=>{const v=e.target.value;setCnpj(v);if(cnpjDigits(v).length===14){setCnpj(formatCnpj(v));void search(v);}}}/><Button type="button" variant="secondary" size="icon" disabled={looking||!isValidCnpj(cnpj)} onClick={()=>search(cnpj)} aria-label="Buscar CNPJ">{looking?<Loader2 className="animate-spin"/>:<Search/>}</Button></div>{cnpjDigits(cnpj).length===14&&!isValidCnpj(cnpj)&&<span className="text-xs text-destructive">CNPJ inválido</span>}</label>
   {info&&<div className="space-y-1 rounded-md border bg-muted/40 p-3 text-xs"><div><b>Razão social:</b> {info.razao_social}</div>{info.nome_fantasia&&<div><b>Nome fantasia:</b> {info.nome_fantasia}</div>}<div><b>CNAE:</b> {info.cnae}</div><div><b>Endereço:</b> {info.endereco}</div>{info.socios.length>0&&<div><b>Sócios:</b> {info.socios.map(s=>s.nome).join(', ')}</div>}</div>}
   {field('name','Nome do contato')}{field('company','Empresa do contato')}{field('phone','Telefone')}{field('email','E-mail','email')}{field('value','Valor do negócio','number')}
   <Button disabled={busy}>Salvar negócio</Button></form></DialogContent></Dialog></>;}
