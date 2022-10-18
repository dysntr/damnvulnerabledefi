const ethers = require("ethers")
const fs = require("fs-extra")
require("dotenv").config()

// Run this one time to generate the encrypted private key
// This function creates a .encryptedKey.json that requires a key to decrypt
// Delete the private key and private key password from env file
// In your deploy script add the following code:
// const fs = require("fs-extra")
// const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8");
// let wallet = new ethers.Wallet.fromEncryptedJsonSync(
//   encryptedJson,
//   process.env.PRIVATE_KEY_PASSWORD
// );
// wallet = await wallet.connect(provider)

// After ensuring `$HISTCONTROL` is set correctly, you can run this from console with a space in beginning `<space>PRIVATE_KEY_PASSWORD=password node deploy.js`
// Run `history` to confirm or `history -c`

// Setting $HISTCONTROL Instruction:
// - Start your command with a space and it won't be included in history

//   - This requires the env var `$HISTCONTROL` to be set `ignorespace` or `ignoreboth`. Run `echo $HISTCONTROL` to see.
//   - Update `%HOME/.bashrc` to set variable
//     - `export HISTCONTROL=ignorespace`
//     - `source %HOME/.bashrc`
//   - Now commands shouldn't be written to $HISTFILE.

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
    const encryptedJsonKey = await wallet.encrypt(
        process.env.PRIVATE_KEY_PASSWORD,
        process.env.PRIVATE_KEY
    )
    console.log(encryptedJsonKey)
    fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
