import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-4xl font-bold">Hello Nadin!!!</div>
      <div className="text-2xl">This will be your perfect web site!</div>
      <div className="text-2xl">I very love you!!!</div>
      {isLoggedIn && <LogoutButton />}
    </div>
  );
}
