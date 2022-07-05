<div id="top"></div>

<!-- PROJECT LOGO -->
<br />

<div align="center">
  <a>
    <img src="https://pbs.twimg.com/profile_images/1398876828295643146/I9HgKjhJ_400x400.jpg" alt="Logo" width="80" height="80">
  </a>
</div>

# Keycard

A small service that takes care of all your Zenotta blockchain integration, so you can just focus on making great games.
<b>NOTE: This service is currently intended for testing purposes, and should not be used in a production environment!</b>

<br />

<!-- GETTING STARTED -->

## 📦 Getting Started

Keycard assumes an existing NodeJS installation (v16.14.2 tested) as well as associated npm, with which
you can install and then run the service

```
npm install
npm start
```

<br />

## 💻 Usage

Keycard currently only provides 2 routes for handling blockchain asset creation and sending.

<br />

### Creating Blockchain Items

Zenotta uses `Receipt` assets to provide NFT-like ownership, and you can think of `Receipts` in 
Zenotta as the same thing as blockchain items/NFTs. These can be created by making a
call to `create_blockchain_item` as below:

```typescript
// POST
axios
  .post("/create_blockchain_item", {
    amount: 1000, // Number of items to create
  })
  .then((response) => {
    console.log(response);
  });
```

<details>
  <summary>Response Content</summary>
  <br/>
    ```json
    {
        "status": 'success',
        "reason": 'OK',
        "content": {
            "receiptAsset": {
                "amount": 1000,
                "drs_tx_hash": "YOUR_TX_HASH"
            },
            "toAddress: "b46f37...3bfb01"
        }
    }
    ```
    <br/>

    * `receiptAsset` - Details of the `Receipt` asset created. The `drs_tx_hash` can be used to spend this item later
    * `toAddress` - Your address where the `Receipt` assets were sent to 
</details>

### Sending Blockchain Items to Players

In order to send `Receipt` blockchain items you'll need the following:

1. <b>The item's transaction hash:</b> This is the `drs_tx_hash` value you would've received from the call to 
`/create_blockchain_item`. This value tells the blockchain which item you want to send and acts as an identifier.

2. <b>The amount of this item to send:</b> A simple integer value

3. <b>The player's Zenotta address:</b> This is the address the player provides to the game to make payments to

With these 3 values you can make a call to Keycard at:

```typescript
// POST
axios
  .post("/send_blockchain_item", {
    amount: 1000,               // Number of items to create
    address: "046b37...3bfb09"  // Player address
    txHash: "YOUR_TX_HASH"      // The blockchain item's `drs_tx_hash`
  })
  .then((response) => {
    console.log(response);
  });
```

<details>
  <summary>Response Content</summary>
  <br/>
    ```json
    {
        "status": 'success',
        "reason": 'OK',
        "content": null
    }
    ```
    <br/>
</details>

# 🤝 Contributing

Keycard is still at an early stage of development and we welcome all contributions. You can submit any ideas or concerns as pull requests or as GitHub issues.

We will soon be creating a set of guidelines for any and all contributions, so stay tuned!

# 🏛 License

Chi is licensed under the MIT License.