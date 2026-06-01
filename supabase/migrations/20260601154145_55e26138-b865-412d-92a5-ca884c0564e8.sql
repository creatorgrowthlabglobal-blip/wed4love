
CREATE OR REPLACE FUNCTION public.consume_call_credit(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _normalized TEXT := lower(trim(_email));
  _ok BOOLEAN := false;
BEGIN
  IF _normalized IS NULL OR _normalized = '' THEN
    RETURN false;
  END IF;

  UPDATE public.entitlements
  SET used_calls = used_calls + 1,
      updated_at = now()
  WHERE email = _normalized
    AND paid_calls > used_calls
  RETURNING true INTO _ok;

  RETURN COALESCE(_ok, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_call_credit(TEXT) TO anon, authenticated;
