pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Donation {

    mapping(address=>uint) public contributors;
    mapping(address=>bytes32) public nameTable;
    address[] contributorList = new address[](99);

    struct Proposal {
        bytes32 description;
        uint amount;
        bool completed;
    }

    Proposal[] public proposals;

    uint totalDonation;
    uint totalContributors;
    uint target = 100;
    address payable public owner;
    
    constructor() public {
        address addr = msg.sender;
        owner = address(uint160(addr));
    }
    
   function contribute(bytes32 name) public payable {        
        require(msg.value > 0);
                
        if(contributors[msg.sender] == 0)
        {        
            totalContributors++;
            contributorList.push(msg.sender);
        }
        nameTable[msg.sender] = name;
        contributors[msg.sender] += msg.value;
        totalDonation += msg.value;
    }

    function getCurrentDonation() public view returns (uint) {
      return totalDonation;
    }

    function getContributorNameAndAmount() public view returns (bytes32[] memory, uint[] memory) {
      uint size = contributorList.length;
      bytes32[] memory name = new bytes32[](size);
      uint[] memory amount = new uint[](size);

      for (uint i = 0; i < size; ++i) {
        name[i] = nameTable[contributorList[i]];
        amount[i] = contributors[contributorList[i]];
      }
      return (name, amount);
    }

    modifier resitrctDonor {
        require(contributors[msg.sender] > 0);
        _;
    }

    function createProposal(bytes32 _description, uint _amount) public resitrctDonor{
      Proposal memory newProposal = Proposal(
          {
              description: _description,
              amount: _amount,
              completed: false
              }
          );
      proposals.push(newProposal);
    }

    function getProposal() public view returns (bytes32[] memory, uint[] memory, bool[] memory) {
      uint size = proposals.length;
      bytes32[] memory descriptionList = new bytes32[](size);
      uint[] memory amountList = new uint[](size);
      bool[] memory completeList = new bool[](size);

      for (uint i = 0; i < size; ++i) {
        descriptionList[i] = proposals[i].description;
        amountList[i] = proposals[i].amount;
        completeList[i] = proposals[i].completed;
      }

      return (descriptionList, amountList, completeList);
    }

}