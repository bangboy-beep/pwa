-- 003_wifi_schema.sql
CREATE TABLE IF NOT EXISTS public.business_wifi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  ssid TEXT NOT NULL,
  password TEXT,
  security_type TEXT NOT NULL DEFAULT 'WPA2',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS business_wifi_business_id_key ON public.business_wifi (business_id);
CREATE INDEX IF NOT EXISTS business_wifi_business_id_idx ON public.business_wifi (business_id);

CREATE TRIGGER update_business_wifi_updated_at
  BEFORE UPDATE ON public.business_wifi
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.business_wifi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active business wifi"
  ON public.business_wifi FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_wifi.business_id
      AND businesses.status = 'active'
    )
  );

CREATE POLICY "Allow authenticated business members to read wifi"
  ON public.business_wifi FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_members.business_id = business_wifi.business_id
      AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow owner and admin to insert wifi"
  ON public.business_wifi FOR INSERT
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Allow owner and admin to update wifi"
  ON public.business_wifi FOR UPDATE
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Allow owner and admin to delete wifi"
  ON public.business_wifi FOR DELETE
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );
