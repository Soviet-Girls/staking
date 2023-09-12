import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const { data: stakedTokens } = useContractRead(contract, "getStakeInfo", [
    address,
  ]);
  const { data: rewardsPerUnitTime } = useContractRead(contract, "getRewardsPerUnitTime");
  const { data: rewardTokenBalance } = useContractRead(contract, "getRewardTokenBalance");

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", [address]);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [[id]]);
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <p><a href="/">Главная</a> | <a href="/mint">Минтинг</a> | <a href="#">Инструкция</a></p>
      <h1 className={styles.h1}>☭ Soviet Girls Staking</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <ConnectWallet 
        btnTitle="Подключить кошелек"
        modalTitle="Выберите ваш кошелек"
        />
      ) : (
        <>
          <h2>Ваши токены</h2>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Доступно к выводу</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Загрузка..."
                    : "≈ " + ethers.utils.formatUnits(claimableRewards, 18).split(".")[0]}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Текущий баланс</h3>
              <p className={styles.tokenValue}>
                <b>≈ {tokenBalance?.displayValue.split(".")[0]}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Скорость добычи</h3>
              <p className={styles.tokenValue}>
                <b>
                  ≈ {stakedTokens &&
                   stakedTokens?._tokensStaked.length * 
                   Number(ethers.utils.formatUnits(rewardsPerUnitTime, 18))}
                </b>{" "}
                {tokenBalance?.symbol} в час
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Монет в пуле</h3>
              <p className={styles.tokenValue}>
                <b>
                  ≈ {rewardTokenBalance &&
                   ethers.utils.formatUnits(rewardTokenBalance, 18).split(".")[0]}
                </b>{" "}{tokenBalance?.symbol}
              </p>
            </div>
          </div>
          

          <Web3Button
            action={(contract) => contract.call("claimRewards")}
            contractAddress={stakingContractAddress}
          >
            <h3>Вывести вознаграждение</h3>
          </Web3Button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>NFT в стейкинге</h2>
          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => (
                <NFTCard
                  tokenId={stakedToken.toNumber()}
                  key={stakedToken.toString()}
                />
              ))}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>NFT не в стейкинге</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name} #{nft.metadata.id}</h3>
                <Web3Button
                  contractAddress={stakingContractAddress}
                  action={() => stakeNft(nft.metadata.id)}
                >
                  Отправить в стейкинг
                </Web3Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Stake;
