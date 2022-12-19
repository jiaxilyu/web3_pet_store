var Adoption = artifacts.require("Adoption");
var Selling = artifacts.require("Selling");
var Premium = artifacts.require("Premium");
var Friends = artifacts.require("Friends");
var Donation = artifacts.require("Donation");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(Selling);
  deployer.deploy(Premium);
  deployer.deploy(Friends);
  deployer.deploy(Donation);
};