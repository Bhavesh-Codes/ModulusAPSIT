import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single()

  if (communityError || !community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  const { data: memberData } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const systemRole = userProfile?.role || 'faculty'
  const isGlobalViewer = systemRole.toLowerCase() === 'hod' || systemRole.toLowerCase() === 'dev'

  // Give global viewers a mock 'peer' membership if they don't have one, or if they are pending.
  let activeMembership = memberData ? { role: memberData.role } : null
  if (isGlobalViewer && (!activeMembership || activeMembership.role === 'pending')) {
    activeMembership = { role: 'peer' }
  }

  return NextResponse.json({
    ...community,
    membership: activeMembership
  })
}
