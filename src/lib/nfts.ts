export interface NFT {
  contract: any;
  extra_metadata: any;
  token_id: string;
  contract_address: string;
  name: string | null;
  image: string | null;
  chain_id: number;
  owner: string | null;
  collection_name?: string | null;
  price_usd?: number | null;
}

const CHAIN_ID_MAP: Record<string, number> = {
  ethereum: 1,
  base: 8453,
  polygon: 137,
};

// Curated popular collections per chain to display when no owner filter is provided
const FEATURED_CONTRACTS: Record<keyof typeof CHAIN_ID_MAP, string[]> = {
  // BAYC (Ethereum)
  ethereum: ["0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"],
  // BasePunks (Base)
  base: ["0x6b6e5d510a04ca69ed5e2f2e4c35a5f2c3798cc8"],
  // y00ts (Polygon)
  polygon: ["0x82335e525a7bf768993b6e91183588092086e1c0"],
};

// Temporary hard-coded sample NFTs to display while API access is sorted out.
export const DUMMY_NFTS: Record<keyof typeof CHAIN_ID_MAP, NFT[]> = {
  ethereum: Array.from({ length: 15 }).map((_, i) => ({
    token_id: String(i),
    contract_address: FEATURED_CONTRACTS.ethereum[0],
    name: `BAYC #${i}`,
    image: `https://picsum.photos/seed/eth${i}/400/400`,
    chain_id: CHAIN_ID_MAP.ethereum,
    owner: null,
    collection_name: "Bored Ape Yacht Club",
  })),
  base: Array.from({ length: 15 }).map((_, i) => ({
    token_id: String(i),
    contract_address: FEATURED_CONTRACTS.base[0],
    name: `BasePunk #${i}`,
    image: `https://picsum.photos/seed/base${i}/400/400`,
    chain_id: CHAIN_ID_MAP.base,
    owner: null,
    collection_name: "Base Punks",
  })),
  polygon: Array.from({ length: 15 }).map((_, i) => ({
    token_id: String(i),
    contract_address: FEATURED_CONTRACTS.polygon[0],
    name: `y00t #${i}`,
    image: `https://picsum.photos/seed/poly${i}/400/400`,
    chain_id: CHAIN_ID_MAP.polygon,
    owner: null,
    collection_name: "y00ts",
  })),
};

interface FetchNFTParams {
  chain: keyof typeof CHAIN_ID_MAP;
  owner?: string; // wallet address
  cursor?: string; // used as page number for Insight API
  limit?: number;
}

interface FetchNFTResponse {
  nfts: NFT[];
  nextCursor: string | null;
}

export async function fetchNFTs({
  chain,
  owner,
  cursor,
  limit = 20,
}: FetchNFTParams): Promise<FetchNFTResponse> {
  const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
  if (!clientId) {
    console.warn("NEXT_PUBLIC_TEMPLATE_CLIENT_ID is missing");
    return { nfts: [], nextCursor: null };
  }

  const chainId = CHAIN_ID_MAP[chain];
  const page = cursor ? Number(cursor) : 0;

  try {
    let fetched: NFT[] = [];

    if (owner && owner.trim() !== "") {
      // Fetch NFTs by owner
      const params = new URLSearchParams();
      params.append("owner_address", owner);
      params.append("page", String(page));
      params.append("limit", String(limit));
      params.append("metadata", "true");

      const url = `https://${chainId}.insight.thirdweb.com/v1/${clientId}/nfts?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed ${res.status}`);
      const json = await res.json();

      fetched = (json.data || []).map((item: any) => ({
        token_id: item.token_id,
        contract_address: item.contract?.address ?? item.address,
        name: item.name ?? null,
        image: item.image_url ?? null,
        chain_id: item.contract?.chain_id ?? chainId,
        owner: owner,
        collection_name: null,
        price_usd: null,
      }));
    } else {
      // No owner – use dummy dataset for now
      const all = DUMMY_NFTS[chain];
      fetched = all.slice(page * limit, page * limit + limit);
    }

    // Determine if there might be a next page
    const nextCursor = fetched.length < limit ? null : String(page + 1);

    return { nfts: fetched, nextCursor };
  } catch (err) {
    console.error("fetchNFTs error", err);
    return { nfts: [], nextCursor: null };
  }
}

// NFT contract type and demo contract list
import type { Chain } from "thirdweb";
// TODO: Replace with actual chain imports if available
// import { avalancheFuji, polygonAmoy } from "./chains";

export type NftContract = {
  address: string;
  chain: Chain;
  chainId: number;
  type: "ERC1155" | "ERC721";
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  slug?: string;
};
import { avalancheFuji, polygonAmoy, sepolia } from "thirdweb/chains";

export type Token = {
  tokenAddress: string;
  symbol: string;
  icon: string;
};

export type SupportedTokens = {
  chain: Chain;
  chainId: number;
  tokens: Token[];
};
/**
 * Below is a list of all NFT contracts supported by your marketplace(s)
 * This is of course hard-coded for demo purpose
 * In reality, the list should be dynamically fetched from your own data source
 */
export const NFT_CONTRACTS: NftContract[] = [
  {
    address: "0x6b869a0cF84147f05a447636c42b8E53De65714E",
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    title: "Steakhouse: Liberatorz",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/bafybeigonh3hde5suwcb3qvkh6ljtvxv7ubfmcqbwfvi3ihoi3igd27jwe/SteakhouseLogo.svg",
    type: "ERC721",
  },
  {
    address: "0x1f9b349eE279ac7501DfacD757D0B82A3E52664f",
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    title: "MY TEST NFT COLLECTION",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/QmXwXpkhJhPhPoRGX4zBKYHiBAVtG3CcoUdYDhgz7jhdEw/QmeSzchzEPqCU1jwTnsipwcBAeH7S4bmVvFGfF65iA1BY1.png",
    type: "ERC721",
  },
  {
    address: "0xC5A2c72c581eA4A17e17bEeF38a9597132830401",
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    title: "Ugly Waifu",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/bafybeidaadqapi7twzd7pjp24tu4ngsr3teubrhop7hg3jk3oj6lqysfgm/OS-LOGO.png",
    slug: "ugly-waifu",
    type: "ERC721",
  },

  {
    address: "0x0896Db00D8987Fba2152aa7c14c4255eBC7354cE",
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    title: "Unnamed Collection",
    description: "",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/Qmct2vS78Uwug3zVtqQognskPPRmd4wRQiaDAQWt1kRJws/0.png",
    slug: "unnamed-collection",
    type: "ERC721",
  },
  {
    address: "0x0ACaCa3d3F64bb6e6D3564BBc891c58Bd4A4c83c",
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    title: "GoroBot",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/bafybeiay3ffxy3os56bvnu5cmq7gids4v6n4hf5nvvcb3gy2dzavi3ltnu/profile.jpg",
    slug: "gorobot",
    type: "ERC721",
  },
  {
    address: "0x4b6CDEFF5885A57678261bb95250aC43aD490752",
    chain: polygonAmoy,
    chainId: polygonAmoy.id,
    title: "Mata NFT",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/bafybeidec7x6bptqmrxgptaedd7wfwxbsccqfogzwfsd4a7duxn4sdmnxy/0.png",
    type: "ERC721",
  },
  {
    address: "0xd5e815241882676F772A624E3892b27Ff3a449c4",
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    title: "Cats (ERC1155)",
    thumbnailUrl:
      "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/bafybeif2nz6wbwuryijk2c4ayypocibexdeirlvmciqjyvlzz46mzoirtm/0.png",
    type: "ERC1155",
  },
];

export const SUPPORTED_TOKENS: SupportedTokens[] = [
  {
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    tokens: [
      {
        tokenAddress: "0x5425890298aed601595a70ab815c96711a31bc65",
        symbol: "USDC",
        icon: "/erc20-icons/usdc.png",
      },
      {
        tokenAddress: "0x82dcec6aa3c8bfe2c96d40d8805ee0da15708643",
        symbol: "USDT",
        icon: "/erc20-icons/usdt.png",
      },
      // Add more ERC20 here...
    ],
  },

  {
    chain: polygonAmoy,
    chainId: polygonAmoy.id,
    tokens: [
      {
        tokenAddress: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
        symbol: "USDC",
        icon: "/erc20-icons/usdc.png",
      },
      {
        tokenAddress: "0xbcf39d8616d15fd146dd5db4a86b4f244a9bc772",
        symbol: "USDT",
        icon: "/erc20-icons/usdt.png",
      },
    ],
  },

  {
    chain: sepolia,
    chainId: sepolia.id,
    tokens: [
      {
        tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        symbol: "USDC",
        icon: "/erc20-icons/usdc.png",
      },
      {
        tokenAddress: "0x36160274b0ed3673e67f2ca5923560a7a0c523aa",
        symbol: "USDT",
        icon: "/erc20-icons/usdt.png",
      },
    ],
  },
];

export const MARKETPLACE_CONTRACTS = [
  {
    chain: avalancheFuji,
    chainId: avalancheFuji.id,
    address: "0xd7f97C44d01F6E380a847a7099704271E406A2e4",
  
  }
]