App = {
    web3Provider: null,
    contracts: {},
    init: async function() {
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
  
    // Modern dapp browsers...
    if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
        // Request account access
        await window.ethereum.enable();
        } catch (error) {
        // User denied account access...
        console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  web3 = new Web3(App.web3Provider);
  
      return App.initContract();
    },
  
    initContract: function() {
      // register adoption contract
      $.getJSON('Donation.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var DonationArtifact = data;
        App.contracts.Donation = TruffleContract(DonationArtifact);
      
        App.contracts.Donation.setProvider(App.web3Provider);
        App.getCurrentDonation();
        App.getContributors();
      });
      
      // App.updatedView();
      return App.bindEvents();
    },
  
    // bind all click event on botton
    bindEvents: function() {
        $(document).on('click', '.donate-button', App.handlemakeDonation);
    },

    // update view
    // adding new update view func here
    updatedView: function(){
      try{
        // App.markAdopted();
        App.getCurrentDonation();
        App.getContributors();
      }
      catch(err){
        console.log(err);
      }
    },
  
    // ------------------------------------------- for adopt features--------------------------------------------------------------
    getCurrentDonation: function(account) {
        var donationInstance;
        App.contracts.Donation.deployed().then(function(instance) {
            donationInstance = instance;
            return donationInstance.getCurrentDonation();
        }).then(function(amount) {
            console.log("amount"+amount);
            $('.current-amount').text(amount);
          }).catch(function(err) {
            console.log(err.message);
        });
    },

    getContributors: function(account) {
        var donationInstance;
        App.contracts.Donation.deployed().then(function(instance) {
            donationInstance = instance;
            return donationInstance.getContributorNameAndAmount();
        }).then(function(ret) {
            doner_names = ret[0];
            doner_amount = ret[1];
            var donerCol = $('#donerList');
            var donerTemplate = $('#donerTemplate');
            for(i=0; i < doner_names.length; ++i){
                if(doner_amount[i] > 0) {
                    console.log(doner_names[i]);
                    donerTemplate.find(".doner-name").text(web3.toAscii(doner_names[i]));
                    // donerTemplate.find(".doner-name").text(doner_names[i]);
                    donerTemplate.find(".doner-amount").text(doner_amount[i]);
                    donerCol.append(donerTemplate.html());
                }

            }
          }).catch(function(err) {
            console.log(err.message);
        });
    },

    handlemakeDonation:function(event){
        event.preventDefault();
        var name = document.getElementById("name").value;
        var amount = document.getElementById("amount").value;
        if (amount > 0){
          return App.makeDonation(name, amount);
        }
        else {
          window.alert(`Please donate amount greater than 0!`);
        }
      },

    makeDonation: function(name, amount) {
        var donationInstance;
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
          console.log(name, amount);
          App.contracts.Donation.deployed().then(function(instance) {
            donationInstance = instance;
            let account = accounts[0];
            return donationInstance.contribute(name, {value: parseInt(amount), from: account});
          }).then(function(result){
            location.reload();
            // App.getContributors();
          }).catch(function(err){
            console.log(err);
          });
        });

    },

    createProposal: function(event) {
        var donationInstance;

    },

    getVoter: function(index) {
        var donationInstance;

    },


    // deal with adopted bottons
    markAdopted: function(account) {
      var adoptionInstance;
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        //get all adopters of all pets
        return adoptionInstance.getAdopters.call();
      }).then(function(adopters) {
        // refresh the page
        for (i = 0; i < adopters.length; i++) {
          // if pet is not adopted
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('.btn-adopt').text('Adopted').attr('disabled', true);
          }
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    },
  
    // deal with adopted action
    handleAdopt: function(event) {
      event.preventDefault();
  
      let petId = parseInt($(event.target).data('id'));
      var adoptionInstance;
  
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
      
        let account = accounts[0];
        let account_id = accounts[0];
        App.contracts.Adoption.deployed().then(function(instance) {
          adoptionInstance = instance;
          
          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, {from: account});
        }).then(function(result) {
          $('.panel-pet').eq(petId).find('.btn-sell').text("sell").attr('disabled', false);
          return App.markAdopted(account_id);
        }).then(function(result){
          return App.set_sellable(petId, account_id);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    }
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  