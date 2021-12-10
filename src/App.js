import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { contract_address, contract_abi } from "./constants";
import getWeb3 from "./getWeb3";
import nftVideos from "./exportVideos";

export default function App() {
  const [contract, setcontract] = useState("");
  const [accounts, setaccounts] = useState();
  const [, setNftsJson] = useState([]);
  const [nftMetadata, setnftMetadata] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([
    {
      name: "Rare",
      price: "0.12BNB",
      totalSupply: 53,
      remainingSupply: 0,
      imgSrc: "https://hypeculture.net/storage/2021/10/rare-1-614x1024.png",
      srcSet: `  
     https://hypeculture.net/storage/2021/10/rare-1-614x1024.png  614w,
    https://hypeculture.net/storage/2021/10/rare-1-180x300.png   180w,
    https://hypeculture.net/storage/2021/10/rare-1-768x1280.png  768w,
    https://hypeculture.net/storage/2021/10/rare-1-922x1536.png  922w,
    https://hypeculture.net/storage/2021/10/rare-1-600x1000.png  600w,
    https://hypeculture.net/storage/2021/10/rare-1.png          1200w
  `,
    },
    {
      name: "Legendary",
      price: "0.24BNB",
      totalSupply: 25,
      remainingSupply: 0,

      imgSrc:
        "https://hypeculture.net/storage/2021/10/legendary-1-614x1024.png",
      srcSet: `    
    https://hypeculture.net/storage/2021/10/legendary-1-614x1024.png  614w,
    https://hypeculture.net/storage/2021/10/legendary-1-180x300.png   180w,
    https://hypeculture.net/storage/2021/10/legendary-1-768x1280.png  768w,
    https://hypeculture.net/storage/2021/10/legendary-1-922x1536.png  922w,
    https://hypeculture.net/storage/2021/10/legendary-1-600x1000.png  600w,
    https://hypeculture.net/storage/2021/10/legendary-1.png          1200w
  `,
    },
    {
      name: "Mythic",
      price: "0.49BNB",
      totalSupply: 13,
      remainingSupply: 0,
      imgSrc: "https://hypeculture.net/storage/2021/10/mythic-1-614x1024.png",
      srcSet: `  
    https://hypeculture.net/storage/2021/10/mythic-1-614x1024.png  614w,
    https://hypeculture.net/storage/2021/10/mythic-1-180x300.png   180w,
    https://hypeculture.net/storage/2021/10/mythic-1-768x1280.png  768w,
    https://hypeculture.net/storage/2021/10/mythic-1-922x1536.png  922w,
    https://hypeculture.net/storage/2021/10/mythic-1-600x1000.png  600w,
    https://hypeculture.net/storage/2021/10/mythic-1.png          1200w
  `,
    },
    {
      name: "Genesis",
      price: "0.75BNB",
      remainingSupply: 0,
      totalSupply: 9,
      imgSrc: "https://hypeculture.net/storage/2021/10/genesis-1-614x1024.png",
      srcSet: `
    https://hypeculture.net/storage/2021/10/genesis-1-614x1024.png  614w,
    https://hypeculture.net/storage/2021/10/genesis-1-180x300.png   180w,
    https://hypeculture.net/storage/2021/10/genesis-1-768x1280.png  768w,
    https://hypeculture.net/storage/2021/10/genesis-1-922x1536.png  922w,
    https://hypeculture.net/storage/2021/10/genesis-1-600x1000.png  600w,
    https://hypeculture.net/storage/2021/10/genesis-1.png          1200w
  `,
    },
  ]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  useEffect(() => {
    getWeb3Custom();
  }, []);

  const getWeb3Custom = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const instance = new web3.eth.Contract(contract_abi, contract_address);
    setcontract(instance);
    setaccounts(accounts);
    instance && accounts && getNftsByAddress(instance, accounts);
  };

  const getNftsByAddress = async (contract, accounts) => {
    let nftsId =
      accounts.length &&
      (await contract?.methods?.getNftsByAddress(accounts[0]).call());
    if (nftsId.length) {
      const uriArray = await Promise.all(
        nftsId.map(async (id) => {
          let uri = await contract?.methods?.getURI(id).call();
          const uriObj = { uri, id };
          return uriObj;
        })
      );
      setNftsJson(uriArray);
      if (uriArray.length) {
        const getMp4Url = await Promise.all(
          uriArray.map(async (uri) => {
            let uriRes = await fetch(uri.uri);
            uriRes = await uriRes.json();
            uriRes = { ...uriRes, uri: uri.uri, id: uri.id };
            return uriRes;
          })
        );
        setnftMetadata(getMp4Url);
      }
    }

    const modifiedPackage = await Promise.all(
      packages.map(async (packageObj) => {
        let modifiedObj = {};
        const supply =
          accounts.length &&
          (await contract?.methods?.getSupplyByType(packageObj.name).call());
        modifiedObj = {
          ...packageObj,
          remainingSupply: packageObj.totalSupply - supply,
        };
        return modifiedObj;
      })
    );
    modifiedPackage.length && setPackages(modifiedPackage);
    setLoading(false);
  };
  const connectToMetamask = async () => {
    window &&
      window.ethereum &&
      window.ethereum.request({ method: "eth_requestAccounts" });
  };

  window &&
    window.ethereum &&
    window.ethereum.on("accountsChanged", function (accounts) {
      // Time to reload your interface with accounts[0]!
      // contract && accounts &&  getNftsByAddress(contract ,accounts)
      window.location.reload();
    });

  const getBuyNft = async () => {
    if (selectedTypes.length < 1) {
      return;
    }
    // setLoading(true)
    let nftsPrice = await contract.methods
      .calculateNftPrice(selectedTypes)
      .call();
    if (nftsPrice < 1) {
      return;
    }
    await contract.methods
      .buyInBulk(selectedTypes)
      .send({ from: accounts[0], value: nftsPrice });

    setLoading(true);
    getNftsByAddress(contract, accounts);
  };

  const selectPackage = (name) => {
    if (selectedTypes.includes(name)) {
      const filteredPackages = selectedTypes.filter((pack) => pack !== name);
      setSelectedTypes(filteredPackages);
    } else {
      setSelectedTypes([...selectedTypes, name]);
    }
  };

  if (Loading) {
    return <ClipLoader color={"white"} loading={Loading} size={150} />;
  }
  return (
    <div>
      <div className="elementor-widget-container">
        {accounts && accounts.length ? (
          <div>
            <div className="elementor-widget-container">
              <div
                className="
        qodef-shortcode qodef-m qodef-section-title
        qodef-alignment--center "
                style={{ margin: "120px 0px" }}
              >
                <h1 className="qodef-m-title">Choose Bundles</h1>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <section
                className="
          elementor-section
          elementor-top-section
          elementor-element
          elementor-element-705fef1
          qodef-elementor-content-grid
          elementor-section-full_width
          elementor-section-content-middle
          elementor-section-height-default
          elementor-section-height-default
        "
                data-id="705fef1"
                data-element_type="section"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                  className="elementor-container elementor-column-gap-no"
                >
                  {packages.map((Package) => {
                    return (
                      <div
                        className="
              elementor-column
              elementor-col-285
              elementor-top-column
              elementor-element
              elementor-element-35e0623
            "
                        data-id="35e0623"
                        data-element_type="column"
                        style={{ marginRight: "35px", marginBottom: "40px" }}
                      >
                        <div
                          className="elementor-widget-wrap elementor-element-populated"
                          onClick={() => selectPackage(Package.name)}
                          style={
                            selectedTypes.includes(Package.name)
                              ? { border: "1px solid", cursor: "pointer" }
                              : { cursor: "pointer" }
                          }
                        >
                          <div
                            className="
                  elementor-element
                  elementor-element-2ec303a
                  elementor-widget
                  elementor-widget-eldon_core_numbered_text
                "
                            data-id="2ec303a"
                            data-element_type="widget"
                            data-widget_type="eldon_core_numbered_text.default"
                          >
                            <div className="elementor-widget-container">
                              <div
                                className="
                      qodef-shortcode qodef-m qodef-numbered-text
                    "
                              >
                                <div className="qodef-m-content">
                                  <h3 className="qodef-m-title">
                                    {" "}
                                    {Package.name}{" "}
                                  </h3>
                                  <h3 className="qodef-m-title">
                                    {" "}
                                    {Package.remainingSupply}/
                                    {Package.totalSupply}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="
                  elementor-element
                  elementor-element-73e3105
                  elementor-widget
                  elementor-widget-image
                "
                            data-id="73e3105"
                            data-element_type="widget"
                            data-widget_type="image.default"
                          >
                            <div className="elementor-widget-container">
                              <img
                                width="370"
                                height="417"
                                src={Package.imgSrc}
                                className="attachment-medium size-medium"
                                alt=""
                                srcset={Package.srcSet}
                                sizes="(max-width: 414px) 80vw, 414px"
                              />
                            </div>
                            <h3 className="qodef-m-title"> {Package.price} </h3>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              <div className="elementor-widget-container">
                <input
                  onClick={getBuyNft}
                  type="submit"
                  style={{ marginTop: "60px" }}
                  name="submit"
                  className="es_subscription_form_submit es_submit_button es_textbox_button "
                  id="es_subscription_form_submit_61a61952eae4f"
                  value="Buy Now"
                />
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <section
                className="
        elementor-section
        elementor-top-section
        elementor-element
        elementor-element-705fef1
        qodef-elementor-content-grid
        elementor-section-full_width
        elementor-section-content-middle
        elementor-section-height-default
        elementor-section-height-default
      "
                data-id="705fef1"
                data-element_type="section"
              >
                <div className="elementor-widget-container">
                  <div
                    className="
        qodef-shortcode qodef-m qodef-section-title
        qodef-alignment--center "
                    style={{ margin: "120px 0px" }}
                  >
                    <h1 className="qodef-m-title">My NFTs</h1>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                  className="elementor-container elementor-column-gap-no"
                >
                  {nftMetadata?.length ? (
                    nftMetadata.map((metaData) => {
                      return (
                        <div
                          className="
            elementor-column
            elementor-col-285
            elementor-top-column
            elementor-element
            elementor-element-35e0623
          "
                          data-id="35e0623"
                          data-element_type="column"
                          style={{ marginRight: "35px" }}
                        >
                          <div
                            className="
              elementor-widget-wrap elementor-element-populated
            "
                          >
                            <div
                              className="
                elementor-element
                elementor-element-73e3105
                elementor-widget
                elementor-widget-image
              "
                              data-id="73e3105"
                              data-element_type="widget"
                              data-widget_type="image.default"
                            >
                              <div
                                className="elementor-widget-container"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <video
                                  width="370"
                                  height="417"
                                  autoPlay
                                  loop
                                  muted
                                >
                                  <source
                                    src={nftVideos[`video${metaData.id}`]}
                                    type="video/mp4"
                                  />
                                </video>
                              </div>
                              <a href={metaData.uri}>
                                {" "}
                                <h6 className="qodef-m-title">
                                  {" "}
                                  {metaData.name}{" "}
                                </h6>{" "}
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <h6 className="qodef-m-title">
                      {" "}
                      You have not purchased any nft :({" "}
                    </h6>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div
            className="elementor-widget-container"
            style={{
              marginBottom: "300px",
              marginTop: "200px",
              textAlign: "center",
            }}
          >
            <input
              onClick={connectToMetamask}
              type="submit"
              // style={{ marginTop: "60px" }}
              name="submit"
              className="es_subscription_form_submit es_submit_button es_textbox_button "
              id="es_subscription_form_submit_61a61952eae4f"
              value="Connect Metamask"
            />
          </div>
        )}
      </div>
    </div>
  );
}
