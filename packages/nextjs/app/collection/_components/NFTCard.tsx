import { Collectible } from "./CollectionInfo";
import { Address } from "~~/components/scaffold-eth";

export const NFTCard = ({ nft }: { nft: Collectible }) => {
  return (
    <div className="card card-compact bg-base-100 shadow-lg w-[300px] shadow-secondary">
      <figure className="relative">
        {/* eslint-disable-next-line  */}
        <img src={nft.image} alt="NFT Image" className="h-60 min-w-full object-cover" />
        <figcaption className="glass absolute bottom-4 left-4 p-4 rounded-xl">
          <span className="text-white font-bold">#{nft.id}</span>
        </figcaption>
      </figure>
      <div className="card-body space-y-3">
        <div className="flex items-center justify-center">
          <p className="text-xl p-0 m-0 font-semibold text-center">{nft.name}</p>
        </div>
        <div className="flex flex-col justify-center mt-1">
          <div className="flex items-center space-x-2 justify-center">
            <span className="text-sm font-semibold text-gray-600">Owner:</span>
            <Address address={nft.owner} size="sm" />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="badge badge-outline">Token #{nft.id}</div>
        </div>
      </div>
    </div>
  );
};
