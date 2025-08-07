"use client";

import { CollectionInfo } from "./_components/CollectionInfo";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const NFTsCollection: NextPage = () => {
  const { isConnected } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 text-center max-w-4xl">
          <h1 className="text-4xl font-bold">NFTs Collection</h1>
          <div className="mt-4">
            <p className="text-lg">
              Explore the complete collection of SE2 NFTs. This page provides an overview of the total supply,
              collection statistics, and all minted tokens in the SE2NFT collection.
            </p>
            <p className="text-base mt-2 text-gray-600">
              Each NFT in this collection is unique and represents one of the animal artworks from Austin
              Griffith&apos;s portfolio.
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
            <CollectionInfo />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
            <p className="text-xl font-bold mb-4">Please connect your wallet to view the collection.</p>
            <RainbowKitCustomConnectButton />
          </div>
        )}
      </div>
    </>
  );
};

export default NFTsCollection;
