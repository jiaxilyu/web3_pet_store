pragma solidity ^0.5.0;

contract Premium {
int public use_premium = 0;
// Adopting a pet
function buy_premium() public returns (int) {
  use_premium = 1;
  return use_premium;
}
// Retrieving the adopters
function getPremiumStatus() public view returns (int) {
  return use_premium;
}

}