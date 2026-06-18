import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  try {
    // Require a valid session — only logged-in admins may invite
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    // Require the caller to be an active superadmin officer — getUser() above
    // only proves they're *logged in*, not that they're allowed to invite.
    const { data: callerOfficer, error: officerErr } = await callerClient
      .from('officers').select('role, status').eq('email', user.email).eq('status', 'active').single();
    if (officerErr || callerOfficer?.role !== 'superadmin') return json({ error: 'Forbidden — superadmin only' }, 403);

    const { email, redirectTo } = await req.json();
    if (!email) return json({ error: 'email is required' }, 400);

    // Admin client — service role key is injected automatically by Supabase
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo ?? undefined,
    });

    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
