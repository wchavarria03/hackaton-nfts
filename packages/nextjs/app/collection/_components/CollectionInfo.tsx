"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible {
  id: number;
  uri: string;
  owner: string;
  image: string;
  name: string;
}

interface CollectionStats {
  totalSupply: number;
  uniqueOwners: Set<string>;
  tokensPerOwner: { [owner: string]: number };
}

export const CollectionInfo = () => {
  const [allNfts, setAllNfts] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CollectionStats>({
    totalSupply: 0,
    uniqueOwners: new Set(),
    tokensPerOwner: {},
  });

  const { data: se2NftContract } = useScaffoldContract({
    contractName: "SE2NFT",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "SE2NFT",
    functionName: "totalSupply",
    watch: true,
  });

  const { data: tokenIdCounter } = useScaffoldReadContract({
    contractName: "SE2NFT",
    functionName: "tokenIdCounter",
    watch: true,
  });

  useEffect(() => {
    const updateCollectionInfo = async (): Promise<void> => {
      if (totalSupply === undefined || se2NftContract === undefined) return;

      setLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const uniqueOwners = new Set<string>();
      const tokensPerOwner: { [owner: string]: number } = {};

      for (let tokenIndex = 0; tokenIndex < parseInt(totalSupply.toString()); tokenIndex++) {
        try {
          const tokenId = await se2NftContract.read.tokenByIndex([BigInt(tokenIndex)]);
          const tokenURI = await se2NftContract.read.tokenURI([tokenId]);
          const owner = await se2NftContract.read.ownerOf([tokenId]);

          const tokenMetadata = await fetch(tokenURI);
          const metadata = await tokenMetadata.json();

          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: tokenURI,
            owner,
            image: metadata.image,
            name: metadata.name,
          });

          // Update statistics
          uniqueOwners.add(owner);
          tokensPerOwner[owner] = (tokensPerOwner[owner] || 0) + 1;
        } catch (e) {
          notification.error("Error fetching collection data");
          setLoading(false);
          console.log(e);
        }
      }

      collectibleUpdate.sort((a, b) => a.id - b.id);
      setAllNfts(collectibleUpdate);
      setStats({
        totalSupply: parseInt(totalSupply.toString()),
        uniqueOwners,
        tokensPerOwner,
      });
      setLoading(false);
    };

    updateCollectionInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSupply]);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="w-full max-w-6xl">
      {/* Collection Statistics */}
      <div className="bg-base-100 rounded-2xl p-6 mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">Collection Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Supply Card */}
          <div className="stat bg-primary text-primary-content rounded-lg">
            <div className="stat-title text-primary-content/70">Total Supply</div>
            <div className="stat-value">{stats.totalSupply}</div>
            <div className="stat-desc text-primary-content/70">
              {tokenIdCounter ? `Next Token ID: ${tokenIdCounter.toString()}` : "Loading..."}
            </div>
          </div>

          {/* Unique Owners Card */}
          <div className="stat bg-secondary text-secondary-content rounded-lg">
            <div className="stat-title text-secondary-content/70">Unique Owners</div>
            <div className="stat-value">{stats.uniqueOwners.size}</div>
            <div className="stat-desc text-secondary-content/70">
              {stats.totalSupply > 0
                ? `${((stats.uniqueOwners.size / stats.totalSupply) * 100).toFixed(1)}% distribution`
                : "No tokens minted"}
            </div>
          </div>

          {/* Average Ownership Card */}
          <div className="stat bg-accent text-accent-content rounded-lg">
            <div className="stat-title text-accent-content/70">Avg. per Owner</div>
            <div className="stat-value">
              {stats.uniqueOwners.size > 0 ? (stats.totalSupply / stats.uniqueOwners.size).toFixed(1) : "0"}
            </div>
            <div className="stat-desc text-accent-content/70">Tokens per unique owner</div>
          </div>
        </div>

        {/* Top Holders */}
        {stats.totalSupply > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Top Holders</h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Owner</th>
                    <th>Tokens Owned</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.tokensPerOwner)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([owner, count], index) => (
                      <tr key={owner}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="font-mono text-sm">
                            {owner.slice(0, 6)}...{owner.slice(-4)}
                          </div>
                        </td>
                        <td>{count}</td>
                        <td>{((count / stats.totalSupply) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* All NFTs Display */}
      <div className="bg-base-100 rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-center mb-6">All NFTs in Collection</h2>

        {allNfts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl text-gray-500">No NFTs have been minted yet.</p>
            <p className="text-sm text-gray-400 mt-2">Visit the ERC-721 tab to mint your first NFT!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {allNfts.map(item => (
              <NFTCard nft={item} key={item.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
