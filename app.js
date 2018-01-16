var config = require('./config.js');
var contract = require('truffle-contract');
var prompt = require('prompt');
var Web3 = require('web3');

var nodeAddress = "http://" + config.nodeIP + ":" + config.nodePort;
var provider = new Web3.providers.HttpProvider(nodeAddress);
var web3 = new Web3(provider);
var EIP20 = contract(require('../EIP20/build/contracts/EIP20.json'));
EIP20.setProvider(web3.currentProvider);
var eip20;

prompt.start();
var currentState = "start";

async function getEIP20Instance() {
  let instance = await EIP20.deployed();
  return instance;
}

function accounts() {
  let arr = web3.eth.accounts;
  return arr;
}

function listAccounts(callback) {
  console.log(accounts())
  callback();
}

function getEthBalance(account) {
  let wei = web3.eth.getBalance(account);
  let bal = web3.fromWei(wei, 'ether');
  return bal;
}

function listEthBalances(callback) {
  let accArr = accounts();
  for (let acc of accArr) {
    console.log("Account " + acc + " has " + getEthBalance(acc) + " ether.");
  }
  callback();
}

async function showTokenBalance(index, callback) {
  if (!eip20) { eip20 = await getEIP20Instance(); }
  let accArr = accounts();
  let acc = accArr[index];
  let bal = await eip20.balanceOf(acc);
  console.log("Account " + acc + " has " + bal + " tokens.");
  callback();
}

async function showPrompt() {
  if (currentState == "start") {
    console.log("\nSelect an option: \n 1) List local accounts on node\n 2) List ether balances of local accounts on node\n 3) Show EIP20 token balance of account\n 4) Exit\n");
  } else if (currentState == "tokenBalance") {
    console.log("\nEnter the index of the local account:\n");
  } else if (currentState == "exit") {
    console.log("\nBye!");
  } else {
    console.log("Unknown state...");
  }
}

async function main() {
  showPrompt();
  if (currentState == "start") {
    prompt.get(['option'], function(err, answer) {
      if (answer.option == 1) {
        currentState = "start";
        listAccounts(main);
      } else if (answer.option == 2) {
        currentState = "start";
        listEthBalances(main);
      } else if (answer.option == 3) {
        currentState = "tokenBalance";
        main();
      } else if (answer.option == 4) {
        currentState = "exit";
        main();
      }
    });
  } else if (currentState == "tokenBalance") {
    prompt.get(['index'], function(err, answer) {
      currentState = "start";
      showTokenBalance(answer.index, main);
    });
  }
}

main();
