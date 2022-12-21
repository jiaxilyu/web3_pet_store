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
        App.getProposal();
      });
      
      // App.updatedView();
      return App.bindEvents();
    },
  
    // bind all click event on botton
    bindEvents: function() {
        $(document).on('click', '.donate-button', App.handlemakeDonation);
        $(document).on('click', '.proposal-button', App.handlecreateProposal);

    },

    // update view
    // adding new update view func here
    updatedView: function(){
      try{
        // App.markAdopted();
        App.getCurrentDonation();
        App.getContributors();
        App.getProposal();
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

    handlecreateProposal:function(event){
        event.preventDefault();
        var description = document.getElementById("proposal-description").value;
        var amount = document.getElementById("proposal-amount").value;
        if (amount > 0){
          return App.createProposal(description, amount);
        }
        else {
          window.alert(`Please make proposal with target amount greater than 0!`);
        }
      },

    createProposal: function(description, amount) {
        var donationInstance;
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
              console.log(error);
            }
            console.log(description, amount);
            App.contracts.Donation.deployed().then(function(instance) {
              donationInstance = instance;
              let account = accounts[0];
              return donationInstance.createProposal(description, parseInt(amount), {from: account});
            }).then(function(result){
              location.reload();
              // App.getContributors();
            }).catch(function(err){
              console.log(err);
            });
          });

    },

    // getProposal: function(index) {
    //     var donationInstance;
    //     App.contracts.Donation.deployed().then(function(instance) {
    //         donationInstance = instance;
    //         return donationInstance.getProposal();
    //     }).then(function(ret) {
    //         descriptionList = ret[0];
    //         amountList = ret[1];
    //         recipientList = ret[2];
    //         completeList = ret[3];
    //         var proposalCol = $('#proposalCol');
    //         var proposalTemplate = $('#proposalTemplate');
    //         for(i=0; i < descriptionList.length; ++i){
    //             if (completeList[i] == false) {
    //                 // console.log(doner_names[i]);
    //                 proposalTemplate.find(".proposal-description").text(web3.toAscii(descriptionList[i]));
    //                 // donerTemplate.find(".doner-name").text(doner_names[i]);
    //                 proposalTemplate.find(".proposal-amount").text(amountList[i]);
    //                 proposalCol.append(donerTemplate.html());
    //             }
    //         }
    //       }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },

  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  