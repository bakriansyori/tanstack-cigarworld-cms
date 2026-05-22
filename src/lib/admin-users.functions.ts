import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const CreateUserSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  display_name: z.string().trim().min(1).max(100),
  role: z.enum(['admin', 'editor']),
});

export const adminCreateUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId);
    if (rolesErr) throw new Error(rolesErr.message);
    const isAdmin = (roles ?? []).some((r) => r.role === 'admin');
    if (!isAdmin) throw new Error('Forbidden: admin only');

    // Create the user (auto-confirmed so they can log in immediately)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.display_name },
    });
    if (createErr || !created.user) throw new Error(createErr?.message ?? 'Failed to create user');

    const newUserId = created.user.id;

    // handle_new_user trigger may have inserted a default role; reset to desired role
    await supabaseAdmin.from('user_roles').delete().eq('user_id', newUserId);
    const { error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUserId, role: data.role });
    if (roleErr) throw new Error(roleErr.message);

    // Ensure profile has display_name + email
    await supabaseAdmin
      .from('profiles')
      .upsert({ id: newUserId, email: data.email, display_name: data.display_name });

    return { id: newUserId };
  });

export const adminDeleteUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId);
    if (rolesErr) throw new Error(rolesErr.message);
    const isAdmin = (roles ?? []).some((r) => r.role === 'admin');
    if (!isAdmin) throw new Error('Forbidden: admin only');
    if (data.user_id === context.userId) throw new Error('Anda tidak bisa menghapus akun sendiri.');

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
