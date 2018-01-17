var config = require('./config.js');
var contract = require('truffle-contract');
var prompt = require('prompt-async');
var Web3 = require('web3');

var nodeAddress = "http://" + config.nodeIP + ":" + config.nodePort;
var provider = new Web3.providers.HttpProvider(nodeAddress);
var web3 = new Web3(provider);
var EIP20 = contract(require('../EIP20/build/contracts/EIP20.json'));
EIP20.setProvider(web3.currentProvider);
var eip20;

prompt.start();

async function getEIP20Instance() {
  let instance = await EIP20.deployed();
  return instance;
}

function accounts() {
  let arr = web3.eth.accounts;
  return arr;
}

function listAccounts() {
  console.log(accounts())
}

function getEthBalance(account) {
  let wei = web3.eth.getBalance(account);
  let bal = web3.fromWei(wei, 'ether');
  return bal;
}

async function listEthBalances() {
  let accArr = accounts();
  for (let acc of accArr) {
    console.log(`Account ${acc} has ${getEthBalance(acc)} ether - ${await getTokenBalance(acc)} tokens.`);
  }
}

async function getTokenBalance(acc) {
  if (!eip20) {
    eip20 = await getEIP20Instance();
  }
  return await eip20.balanceOf(acc);
}

async function showTokenBalance(index) {
  if (!eip20) {
    eip20 = await getEIP20Instance();
  }
  let accArr = accounts();
  let acc = accArr[index];
  let bal = await eip20.balanceOf(acc);
  console.log("Account " + acc + " has " + bal + " tokens.");
}

async function transferBalance(fromAccount, toAccount, amount) {
  if (!eip20) {
    eip20 = await getEIP20Instance();
  }
  let accArr = accounts();
  console.log(`Transferring ${accArr[fromAccount]} => ${accArr[toAccount]} : ${amount}`);
  let bal = await eip20.transfer(accArr[toAccount], amount, {
    from: accArr[fromAccount]
  });
  console.log("Transferred");
}

async function showPrompt() {
    console.log("\nSelect an option: \n 1) List local accounts on node\n 2) List balances of local accounts on node\n 3) Show EIP20 token balance of account\n 4) Transfer\n 5) Exit\n");
}

async function main() {
  while (true) {
    showPrompt();
    const {
      option
    } = await prompt.get(["option"]);

    try {
      switch (option) {
        case '1':
          listAccounts();
          break;
        case '2':
          await listEthBalances();
          break;
        case '3':
          console.log("\nEnter the index of the local account:\n");
        
          var {
            index
          } = await prompt.get(['index']);
          await showTokenBalance(index);
          break;
        case '4':
        console.log("\nEnter the indices of the local accounts to transfer to and from and the amount:\n");
        var {
            fromAccount,
            toAccount,
            amount
          } = await prompt.get(["fromAccount", "toAccount", "amount"]);
          await transferBalance(parseInt(fromAccount), parseInt(toAccount), parseInt(amount));
          break;
        case '5':
          return;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

main();