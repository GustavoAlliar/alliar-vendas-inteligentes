ALTER TABLE public.contacts ADD COLUMN cnpj text NOT NULL DEFAULT '' CHECK(length(cnpj)<=20), ADD COLUMN razao_social text NOT NULL DEFAULT '' CHECK(length(razao_social)<=200), ADD COLUMN cnae text NOT NULL DEFAULT '' CHECK(length(cnae)<=300), ADD COLUMN endereco text NOT NULL DEFAULT '' CHECK(length(endereco)<=500), ADD COLUMN socios jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE FUNCTION public.tenant_members(t uuid) RETURNS TABLE(user_id uuid, role text, display_name text, email text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT r.user_id, r.role::text, coalesce(p.display_name,''), coalesce(u.email,'')::text
  FROM public.user_roles r LEFT JOIN public.profiles p ON p.id=r.user_id LEFT JOIN auth.users u ON u.id=r.user_id
  WHERE r.tenant_id=t AND public.is_member(t) $$;
REVOKE ALL ON FUNCTION public.tenant_members(uuid) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.tenant_members(uuid) TO authenticated;

CREATE TABLE public.whatsapp_webhook_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id text NOT NULL UNIQUE, event text NOT NULL, payload jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz, processing_error text, attempts int NOT NULL DEFAULT 0);
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.whatsapp_messages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid REFERENCES public.tenants ON DELETE CASCADE, lead_id uuid REFERENCES public.leads ON DELETE SET NULL, phone text NOT NULL, direction text NOT NULL CHECK(direction IN ('in','out')), kind text NOT NULL DEFAULT 'text', body text NOT NULL DEFAULT '', wa_id text UNIQUE, status text NOT NULL DEFAULT 'accepted', status_at timestamptz, error text, created_at timestamptz NOT NULL DEFAULT now(), sent_by uuid);
CREATE INDEX ON public.whatsapp_messages(tenant_id, phone, created_at);
GRANT SELECT ON public.whatsapp_messages TO authenticated; GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY wa_members_read ON public.whatsapp_messages FOR SELECT TO authenticated USING(tenant_id IS NOT NULL AND public.is_member(tenant_id));