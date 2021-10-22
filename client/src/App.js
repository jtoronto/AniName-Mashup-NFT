import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import loadingSpinner from "./assets/loading-waiting.gif";
import AniNameMash from "./utils/AniNameMash.json";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const TWITTER_HANDLE = "jtoronto34";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/anime-name-mash-nft";
var TOTAL_MINT_COUNT = 0; //Literally only using these for console.log right now since state doesn't update immediately,
var MAX_COUNT = 0


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [connectedToWrongNetwork, setConnectedToWrongNetwork] = useState(true);
  const [totalMintCount, setTotalMintCount] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [currentlyMining, setCurrentlyMining] = useState(false);

  const [randomCatImage, setRandomCatImage] = useState();
  //const CONTRACT_ADDRESS = "0x14cB57c69D3F8BfE8aB6213Bb2F97eaF5fb98799"; //Ganache local
  const CONTRACT_ADDRESS = "0x30D0AF864900DAb72CA98557ad6979fD14b30354"; //Rinkeby 

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(accounts[0]);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId === rinkebyChainId) {
        setConnectedToWrongNetwork(false);
      }
      
      //setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
    } catch (error) {
      console.log(error);
    }
  };
  // Setup our listener.
  const setupWalletEventListener = async () =>{

    try {
      const { ethereum } = window;

      if (ethereum) {
        //Set up wallet chain listener  
        ethereum.on('chainChanged', (_chainId) => {
          console.log('user chain changed to', _chainId);
          window.location.reload()}
        );
        //set up account chain listener
        ethereum.on('accountsChanged', (_accounts) => window.location.reload());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };


  const setupNFTMinedEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
       
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          AniNameMash.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        
        connectedContract.on("NewAniMashMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          getTotalNFTsMintedSoFar();
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalNFTsMintedSoFar = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          AniNameMash.abi,
          provider
        );

       TOTAL_MINT_COUNT = (await connectedContract.getTotalMintCount()).toNumber();
        setTotalMintCount(TOTAL_MINT_COUNT);
        console.log("Total mint count:", TOTAL_MINT_COUNT);

        MAX_COUNT = (await connectedContract.maxTokens()).toNumber();
        setMaxTokens(MAX_COUNT);
        console.log("Max allowed tokens", MAX_COUNT);

      } else {
        //MAX_COUNT = (await connectedContract.maxTokens()).toNumber();
        
        
        
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          AniNameMash.abi,
          signer
        );

        if (TOTAL_MINT_COUNT >= MAX_COUNT){
          alert("Sorry but the maximum amount of tokens has already been minted");
          return;
        }

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnAniMashNFT();
        setupNFTMinedEventListener();

        console.log("Mining...please wait.");
        setCurrentlyMining(true);
        await nftTxn.wait();
        setCurrentlyMining(false);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    setupWalletEventListener();
    getTotalNFTsMintedSoFar();
  }, []);

  /*
   * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
   */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {
             connectedToWrongNetwork && (
              <div className="connectedIndicator">
                You aren't connected to the rinkeby network
              </div>
             )

          }
          
          <p className="header gradient-text">Anime Name Mashup</p>
          <p className="sub-text">
            Mash up 3 anime character names and enjoy as an NFT.
          </p>
          {currentAccount === "" ? (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button"
            >
              Connect to Wallet
            </button>
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
          <div style={{color: 'white', paddingTop: '20px'}}>{totalMintCount} of {maxTokens} tokens minted!</div>
          {
            currentlyMining &&(<div className="miningIndicator">
            <div style={{paddingBottom: '30px'}}>Mining, please wait...</div>
            <div><img src={loadingSpinner} height="100" width="100" /></div>

          </div>)
          }
           
        </div>
        <div className="footer-container">
        
        <a href={OPENSEA_LINK} 
          target="_blank"
          rel="noopener noreferrer">
            <button
            style={{bottom:'20px'}}
              className="cta-button connect-wallet-button">
                  See the collection on OpenSea  
                   </button>  </a>
          <div style={{display:"flex",
                      paddingTop:'50px'}}>
                          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
                            <a
                              className="footer-text"
                              href={TWITTER_LINK}
                              target="_blank"
                              rel="noreferrer"
                            >{`built by @${TWITTER_HANDLE}`}</a></div>
        </div>
      </div>
    </div>
  );
};

export default App;
