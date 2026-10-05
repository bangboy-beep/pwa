-- 004_review_schema.sql
CREATE TABLE IF NOT EXISTS public.business_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_review_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS business_reviews_business_id_key ON public.business_reviews (business_id);
CREATE INDEX IF NOT EXISTS business_reviews_business_id_idx ON public.business_reviews (business_id);

CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active business reviews"
  ON public.business_reviews FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_reviews.business_id
      AND businesses.status = 'active'
    )
  );

CREATE POLICY "Allow authenticated business members to read reviews"
  ON public.business_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_members.business_id = business_reviews.business_id
      AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow owner and admin to insert reviews"
  ON public.business_reviews FOR INSERT
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Allow owner and admin to update reviews"
  ON public.business_reviews FOR UPDATE
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Allow owner and admin to delete reviews"
  ON public.business_reviews FOR DELETE
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );
