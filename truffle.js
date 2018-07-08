module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,	  // Change this (defaults: Ganache 7545, TestRPC 8545, truffle 9545) 
      network_id: "*" // Match any network id
    }
  }
};