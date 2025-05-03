"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"

function getPayEmbedCodeLines(
  chainIdParam: string | number,
  tokenName: string,
  tokenSymbol: string,
  tokenAddress: string,
) {
  return [
    [
      { type: "keyword", value: "import" },
      { type: "plain", value: " { " },
      { type: "identifier", value: "createThirdwebClient" },
      { type: "plain", value: " } " },
      { type: "keyword", value: "from" },
      { type: "plain", value: " " },
      { type: "string", value: '"thirdweb"' },
      { type: "plain", value: ";" },
    ],
    [
      { type: "keyword", value: "import" },
      { type: "plain", value: " { " },
      { type: "identifier", value: "PayEmbed" },
      { type: "plain", value: " } " },
      { type: "keyword", value: "from" },
      { type: "plain", value: " " },
      { type: "string", value: '"thirdweb/react"' },
      { type: "plain", value: ";" },
    ],
    [],
    [
      { type: "keyword", value: "import" },
      { type: "plain", value: " { " },
      { type: "identifier", value: "defineChain" },
      { type: "plain", value: " } " },
      { type: "keyword", value: "from" },
      { type: "plain", value: " " },
      { type: "string", value: '"thirdweb/chains"' },
      { type: "plain", value: ";" },
    ],
    [],
    [
      { type: "keyword", value: "const" },
      { type: "plain", value: " client = createThirdwebClient({" },
    ],
    [
      { type: "plain", value: "  clientId: " },
      { type: "string", value: '"...."' },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "});" }],
    [],
    [
      { type: "keyword", value: "const" },
      { type: "plain", value: " chain = defineChain(" },
      { type: "number", value: chainIdParam },
      { type: "plain", value: ");" },
    ],
    [],
    [
      { type: "keyword", value: "function" },
      { type: "plain", value: " Example() {" },
    ],
    [
      { type: "plain", value: "  " },
      { type: "keyword", value: "return" },
      { type: "plain", value: " (" },
    ],
    [{ type: "plain", value: "    <PayEmbed" }],
    [{ type: "plain", value: "      client={client}" }],
    [{ type: "plain", value: "      payOptions={{" }],
    [
      { type: "plain", value: "        mode: " },
      { type: "string", value: '"fund_wallet"' },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "        prefillBuy: {" }],
    [{ type: "plain", value: "          chain: chain," }],
    [{ type: "plain", value: "          token: {" }],
    [
      { type: "plain", value: "            name: " },
      { type: "string", value: `"${tokenName}"` },
      { type: "plain", value: "," },
    ],
    [
      { type: "plain", value: "            symbol: " },
      { type: "string", value: `"${tokenSymbol}"` },
      { type: "plain", value: "," },
    ],
    [
      { type: "plain", value: "            address: " },
      { type: "string", value: `"${tokenAddress}"` },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "          }," }],
    [
      { type: "plain", value: "          amount: " },
      { type: "string", value: '"1"' },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "        }," }],
    [{ type: "plain", value: "      }}" }],
    [{ type: "plain", value: "    />" }],
    [{ type: "plain", value: "  );" }],
    [{ type: "plain", value: "}" }],
  ]
}

export default function CopySnippet({
  chainIdParam,
  tokenName,
  tokenSymbol,
  tokenAddress,
}: {
  chainIdParam: string | number
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const codeLines = getPayEmbedCodeLines(chainIdParam, tokenName, tokenSymbol, tokenAddress)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Lock body scroll when modal is open
    if (modalOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      document.body.style.overflow = ""
    }
  }, [modalOpen])

  function handleCopy() {
    const codeString = codeLines.map((line) => line.map((token) => token.value).join("")).join("\n")
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-black rounded-xl shadow-lg overflow-hidden my-4 w-full max-w-md mx-auto p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-1 text-white">Add widget to your site</h2>
      <p className="text-gray-400 text-sm sm:text-base mb-6">
        Integrate this crypto payment widget into your website or app to let your users easily buy and manage{" "}
        {tokenSymbol} tokens.
      </p>
      <button
        className="w-full flex items-center justify-center gap-2 bg-[#3861FB] hover:bg-[#2D4ECC] text-white font-semibold text-base rounded-lg py-3 transition"
        onClick={() => setModalOpen(true)}
      >
        Add widget <ExternalLink className="h-4 w-4" />
      </button>
      {modalOpen && (
        <div
          className={isMobile 
            ? "fixed inset-0 z-50 flex left-5 items-center justify-left bg-black/70 overflow-y-auto" 
            : "fixed inset-0 z-50 flex items-center justify-center bg-black/70"}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="rounded-xl border border-[#151515] bg-black shadow-2xl overflow-hidden"
            style={{ width: "380px", maxWidth: "calc(100vw - 32px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 border-b border-[#151515]">
              <span className="text-sm sm:text-base font-bold text-white">Widget Code Example</span>
              <button
                className="text-gray-400 hover:text-white text-xl font-bold transition-colors duration-150 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3861FB]"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                style={{ lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="bg-[#0D0D0D] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <pre className="p-4 text-xs sm:text-sm leading-relaxed font-mono text-gray-100 whitespace-pre">
                    {codeLines.map((line, i) => (
                      <div key={i} style={{ minWidth: "fit-content" }}>
                        {line.map((token, j) => {
                          let color = ""
                          if (token.type === "keyword") color = "text-purple-400"
                          else if (token.type === "string") color = "text-yellow-400"
                          else if (token.type === "number") color = "text-blue-400"
                          else if (token.type === "identifier") color = "text-pink-400"
                          else if (token.value === "|") color = "text-white"
                          else color = "text-gray-300"
                          return (
                            <span key={j} className={color}>
                              {token.value}
                            </span>
                          )
                        })}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    copied ? "bg-[#0D0D0D] text-white" : "bg-[#151515] text-gray-300 hover:bg-[#222222] hover:text-white"
                  }`}
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-4 h-4"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M16 8V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.0799 2 5.2V12.8C2 13.9201 2 14.4802 2.21799 14.908C2.40973 15.2843 2.71569 15.5903 3.09202 15.782C3.51984 16 4.0799 16 5.2 16H8M11.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V11.2C22 10.0799 22 9.51984 21.782 9.09202C21.5903 8.71569 21.2843 8.40973 20.908 8.21799C20.4802 8 19.9201 8 18.8 8H11.2C10.0799 8 9.51984 8 9.09202 8.21799C8.71569 8.40973 8.40973 8.71569 8.21799 9.09202C8 9.51984 8 10.0799 8 11.2V18.8C8 19.9201 8 20.4802 8.21799 20.908C8.40973 21.2843 8.71569 21.5903 9.09202 21.782C9.51984 22 10.0799 22 11.2 22Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {copied ? "Copied!" : isMobile ? "Copy code" : "Copy code snippet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
