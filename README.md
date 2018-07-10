# Sweet Eternal Blockchain Project

A project to record events permanently on the blockchain

## Technologies used

* Solidity (Smart Contracts)
* React (Front-end)
* Metamask (Web3 Provider)

## Installation intructions

1. Ensure that npm, truffle, Ganache and Metamask are installed.

2. Clone this repo, cd into the root dir and run
```
npm install
```

3. Ensure that Ganache is up and running and ensure that its RPC server (default: HTTP://127.0.0.1:7545) matches what's in truffle.js.

4. On a terminal, run the following commands to compile and migrate the smart contracts
```
truffle compile --all
truffle migrate --reset
```

5. To open the truffle console, run the following command on the terminal:
```
truffle console
```

6. Once the truffle console is active, run the following commands to test EternalCore:
```
c = EternalCore.deployed()
```
Token-related functions:
```
c.then(function(instance){return instance.totalSupply()})
c.then(function(instance){return instance.name()})
c.then(function(instance){return instance.symbol()})
c.then(function(instance){return instance.balanceOf("0x627306090abaB3A6e1400e9345bC60c78a8BEf57")})
```
User-related functions:
```
c.then(function(instance){return instance.totalUsers()})
c.then(function(instance){return instance.hasUser()})
c.then(function(instance){return instance.users(1)})
c.then(function(instance){return instance.getMyUser()})
c.then(function(instance){return instance.changeName("Kevinleewy")})
c.then(function(instance){return instance.setSecondaryAddress("0xf17f52151EbEF6C7334FAD080c5704D77216b732")})
c.then(function(instance){return instance.unsetSecondaryAddress()})
c.then(function(instance){return instance.toggleDefaultApproval()})
```
Event-related functions:
```
c.then(function(instance){return instance.createEvent("My Event","Event Description",1,56,65,729475200,729475200,[1])})
c.then(function(instance){return instance.events(0)})
c.then(function(instance){return instance.participants(0,0)})
c.then(function(instance){return instance.isParticipant(0)})
c.then(function(instance){return instance.eventsOfUser()})
c.then(function(instance){return instance.disapproveEvent(1,0)})
c.then(function(instance){return instance.approveEvent(1,0)})
```

7. Create symlink from node_module to root
Due to React.js' limitations, contracts outside of src directory must be symbolically linked from within node_module
```
cd build/contracts
npm link
cd ../..
npm link sweeteternal
```

8. Run
```
npm run start
```
if a tab didn't automatically open in your web browser, manually open one and key in `localhost:3000` and hit `<ENTER>`.

9. Build webpack
```
npm run build
```
