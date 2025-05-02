import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TokenHeader({
  tokenData,
  tokenSymbol,
  tokenName,
}: {
  tokenData: any;
  tokenSymbol: string;
  tokenName: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#232329] bg-black text-white text-base font-medium hover:bg-[#18181b] transition">
          <ArrowLeft className="h-5 w-5" />
          Back to Explore
        </Link>
      </div>
      <div className="flex items-center gap-4 mb-4">
        {tokenData?.tokenLogo ? (
          <Image
            src={tokenData.tokenLogo}
            alt={`${tokenSymbol} token icon`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/36/8247E5/FFFFFF?text=${tokenSymbol.charAt(0)}`;
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-[#8247E5] flex items-center justify-center text-white text-xl font-bold">
            {tokenSymbol.charAt(0)}
          </div>
        )}
        <span className="text-gray-300 text-base font-semibold mr-1">{tokenSymbol}</span>
        <span className="text-white text-lg font-bold px-1 py-1 rounded-md">{tokenName}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-extrabold text-white">${tokenData?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</span>
        <span className={`text-base font-semibold px-3 py-1 rounded-full ${
          (tokenData?.priceChange24h ?? 0) >= 0
            ? "bg-green-900/80 text-green-300"
            : "bg-red-900/80 text-red-400"
        }`}>
          {(tokenData?.priceChange24h ?? 0) >= 0 ? "+" : ""}{(tokenData?.priceChange24h ?? 0).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
