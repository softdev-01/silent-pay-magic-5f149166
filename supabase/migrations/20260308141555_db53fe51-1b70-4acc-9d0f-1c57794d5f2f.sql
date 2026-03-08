
-- Drop the overly permissive insert policy
DROP POLICY "Service role can insert notifications" ON public.payment_notifications;

-- Replace with a restrictive policy - only the invoice provider can insert
CREATE POLICY "Insert via invoice provider"
  ON public.payment_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payment_notifications.invoice_id
        AND invoices.provider_id = payment_notifications.provider_id
    )
  );
