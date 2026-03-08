
-- Table to store payment notifications for providers
CREATE TABLE public.payment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL,
  payer_name text NOT NULL,
  payer_email text,
  invoice_number text NOT NULL,
  service_name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  paid_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Providers can view their own notifications
CREATE POLICY "Providers can view own notifications"
  ON public.payment_notifications FOR SELECT
  USING (auth.uid() = provider_id OR has_role(auth.uid(), 'admin'::app_role));

-- Providers can update (mark as read)
CREATE POLICY "Providers can update own notifications"
  ON public.payment_notifications FOR UPDATE
  USING (auth.uid() = provider_id);

-- Public insert (for edge function using service role)
CREATE POLICY "Service role can insert notifications"
  ON public.payment_notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for payment_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_notifications;
