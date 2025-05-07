export interface NFT {
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
