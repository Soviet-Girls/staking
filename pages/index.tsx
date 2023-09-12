import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

import {
  tokenContractAddress
} from "../consts/contractAddresses";

const Home: NextPage = () => {
  const router = useRouter();

  
async function addTokenFunction() {
  if (window.ethereum.networkVersion !== 137) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: 137 }]
      });
    } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: 'Polygon Mainnet',
              chainId: 137,
              nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
              rpcUrls: ['https://polygon-rpc.com/']
            }
          ]
        });
      }
    }
  }
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', 
        options: {
          address: tokenContractAddress, 
          symbol: "SG₽", 
          decimals: 18, 
          image: "https://ipfs.io/ipfs/bafybeiguitp5g5hatmwugngihtkkukvcmnt2y22vwaqzyp3gl752poaipq/%D0%91%D0%B5%D0%B7%20%D0%B8%D0%BC%D0%B5%D0%BD%D0%B8-1.png", 
        },
      },
    });
    if (wasAdded) {
      alert("Монета добавлена");
    } else {
      alert("Монета не добавлена");
    }
  } catch (error) {
    console.log(error);
  }
  }

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>☭ Soviet Girls Ruble</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <p className={`${styles.tokenInfo}`}>
        Сеть: Polygon
        <br />
        Адрес: {tokenContractAddress}
        <br />
        Символ: SG₽
        <br />
        Число десятичных знаков: 18
      </p>
      <button onClick={addTokenFunction}>Добавить в Metamask</button>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <div className={styles.nftBoxGrid}>

        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(`/mint`)}
        >
          {/* Mint a new NFT */}
          <Image src="/icons/drop.webp" alt="drop" width={64} height={64} />
          <h2 className={styles.selectBoxTitle}>Минтинг SG₽</h2>
          <p className={styles.selectBoxDescription}>
            Примите участие в запуске Soviet Girls Ruble! Приобретите SG₽ за MATIC по фиксированному курсу.
          </p>
        </div>

        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(`/stake`)}
        >
          {/* Staking an NFT */}
          <Image src="/icons/token.webp" alt="token" width={64} height={64} />
          <h2 className={styles.selectBoxTitle}>Кабинет стейкинга</h2>
          <p className={styles.selectBoxDescription}>
            Отправьте ваши NFT из коллекции Soviet Girls на хранение и получайте награды!
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;
