import { PayEmbed, darkTheme } from "thirdweb/react";
import React from "react";
import CopySnippet from "@/components/feature/CopySnippet";

function useIsMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}

export default function PayEmbedWidget({
  client,
  chain,
  tokenSymbol,
  tokenName,
  tokenAddress,
  chainIdParam,
  isMobile = false,
  showCopySnippet = true,
  theme,
  hideTitle = false,
}: {
  client: any;
  chain: any;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  chainIdParam: string | number;
  isMobile?: boolean;
  showCopySnippet?: boolean;
  theme?: any;
  hideTitle?: boolean;
}) {
  // Responsive height: 280px for mobile, 400px for desktop
  const [height, setHeight] = React.useState(400);
  React.useEffect(() => {
    function handleResize() {
      setHeight(window.innerWidth < 640 ? 280 : 400);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={isMobile ? "block mb-6" : "sticky top-24 p-0 bg-transparent"}>
      {!hideTitle && (
        <div className="py-1 px-3">
          <h3 className="text-base font-bold py-2">Buy ${tokenSymbol}</h3>
        </div>
      )}
      <div className="w-full" style={{ height, backgroundColor: theme?.colors?.modalBg || "black" }}>
        <PayEmbed
          client={client}
          payOptions={{
            mode: "fund_wallet",
            metadata: {
              name: `Buy $${tokenSymbol}`,
            },
            prefillBuy: {
              chain: chain,
              token: {
                name: tokenName,
                symbol: tokenSymbol,
                address: tokenAddress,
              },
              amount: "1",
              allowEdits: {
                token: false,
                chain: false,
                amount: true,
              },
            },
          }}
          theme={theme ? darkTheme(theme) : darkTheme({
            colors: {
              modalBg: "black",
              borderColor: "#151515",
              separatorLine: "#151515",
              skeletonBg: "#151515",
              primaryText: "#FFFFFF",
              secondaryText: "#999999",
              selectedTextColor: "#FFFFFF",
              selectedTextBg: "#3861FB",
              primaryButtonBg: "#3861FB",
              primaryButtonText: "#FFFFFF",
              secondaryButtonBg: "#151515",
              secondaryButtonText: "#FFFFFF",
              secondaryButtonHoverBg: "#222222",
              accentButtonBg: "#3861FB",
              accentButtonText: "#FFFFFF",
              secondaryIconColor: "#999999",
              secondaryIconHoverColor: "#FFFFFF",
              accentText: "#3861FB",
            },
          })}
          style={{
            width: "100%",
            height,
            backgroundColor: theme?.colors?.modalBg || "black",
          }}
        />
      </div>
      {showCopySnippet && (
        <>
         
          <CopySnippet
            chainIdParam={chainIdParam}
            tokenName={tokenName}
            tokenSymbol={tokenSymbol}
            tokenAddress={tokenAddress}
          />
        </>
      )}
    </div>
  );
}
