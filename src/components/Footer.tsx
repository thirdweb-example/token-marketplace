import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black py-8 border-t border-[#232329]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold mb-2 text-white">thirdweb</div>
            <p className="text-gray-400 text-sm">© 2025 thirdweb. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 