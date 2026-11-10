// Integration tests run only in the Cloud sandbox; no credentials are stored here.
import { createClient } from '@supabase/supabase-js';
import { describe,it,expect } from 'vitest';
const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const adminKey=process.env['SUPABASE_SERVICE_ROLE_KEY'];
describe.skipIf(!url||!key||!adminKey)('Cloud isolation and persistence',()=>{
 it('isolates companies, stores deals and commissions, and accepts only the invited account',async()=>{
 if(!url||!key||!adminKey)return;
 const make=(k:string)=>createClient(url,k,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(k.startsWith('sb_')&&h.get('Authorization')===`Bearer ${k}`)h.delete('Authorization');h.set('apikey',k);return fetch(input,{...init,headers:h});}}});
 const admin=make(adminKey),a=make(key),b=make(key);const users:string[]=[];const tenants:string[]=[];const suffix=crypto.randomUUID();const password=crypto.randomUUID()+'Aa9!';const emailA=`alliar-test-a-${suffix}@example.com`,emailB=`alliar-test-b-${suffix}@example.com`;
 try{
 for(const email of [emailA,emailB]){const r=await admin.auth.admin.createUser({email,password,email_confirm:true});expect(r.error).toBeNull();if(r.data.user)users.push(r.data.user.id);}
 expect((await a.auth.signInWithPassword({email:emailA,password})).error).toBeNull();expect((await b.auth.signInWithPassword({email:emailB,password})).error).toBeNull();
 const ta=await a.rpc('create_tenant',{company_name:'Empresa teste A'});expect(ta.error).toBeNull();const tb=await b.rpc('create_tenant',{company_name:'Empresa teste B'});expect(tb.error).toBeNull();if(!ta.data||!tb.data)throw Error('Tenant missing');tenants.push(ta.data,tb.data);
 expect((await a.from('profiles').select('*')).data?.length).toBe(1);
 expect((await a.from('tenant_settings').update({commission_rate:8}).eq('tenant_id',ta.data)).error).toBeNull();
 const lead=await a.rpc('create_lead',{t:ta.data,contact_name:'Contato real de teste',contact_company:'Teste',contact_email:'',contact_phone:'11999999999',deal_value:1000});expect(lead.error).toBeNull();if(!lead.data)throw Error('Lead missing');
 expect((await a.from('leads').select('*').eq('id',lead.data)).data?.[0]?.value).toBe(1000);
 expect((await b.from('leads').select('*').eq('tenant_id',ta.data)).data).toEqual([]);
 expect((await b.rpc('create_lead',{t:ta.data,contact_name:'Invasão',contact_company:'',contact_phone:'',contact_email:'',deal_value:100})).error).not.toBeNull();
 expect((await a.from('leads').update({stage:'ganho'}).eq('id',lead.data)).error).toBeNull();expect((await a.from('commissions').select('*').eq('lead_id',lead.data)).data?.[0]?.amount).toBe(80);
 expect((await a.from('leads').update({stage:'ganho'}).eq('id',lead.data)).error).toBeNull();expect((await a.from('commissions').select('*').eq('lead_id',lead.data)).data?.length).toBe(1);
 const proposal=await a.from('proposals').insert({tenant_id:ta.data,lead_id:lead.data,base:1000,discount:10}).select().single();expect(proposal.error).toBeNull();expect(proposal.data?.total).toBe(900);
 const invitation=await a.from('tenant_invitations').insert({tenant_id:ta.data,email:emailB}).select().single();expect(invitation.error).toBeNull();if(!invitation.data)throw Error('Invite missing');expect((await a.rpc('accept_invitation',{invite_token:invitation.data.token})).error).not.toBeNull();expect((await b.rpc('accept_invitation',{invite_token:invitation.data.token})).error).toBeNull();expect((await b.rpc('accept_invitation',{invite_token:invitation.data.token})).error).not.toBeNull();
 expect((await b.from('tenant_settings').update({commission_rate:99}).eq('tenant_id',ta.data).select()).data).toEqual([]);
 }finally{for(const t of tenants)await admin.from('tenants').delete().eq('id',t);for(const id of users)await admin.auth.admin.deleteUser(id);}
 },60000);
});
