var EternalCore = artifacts.require("./EternalCore.sol");

contract('EternalCore', function(accounts) {

  it("...verifying token properties...", () => {
    return EternalCore.deployed().then( instance => {

      instance.name().then(value => {
        assert.equal(value, "EternalPoints", "Name should be EternalPoints");
      });

      instance.symbol().then(value => {
        assert.equal(value, "EP", "Symbol should be EP");
      });

      instance.totalSupply().then(value => {
        assert.equal(value, 1000000000000, "Total supply should be 1000000000000");
      });
    });
  });

  it("...checking user properties...", function() {
    return EternalCore.deployed().then( instance => {

      instance.totalUsers().then(value => {
        assert.equal(value, 1, "Total number of users should be 1");
      });

      instance.getMyUser().then(user => {
        assert.equal(user[0], "Kevin Lee Wei Yang", "Name should be Kevin Lee Wei Yang");
        assert.equal(user[1], 729475200, "DOB should be 729475200");
        assert.equal(user[4], 0, "numOfEvents should be 0");
      }).then(() => {
        return instance.changeName("Kevinleewy");
      }).then(() => {
        return instance.getMyUser();
      }).then((user) => {
        assert.equal(user[0], "Kevinleewy", "Name should be Kevinleewy");
      });

    });
  });

});