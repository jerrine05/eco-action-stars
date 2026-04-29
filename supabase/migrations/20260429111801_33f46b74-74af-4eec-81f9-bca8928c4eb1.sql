-- Redemptions table
CREATE TABLE public.redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points_used INTEGER NOT NULL,
  amount_inr INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_redemptions_updated_at
BEFORE UPDATE ON public.redemptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atomic redeem function: deducts points and creates a redemption
CREATE OR REPLACE FUNCTION public.redeem_points(
  _points INTEGER,
  _payment_method TEXT,
  _payment_details TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _current_points INTEGER;
  _redemption_id UUID;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _points < 10000 THEN
    RAISE EXCEPTION 'Minimum redemption is 10,000 points';
  END IF;

  IF _points % 10000 <> 0 THEN
    RAISE EXCEPTION 'Points must be a multiple of 10,000';
  END IF;

  IF _payment_method NOT IN ('upi', 'bank') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF length(coalesce(_payment_details, '')) < 3 THEN
    RAISE EXCEPTION 'Payment details required';
  END IF;

  SELECT total_points INTO _current_points
  FROM public.profiles
  WHERE user_id = _user_id
  FOR UPDATE;

  IF _current_points IS NULL OR _current_points < _points THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  UPDATE public.profiles
  SET total_points = total_points - _points
  WHERE user_id = _user_id;

  INSERT INTO public.redemptions (user_id, points_used, amount_inr, payment_method, payment_details)
  VALUES (_user_id, _points, (_points / 10000) * 100, _payment_method, _payment_details)
  RETURNING id INTO _redemption_id;

  RETURN _redemption_id;
END;
$$;