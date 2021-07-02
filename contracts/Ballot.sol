pragma solidity 0.5.11;

contract Election {

    // Candidate model
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Mapping of accounts, with user addresses going to a bool 
    // that is true if they have voted.
    //bool defaults to false if candidate has not voted
    mapping(address => bool) public voters;
    // similar mapping but represents eligibilty to vote
    mapping(address => bool) public eligible;
    // Mapping of candidates
    mapping(uint => Candidate) public candidates;
    // Stores number of candidates
    uint public candidatesCount;
    //The address of whoever deployed the contract
    address public owner;
    //Whether the election has ended or not
    bool public hasEnded;

    //Event that is emitted when someone votes
    event votedEvent (
        uint indexed _candidateId
    );

    //Event that is emitted when someone votes
    event endVotingEvent (
        address indexed owner
    );
    
    //Constructor adds candidates and sets the owner to
    //whoever deploys the contract
    constructor ()public {
        addCandidate("Joris Bhonson");
        addCandidate("Ceremy Jorbyn");
        owner = msg.sender;
        eligible[msg.sender] = true;
    }

    //This function gets the votes only if the election is over
    //then converts them to string
    function getVotes(uint _candidateId) public view returns(uint){
        uint value;
        if(hasEnded && valid(_candidateId))
        {
            value = candidates[_candidateId].voteCount;
            return value;
        }else{
            return value;
        }
    }

    //function for adding candidates to mapping
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    //function for registering voters
    function addVoter(address voter) public{
        require(msg.sender == owner,"Only the owner can register voters");
        eligible[voter] = true;
    }

    //function to end voting, requires the address that is attempting
    // to end voting to be the owners
    function endVoting() public{
        require(hasEnded == false);
        require(msg.sender == owner, "Must be owner");
        hasEnded = true;
        emit endVotingEvent(owner);
    }

    //function for voting
    function vote (uint _candidateId) public {
        //check the election is not over
        require(!hasEnded, "Election has ended");
        // check that this account is not an account that has voted
        require(!voters[msg.sender], "Already voted");
        //check that voter is not ineligible
        require(eligible[msg.sender],"Ineligible to vote");
        //check a valid candidate has been selected
        require(valid(_candidateId), "Invalid candidate");
        // record that this account has voted
        voters[msg.sender] = true;
        //increment vote count
        candidates[_candidateId].voteCount ++;
        emit votedEvent(_candidateId);
    }

    //function for checking the candidate id is valid
    function valid(uint _Id) public view returns(bool){
        if(_Id > 0 && _Id <= candidatesCount){
            return true;
        }else{
            return false;
        }
    }

}
