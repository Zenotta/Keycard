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
To use Keycard with Docker, you can set up a local `.env` file in the project root, with your configuration options 
like below:

```sh
PASSPHRASE="MY_SECURE_PASSWORD"
COMPUTE_HOST="http://COMPUTE_IP:3001"
INTERCOM_HOST="http://INTERCOM_IP:3000"
CACHE_CAPACITY=1000
SEED_PHRASE="YOUR_SEED_PHRASE_IS_OPTIONAL"
```

There are also default values for these fields in `config.json`, which Keycard will use if a `.env` file or some of its 
fields are not provided. If no seed phrase is provided, Keycard will generate one for you as part of a new instance. You can then run the following:

```sh
docker-compose up -d
```

Docker will orchestrate the required containers, after which you can make 
calls to Keycard at port **1337**. Data saved to Keycard's Redis instance is kept within a Docker volume.

<br />

If you don't want to use Docker you can run the service manually. For this you'll require [Redis](https://redis.io/download/)
installed on whatever you want to run Keycard on.

```sh
# In one tab or detached
redis-server --daemonize yes

# In another tab
npm run build
npm start YOUR_PASSPHRASE
```

You'll need to ensure that `redis-server` runs on port 6379.

<br />

## 💻 Usage

Keycard currently only provides a number of routes for handling blockchain asset creation and sending.

### Creating Blockchain Items

Zenotta uses `Receipt` assets to provide NFT-like ownership, and you can think of `Receipts` in 
Zenotta exactly like blockchain items/NFTs. These can be created by making a call to `create_blockchain_item` 
as below:

```typescript
// POST example with Axios
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
// POST example with Axios
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

### Fetching Your Balance of Items

You can fetch the remaining balances of all your available blockchain items by querying the following call:

```typescript
// POST example with Axios
axios
  .post("/fetch_item_balances", {
    refresh: false
  })
  .then((response) => {
    console.log(response);
  });
```

The body of the `POST` request contains a `refresh` field that will clear Keycard's cache and re-fetch all 
available balances from the blockchain directly if set to `true`. Note this will take slightly longer to fetch, 
especially for a larger number of items.

<b>Example Response Content</b>

```json
{
    "status": "success",
    "reason": "OK",
    "content": {
        "balances": [
            {
                "g5bd77c8213e12725da1031695a1e49a": 10
            }
        ]
    }
}
```

<br />

### Getting Your Seed Phrase

If you'd like to retrieve your seed phrase in order to back your instance up or transfer it to a new environment, you 
can do so at the following route:

```typescript
// GET example with Axios
axios
  .get("/seed_phrase")
  .then((response) => {
    console.log(response);
  })
```

<br />

## 🤝 Contributing

Keycard is still at an early stage of development and we welcome all contributions. You can submit any ideas or concerns as pull requests or as GitHub issues.

We will soon be creating a set of guidelines for any and all contributions, so stay tuned!

<br />

## ✅ Todo List

- [x] Add Docker compose setup
- [ ] Add unit tests for functionality
- [ ] Add security for calls to internal key handling
- [ ] Add translations for README

<br />

## 🏛 License

Keycard is licensed under the [MIT License](https://github.com/Zenotta/Keycard/blob/main/LICENSE).