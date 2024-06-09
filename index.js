// Tried Ethers 6.x but has promise error on calling contract
//import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js"
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connect-btn");
const fundButton = document.getElementById("fund-btn");
const balanceButton = document.getElementById("balance-btn");
const withdrawButton = document.getElementById("withdraw-btn");
connectButton.onclick = connectWallet
fundButton.onclick = fundMe
balanceButton.onclick = getBalance
withdrawButton.onclick = withdrawBalance

async function connectWallet(){
    if(typeof window.ethereum !== "undefined"){
        await window.ethereum.request({
            method: "eth_requestAccounts"
        })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Install Metamask"
    }
}

async function fundMe() {
    const ethAmount = document.getElementById("fund-amount").value;
    console.log(`Funding with ${ethAmount} ...`)

    if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Transaction Finished!")
        } catch (err) {
            console.log(err)
        }
    } else {
        connectButton.innerHTML = "Install Metamask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash} ...`)

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(`Completed with ${transactionReciept.confirmations} confirmations`)
            resolve()
        })
    })
}

async function getBalance() {
    console.log(`Getting current balance ...`)

    if(typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        const balanceCont = document.getElementById("balance-cont")
        balanceCont.innerHTML = ethers.utils.formatEther(balance)
    }
}

async function withdrawBalance() {
    console.log(`Withdrawing ...`)

    if(typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (err) {
            console.log(err)
        }
    }
}