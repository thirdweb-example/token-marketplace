import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";
import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-[#151515] bg-black">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/thirdweb.svg"
                alt="thirdweb"
                width={44}
                height={44}
              />
              <span className="text-xl font-semibold">Market</span>
            </Link>

            {/* Nav buttons */}
            <Link href="/" className="flex items-center">
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1a1a1a] text-white border-[#2a2a2a] hover:bg-[#2a2a2a]"
              >
                Tokens
              </Button>
            </Link>
            <Link href="/nfts" className="flex items-center">
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1a1a1a] text-white border-[#2a2a2a] hover:bg-[#2a2a2a]"
              >
                NFTs
              </Button>
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
