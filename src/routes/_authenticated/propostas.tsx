import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/lib/store';
import { brl } from '@/lib/pix';
import { seo } from '@/lib/seo';
import { PageHeader } from '@/components/alliar/Shell';
export const Route=createFileRoute('/_authenticated/propostas')({head:()=>seo('Propostas','Consulte as propostas salvas e os valores negociados da sua empresa.'),component:Proposals});
function Proposals(){const app=useApp();const query=useQuery({queryKey:['proposals',app.tenantId],queryFn:async()=>{const {data,error}=await supabase.from('proposals').select('*').eq('tenant_id',app.tenantId??'').order('created_at',{ascending:false}).limit(1000);if(error)throw error;return data;}});return <div className="mx-auto max-w-5xl"><PageHeader title="Propostas"/>{query.isPending?<p>Carregando…</p>:query.error?<p role="alert">Não foi possível carregar as propostas.</p>:!query.data?.length?<p className="text-sm text-muted-foreground">Nenhuma proposta salva. Abra um negócio para criar uma proposta.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-muted-foreground"><th className="py-3">Contato</th><th>Valor base</th><th>Desconto</th><th>Total</th><th>Data</th></tr></thead><tbody>{query.data.map(p=><tr key={p.id} className="border-b"><td className="py-4">{app.leads.find(l=>l.id===p.lead_id)?.name??'Negócio'}</td><td>{brl(p.base)}</td><td>{p.discount}%</td><td className="font-semibold">{brl(p.total??0)}</td><td>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div>}</div>;}
