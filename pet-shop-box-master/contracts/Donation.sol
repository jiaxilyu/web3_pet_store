pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Donation {

    mapping(address=>uint) public contributors;
    mapping(address=>bytes32) public nameTable;
    address[] contributorList = new address[](99);

    struct Proposal {
        string description;
        uint amount;
        address recipient;
        bool completed;
        uint numberOfVoters;
        // mapping(address=>bool) voters;
        mapping(address=>bool) checkVoter;
        address[] voters;
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
      
        // bool sent = owner.send(msg.value);
        // require(sent, "Failed to send Ether");

        nameTable[msg.sender] = name;
        contributors[msg.sender] += msg.value;
        totalDonation += msg.value;
    }

    function getCurrentDonation() public view returns (uint) {
      return totalDonation;
    }

    function getContributorNameAndAmount() public view returns (bytes32[] memory, uint[] memory) {
      uint size = contributorList.length;
      // string[99] memory name;
      // uint[99] memory amount;
      bytes32[] memory name = new bytes32[](size);
      uint[] memory amount = new uint[](size);

      for (uint i = 0; i < size; ++i) {
        name[i] = nameTable[contributorList[i]];
        amount[i] = contributors[contributorList[i]];
      }
      return (name, amount);
    }

    modifier resitrctOwner {
        require(msg.sender == owner);
        _;
    }

    modifier reachedTarget {
        require(totalDonation >= target);
        _;
    }

    modifier resitrctVoter {
        require(msg.sender != owner);
        _;
    }

    function createProposal(string memory _description, uint _amount, address _to) public resitrctOwner reachedTarget{
      Proposal memory newProposal = Proposal(
          {
              description: _description,
              amount: _amount,
              recipient: _to,
              numberOfVoters: 0,
              completed: false,
              voters: new address[](7)
              }
          );
      proposals.push(newProposal);
    }

    function voteForRequest(uint index) public resitrctVoter reachedTarget{
      Proposal storage p = proposals[index];
      
      require(contributors[msg.sender] > 0);
      // require(p.voters[msg.sender] == false);
      require(p.checkVoter[msg.sender] == false);
      require(!p.completed);
      
      // p.voters[msg.sender] = true;
      p.checkVoter[msg.sender] = true;
      p.voters.push(msg.sender);
      p.numberOfVoters++;
    }

    function getVoter(uint index) public view returns(address[] memory) {
      Proposal storage p = proposals[index];
      return p.voters;
    }
}