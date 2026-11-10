import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';
import { contactSchema } from './crm-schemas';
export type Stage = 'novo'|'contato'|'proposta'|'negociacao'|'ganho';
export const STAGES: {id:Stage;label:string}[]=[{id:'novo',label:'Novos'},{id:'contato',label:'Em contato'},{id:'proposta',label:'Proposta enviada'},{id:'negociacao',label:'Negociação'},{id:'ganho',label:'Ganho'}];
export type Event={at:string;kind:'msg'|'call'|'proposta'|'audio'|'pix'|'nota';text:string};
export type Lead={id:string;contactId?:string;name:string;company:string;phone:string;value:number;stage:Stage;temp:'quente'|'morno'|'frio';priority:'alta'|'média'|'baixa';owner:string;ownerId?:string;lastContact:string;proposalOpen?:boolean;timeline:Event[]};
type Settings={structure:'solo'|'equipe';view:'focado'|'completo';theme:'dark'|'light';tourDone:boolean};
function useStateData(){
 const {user}=useAuth();const query=useQueryClient();const [tenantId,setTenant]=useState<string|null>(null);const [selected,select]=useState<string|null>(null);
 const tenants=useQuery({queryKey:['tenants',user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from('tenants').select('*').order('created_at');if(error)throw error;return data;}});
 const active=tenantId??tenants.data?.[0]?.id??null;
 const state=useQuery({queryKey:['crm',user?.id,active],enabled:!!active&&!!user,queryFn:async()=>{if(!active||!user)throw Error('Empresa necessária');const results=await Promise.all([supabase.from('leads').select('*,contacts(*)').eq('tenant_id',active).order('created_at').limit(1000),supabase.from('lead_events').select('*').eq('tenant_id',active).order('created_at').limit(1000),supabase.from('tenant_settings').select('*').eq('tenant_id',active).single(),supabase.from('user_preferences').select('*').eq('user_id',user.id).maybeSingle(),supabase.from('user_roles').select('*').eq('tenant_id',active),supabase.from('pipeline_stages').select('*').eq('tenant_id',active).order('position')]);for(const r of results)if(r.error)throw r.error;const [ls,es,settings,prefs,roles,stages]=results;return {leads:(ls.data??[]).map(l=>({id:l.id,contactId:l.contact_id,name:l.contacts?.name??'',company:l.contacts?.company??'',phone:l.contacts?.phone??'',value:Number(l.value),stage:l.stage as Stage,temp:l.temp as Lead['temp'],priority:l.priority as Lead['priority'],owner:l.owner_id===user.id?'Você':`Membro ${l.owner_id.slice(0,6)}`,ownerId:l.owner_id,lastContact:new Date(l.updated_at).toLocaleDateString('pt-BR'),proposalOpen:false,timeline:(es.data??[]).filter(e=>e.lead_id===l.id).map(e=>({kind:e.kind as Event['kind'],text:e.text,at:new Date(e.created_at).toLocaleString('pt-BR')}))})),settings:settings.data,prefs:prefs.data,roles:roles.data??[],stages:stages.data??[]};}});
 const isAdmin=state.data?.roles.some(r=>r.user_id===user?.id&&r.role==='admin')??false;
 const settings:Settings={structure:(state.data?.settings?.structure??'solo') as Settings['structure'],view:(state.data?.prefs?.view??'focado') as Settings['view'],theme:(state.data?.prefs?.theme??'dark') as Settings['theme'],tourDone:state.data?.prefs?.tour_done??true};
 useEffect(()=>{document.documentElement.classList.toggle('dark',settings.theme==='dark');},[settings.theme]);
 async function refresh(){await query.invalidateQueries({queryKey:['crm',user?.id,active]});}
 const report=(e:unknown)=>toast.error(e instanceof Error?e.message:'Não foi possível salvar. Tente novamente.');
 async function set(p:Partial<Settings>){try{if(!user||!active)return;if(p.structure){if(!isAdmin)throw Error('Somente o administrador pode alterar o modo da empresa');const {error}=await supabase.from('tenant_settings').update({structure:p.structure}).eq('tenant_id',active);if(error)throw error;}const {error}=await supabase.from('user_preferences').upsert({user_id:user.id,view:p.view??settings.view,theme:p.theme??settings.theme,tour_done:p.tourDone??settings.tourDone});if(error)throw error;await refresh();}catch(e){report(e);}}
 async function updateLead(id:string,p:Partial<Lead>){try{if(!active)return;const {error}=await supabase.from('leads').update({...(p.stage?{stage:p.stage}:{}),...(p.value!==undefined?{value:p.value}:{}),...(p.temp?{temp:p.temp}:{}),...(p.priority?{priority:p.priority}:{}),...(p.ownerId?{owner_id:p.ownerId}:{})}).eq('tenant_id',active).eq('id',id);if(error)throw error;await refresh();}catch(e){report(e);}}
 async function addEvent(id:string,e:Omit<Event,'at'>){try{if(!active)return;const {error}=await supabase.from('lead_events').insert({tenant_id:active,lead_id:id,...e});if(error)throw error;await refresh();}catch(e){report(e);}}
 async function addLead(input:unknown){if(!active)throw Error('Selecione uma empresa');const p=contactSchema.parse(input);const {error}=await supabase.rpc('create_lead',{t:active,contact_name:p.name,contact_company:p.company,contact_phone:p.phone,contact_email:p.email,deal_value:p.value});if(error)throw error;await refresh();}
 return {...settings,set,leads:state.data?.leads??[],updateLead,addEvent,addLead,selected,select,tenantId:active,tenants:tenants.data??[],switchTenant:(id:string)=>{select(null);setTenant(id);},isAdmin,loading:tenants.isPending||(!!active&&state.isPending),error:tenants.error??state.error,refresh,stages:state.data?.stages??[],commissionRate:Number(state.data?.settings?.commission_rate??0),pixKey:state.data?.settings?.pix_key??''};
}
type Ctx=ReturnType<typeof useStateData>;const C=createContext<Ctx|null>(null);
export function AppProvider({children}:{children:ReactNode}){const data=useStateData();return <C.Provider value={data}>{children}</C.Provider>;}
export function useApp(){const c=useContext(C);if(!c)throw Error('useApp fora do AppProvider');return c;}
