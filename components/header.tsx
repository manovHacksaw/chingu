import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Pen, Settings } from "lucide-react"
import { checkUser } from "@/lib/check-user"

const Header = async() => {
  await checkUser();
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">Chingu</span>
        </Link>

        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton forceRedirectUrl={"/dashboard"}>
              <Button variant="outline" className="rounded-full bg-transparent">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href={"/dashboard"}>
            <Button variant={"outline"}> <LayoutDashboard/>
            <span> Dashboard</span> 
            </Button>
            </Link>
            <Link href={"/transaction/create"}>
            <Button ><Pen/> <span> Add Transaction</span> </Button>

            </Link>
            <Link href={"/settings"}>
            <Button variant={"outline"}> <Settings/>
            <span> Settings</span>
            </Button>
            </Link>
            <UserButton  appearance={{elements: {
              avatarBox: "w-14 h-14"
            }}}/>
          </SignedIn>
        </div>
      </nav>
    </header>
  )
}

export default Header
