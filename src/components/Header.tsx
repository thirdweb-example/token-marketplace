import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";
import { Search, Github } from "lucide-react";
import RewardTokenDisplay from "@/components/feature/RewardTokenDisplay";

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
            <RewardTokenDisplay />
            <a
              href="https://github.com/thirdweb-example/token-marketplace"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="flex items-center"
            >
              <Button variant="outline" size="lg" className="flex items-center gap-2 px-3 py-1 border-white text-white bg-transparent hover:bg-white/10">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </Button>
            </a>
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
