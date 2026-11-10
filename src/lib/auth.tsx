import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
const Auth = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export function AuthProvider({ children }: { children: ReactNode }) {
 const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false); const router=useRouter(); const query=useQueryClient();
 useEffect(()=> { let alive=true; let revision=0;
 const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{ if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED','INITIAL_SESSION'].includes(event)) return; revision++; if(event==='SIGNED_OUT'){setUser(null);setReady(true);void query.cancelQueries().then(()=>query.clear());void router.invalidate();return;} void supabase.auth.getUser().then(({data})=>{if(alive){setUser(data.user);setReady(true);if(event!=='INITIAL_SESSION'){void router.invalidate();void query.invalidateQueries();}}}); });
 const current=revision; void supabase.auth.getUser().then(({data})=>{if(alive&&revision===current){setUser(data.user);setReady(true);}});
 return ()=>{alive=false;subscription.unsubscribe();}; },[router,query]);
 return <Auth.Provider value={{user,ready}}>{children}</Auth.Provider>;
}
export const useAuth=()=>useContext(Auth);
