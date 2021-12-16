import React from "react";

export default function Owner({
  giftTokenId,
  setgiftTokenId,
  influencerAddress,
  setinfluencerAddress,
  sendNftsToInfluencer,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", width: "500px" }}
      >
        <h4> Token Id </h4>{" "}
        <input
          type="text"
          value={giftTokenId}
          onChange={(e) => setgiftTokenId(e.target.value)}
        />
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", width: "500px" }}
      >
        <h4> Influencer Address </h4>{" "}
        <input
          type="text"
          value={influencerAddress}
          onChange={(e) => setinfluencerAddress(e.target.value)}
        />
      </div>
      <button onClick={sendNftsToInfluencer}> Send  </button>
      <br />
    </div>
  );
}
