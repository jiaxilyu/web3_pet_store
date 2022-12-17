pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Friends {
    // struct Friend {
    //     string name;
    //     address user_address;
    // }
    // Friend[] public friends;
    bytes32[99] public user_names;
    address[99] public user_addresses;
    uint public count = 0;
    // add a friend
    function add_friend(address user_address, bytes32 name) public returns (uint) {
        require(count <= 99);
        user_addresses[count] = user_address;
        user_names[count] = name;
        count += 1;
        return count;
    }

    // Retrieving all friends
    function getFriends() public view returns (address[99] memory, bytes32[99] memory, uint) {
        // address[] memory user_addresses = new address[](count);
        // string[] memory user_names = new string[](count);
        // for (uint i = 0; i < count; i++){
        //     user_addresses[i] = friends[i].user_address;
        //     user_names[i] = friends[i].name;
        // }
        return (user_addresses, user_names, count);
    }

}