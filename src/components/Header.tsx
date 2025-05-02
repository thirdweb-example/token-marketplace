import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-[#151515] bg-black">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center justify-center text-2xl font-bold"
            >
              <h1>thirdweb</h1>
            </Link>
           
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton
              client={client}
              appMetadata={{
                name: "thirdweb App",
                url: "https://example.com",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
