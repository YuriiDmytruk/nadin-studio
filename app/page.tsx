import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Settings } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 p-6">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hello Nadin!!!
          </h1>
          <p className="text-2xl text-slate-700">This will be your perfect web site!</p>
          <p className="text-2xl text-slate-700">I very love you!!!</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/products">
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Package className="h-5 w-5 mr-2" />
              Go to Products
            </Button>
          </Link>

          <Link href="/admin">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[200px] h-14 text-lg border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-700 font-semibold transition-all"
            >
              <Settings className="h-5 w-5 mr-2" />
              Go to Admin
            </Button>
          </Link>
        </div>

        {isLoggedIn && (
          <div className="pt-8">
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}
