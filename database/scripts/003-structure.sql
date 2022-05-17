CREATE TABLE public.waiting_list (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  queue TEXT NOT NULL,
  expire_at TIMESTAMP WITHOUT TIME ZONE
  CONSTRAINT invalid_queue CHECK (queue = '2' OR queue = '3')
);

COMMENT ON COLUMN public.waiting_list.id IS
$COMMENT$
  Unique identifyer of customer
$COMMENT$;

COMMENT ON COLUMN public.waiting_list.name IS
$COMMENT$
  Name of the customer
$COMMENT$;

COMMENT ON COLUMN public.waiting_list.queue IS
$COMMENT$
  Assigned queue
$COMMENT$;

COMMENT ON COLUMN public.waiting_list.expire_at IS
$COMMENT$
  Indicator of when will it get out of the queue
$COMMENT$;

CREATE FUNCTION public.tgf_serve_customer()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    EXECUTE pg_notify('serve_customer', OLD.queue);

    RETURN OLD;
END;
$BODY$;

ALTER FUNCTION public.tgf_serve_customer() OWNER TO u_initium;

COMMENT ON FUNCTION public.tgf_serve_customer() IS
$COMMENT$
  Trigger function to notify that a customer will be serve;
$COMMENT$;


CREATE TRIGGER tg_serve_customer
  BEFORE DELETE ON public.waiting_list
  FOR EACH ROW
  EXECUTE FUNCTION public.tgf_serve_customer();

SELECT cron.schedule('* * * * *', $CRON$ DELETE FROM waiting_list WHERE expire_at <= NOW() $CRON$);