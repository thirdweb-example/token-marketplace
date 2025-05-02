import React, { useState } from "react";
import { ExternalLink } from "lucide-react";

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
  ];
}

export default function CopySnippet({
  chainIdParam,
  tokenName,
  tokenSymbol,
  tokenAddress,
}: {
  chainIdParam: string | number;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeLines = getPayEmbedCodeLines(chainIdParam, tokenName, tokenSymbol, tokenAddress);

  function handleCopy() {
    const codeString = codeLines.map(line => line.map(token => token.value).join("")).join("\n");
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-[#000] rounded-xl shadow-lg overflow-hidden my-4 w-full max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-1 text-white">Add widget to your site</h2>
      <p className="text-gray-400 text-base mb-6">Integrate this crypto payment widget into your website or app to let your users easily buy and manage{tokenSymbol} tokens.</p>
      <button
        className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-base rounded-lg py-3 transition"
        onClick={() => setModalOpen(true)}
      >
        Add widget <ExternalLink className="h-4 w-4" />
      </button>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-2xl mx-4 rounded-xl border border-[#232329] bg-[#111] shadow-2xl p-0">
            <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-[#232329]">
              <span className="text-base font-bold text-white">Widget Code Example</span>
              <button
                className="text-gray-400 hover:text-white text-xl font-bold transition-colors duration-150 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3861FB]"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                style={{ lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <pre className="p-6 text-sm leading-relaxed font-mono text-gray-100 bg-transparent whitespace-pre-wrap break-words w-full">
              {codeLines.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-words">
                  {line.map((token, j) => {
                    let color = "";
                    if (token.type === "keyword") color = "text-purple-400";
                    else if (token.type === "string") color = "text-yellow-400";
                    else if (token.type === "number") color = "text-blue-400";
                    else if (token.type === "identifier") color = "text-pink-400";
                    else if (token.value === "|") color = "text-white";
                    else color = "text-gray-300";
                    return <span key={j} className={color}>{token.value}</span>;
                  })}
                </div>
              ))}
            </pre>
            <div className="flex justify-end px-6 pb-6">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${copied ? 'bg-black text-white' : 'bg-[#232329] text-gray-300 hover:bg-[#333] hover:text-white'}`}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><rect x="3" y="3" width="13" height="13" rx="2" /></svg>
                )}
                {copied ? "Copied!" : "Copy code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
