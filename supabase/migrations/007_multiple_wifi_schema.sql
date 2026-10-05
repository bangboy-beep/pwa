-- 007_multiple_wifi_schema.sql
CREATE TABLE IF NOT EXISTS public.business_wifi_networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'WiFi Utama',
  ssid TEXT NOT NULL,
  password TEXT,
  security_type TEXT NOT NULL DEFAULT 'WPA2',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wifi_networks_business_id_idx ON public.business_wifi_networks (business_id);
CREATE INDEX IF NOT EXISTS wifi_networks_sort_order_idx ON public.business_wifi_networks (business_id, sort_order);

CREATE TRIGGER update_wifi_networks_updated_at
  BEFORE UPDATE ON public.business_wifi_networks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.business_wifi_networks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active wifi networks"
  ON public.business_wifi_networks FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_wifi_networks.business_id
      AND businesses.status = 'active'
    )
  );

CREATE POLICY "Allow authenticated business members to read wifi networks"
  ON public.business_wifi_networks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_members.business_id = business_wifi_networks.business_id
      AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow owner and admin to insert wifi networks"
  ON public.business_wifi_networks FOR INSERT
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Allow owner and admin to update wifi networks"
  ON public.business_wifi_networks FOR UPDATE
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Allow owner and admin to delete wifi networks"
  ON public.business_wifi_networks FOR DELETE
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );
