"use client"
import PayEmbedWidget from "@/components/feature/PayEmbedWidget"
import { defineChain } from "thirdweb"

const HomePayModal = ({
  open,
  onClose,
  token,
  client,
}: { open: boolean; onClose: () => void; token: any; client: any }) => {
  if (!open || !token) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-[#232329] bg-[#111] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-[#232329] shrink-0">
          <span className="text-base font-bold text-white">Buy</span>
          <button
            className="text-gray-400 hover:text-white text-xl font-bold transition-colors duration-150 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3861FB]"
            onClick={onClose}
            aria-label="Close"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-auto flex-1">
          <div className="bg-[#111] rounded-2xl overflow-hidden">
            <PayEmbedWidget
              client={client}
              chain={defineChain(token.chainId)}
              tokenSymbol={token.symbol}
              tokenName={token.name}
              tokenAddress={token.address}
              chainIdParam={token.chainId}
              isMobile={false}
              showCopySnippet={false}
              theme={{
                colors: {
                  modalBg: "#111",
                  borderColor: "#232329",
                  separatorLine: "#232329",
                  skeletonBg: "#18181b",
                  primaryText: "#fff",
                  secondaryText: "#aaa",
                  selectedTextColor: "#fff",
                  selectedTextBg: "#3861FB",
                  primaryButtonBg: "#3861FB",
                  primaryButtonText: "#fff",
                  secondaryButtonBg: "#232329",
                  secondaryButtonText: "#fff",
                  secondaryButtonHoverBg: "#232329",
                  accentButtonBg: "#3861FB",
                  accentButtonText: "#fff",
                  secondaryIconColor: "#aaa",
                  secondaryIconHoverColor: "#fff",
                  accentText: "#3861FB",
                },
              }}
              hideTitle={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePayModal
