pragma solidity ^0.5.0;

contract Selling{
    int[99] public selleds;
    // constructor() public {
    //     for (uint i = 0; i < 99;i++){
    //         selleds[i] = -1;
    //     }
    // }

    function sell(uint sell_price, uint petId) public {
        // Limit sell price
        require(sell_price <= 100000000000000000);
        require(petId >= 0 && petId <= 99);
        // Send the amount to the address that requested it
        msg.sender.transfer(sell_price);
        selleds[petId] = 2;
    }

    function set_sellable(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 99);
        selleds[petId] = 1;
        return petId;
    }

    // if status is 0, not allowed to sell
    // if status is 1, allowed to sell
    // if status is 2, already selled
    function getSellstatus() public view returns (int[99] memory) {
        return selleds;
    }

}