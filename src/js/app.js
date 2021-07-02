App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  //initialise app object
  init: function() {
    return App.initWeb3();
  },


  //This connects the client-side application to the local blockchain
  initWeb3: function() {

    if (typeof web3 !== 'undefined') {
      // If Meta Mask gives a web3 provider set this to the apps web3 provider
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // If no web3 provider given, set to default from local blockchain
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },



  //initialise contract
  initContract: function() {
    //Load a json file of the election artifact
    $.getJSON("Election.json", function(election) {
      // Generate a new truffle contract
      App.contracts.Election = TruffleContract(election);
      // Connect the previously made provider
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },



  //This listens for events the contract emits
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Event not always recieved, apparantly this is a known issue with Metamask
      // Refreshing the page fixes the issue
      // for information on error: https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload after an event
        App.render();
      });
    });
  },




  //render content on web page
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();

    // Load and display the connected account 
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data and list out all the candidate details
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        var voteCount;
        electionInstance.getVotes(i).then(function(votes){
          voteCount = votes;
        });
        electionInstance.candidates(i).then(function(candidate) {
          
          var id = candidate[0];
          var name = candidate[1];
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);

        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('#candidateForm').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },


  //This provides the web page functionality for casting a vote
  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  //This provides the end voting button functionality
  endVoting: function() {
    App.contracts.Election.deployed().then(function(instance) {
      return instance.endVoting({ from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  //This provides the web page functionality for adding voters
  addAddress: function() {
    var vAdd = $('#vAddress').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.addVoter(vAdd, { from: App.account });
    }).then(function(result) {
    }).catch(function(err) {
      console.error(err);
    });
  },



};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

