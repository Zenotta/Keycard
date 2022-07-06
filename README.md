<div id="top"></div>

<!-- PROJECT LOGO -->
<br />

<div align="center">
  <a>
    <img src="https://github.com/Zenotta/Keycard/blob/main/assets/title.png" alt="Logo">
  </a>
</div>

# Keycard

A small service that takes care of all your Zenotta blockchain integration, so you can just focus on making great games.
<b>NOTE: This service is currently intended for testing purposes, and should not be used in a production environment!</b>

<br />

<!-- GETTING STARTED -->

## 📚 Requirements

In order to run Keycard, you'll need to have Docker installed (minimum tested v20.10.12) and be comfortable working with the command line. If you'd like to develop on this repo, you'll have the following additional requirements:

- NodeJs (tested at v16.14.2)
- Yarn (tested at v1.22.10)

<br />

## 📦 Installation

With Docker installed and running, you can clone this repo and get everything installed with the following:

```sh
# SSH clone
git clone git@github.com:Zenotta/Keycard.git

# Navigate to the repo
cd keycard

# Install dependencies
npm install

# Bundle server
npm run build

# Build Docker image
docker build -t keycard .
```

<br />

## 🏎️ Running

To use Keycard as is, you can simply run the following in the root folder of the repo:

```sh
docker-compose up -d
```

Docker will orchestrate the required containers, after which you can make 
calls to Keycard at port **1337**. Data saved to Keycard's Redis instance is kept within a Docker volume.

<br />

## 💻 Usage

Keycard currently only provides 2 routes for handling blockchain asset creation and sending.

### Creating Blockchain Items

Zenotta uses `Receipt` assets to provide NFT-like ownership, and you can think of `Receipts` in 
Zenotta exactly like blockchain items/NFTs. These can be created by making a call to `create_blockchain_item` 
as below:

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

<b>Example Response Content</b>

```json
{
    "status": "success",
    "reason": "OK",
    "content": {
        "toAddress": "b46f37...3bfb01",
        "receiptAsset": {
            "amount": 1000,
            "drs_tx_hash": "YOUR_TX_HASH"
        }
    }
}
```
<br/>

* `toAddress` - Your address where the `Receipt` assets were sent to 
* `receiptAsset` - Details of the `Receipt` asset created. The `drs_tx_hash` can be used to spend this item later

<br />

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
    amount: 1000,               // Number of items to send
    address: "046b37...3bfb09"  // Player address
    txHash: "YOUR_TX_HASH"      // The blockchain item's `drs_tx_hash` identifier
  })
  .then((response) => {
    console.log(response);
  });
```

<b>Example Response Content</b>

```json
{
    "status": "success",
    "reason": "OK",
    "content": null
}
```

<br />

## 🤝 Contributing

Keycard is still at an early stage of development and we welcome all contributions. You can submit any ideas or concerns as pull requests or as GitHub issues.

We will soon be creating a set of guidelines for any and all contributions, so stay tuned!

<br />

## ✅ Todo List

- [ ] Add Docker compose setup
- [ ] Add unit tests for functionality
- [ ] Add security for calls to internal key handling
- [ ] Add translations for README

<br />

## 🏛 License

Keycard is licensed under the [MIT License](https://github.com/Zenotta/Keycard/blob/main/LICENSE).