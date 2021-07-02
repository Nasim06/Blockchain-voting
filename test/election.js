//Testing file to make sure everything works

//Creating an abstraction to interact with the contract
var Election = artifacts.require("./Election.sol");

//Add accounts from development enviroment to test with
contract("Election", function(accounts) {
  var electionInstance;

  
  //check to see it initialises with 2 candidates with correct values
  it("Correct initialisation of candidates", function() {
    return Election.deployed().then(function(election) {
      return election.candidatesCount();
    }).then(function(num) {
      assert.equal(num, 2);
      return Election.deployed();
    }).then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidates(1); //initialises the first candidate
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "correct id");
      assert.equal(candidate[1], "Joris Bhonson", "correct name");
      assert.equal(candidate[2], 0, "correct vote count");
      return electionInstance.candidates(2); //initialises the second candidate
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "correct id");
      assert.equal(candidate[1], "Ceremy Jorbyn", "correct name");
      assert.equal(candidate[2], 0, "correct vote count");
    });
  });

  //checks that you can vote 
  it("Lets voter cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "correct event type");
      assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "correct id");
      return electionInstance.voters(accounts[0]);
    });
  });

  //checks that you cannot vote for a candidate which does not exist
  it("You cannot vote for an invalid candidate", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      electionInstance.addVoter(accounts[1], {from: accounts[0]});
      return electionInstance.vote(10, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
    });
  });


  //Checks that the same account cannot vote again
  it("You cannot vote twice", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      electionInstance.vote(candidateId, { from: accounts[0] });
      return electionInstance.candidates(1);
    }).then(function(candidate1){
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
    });
  });

  
});
