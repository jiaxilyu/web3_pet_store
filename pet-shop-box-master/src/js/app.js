App = {
  web3Provider: null,
  contracts: {},
  premium_pets: [],
  use_premium: false,
  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');
      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-sell').attr({"data-id":data[i].id, "disabled":true});
        petsRow.append(petTemplate.html());
      }
    });
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

    // register premium contract
    $.getJSON('Premium.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PremiumArtifact = data;
      App.contracts.Premium = TruffleContract(PremiumArtifact);
      // Set the provider for our selling contract
      App.contracts.Premium.setProvider(App.web3Provider);
      App.UpdatePremiumView();
    });

    // register adoption contract
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our adoption contract
      App.contracts.Adoption.setProvider(App.web3Provider);
      App.markAdopted();
    });
    
    // register selling contract
    $.getJSON('Selling.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SellingArtifact = data;
      App.contracts.Selling = TruffleContract(SellingArtifact);
    
      // Set the provider for our selling contract
      App.contracts.Selling.setProvider(App.web3Provider);
      App.markSelled();
    });

    // register Friends contract
    $.getJSON('Friends.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var FriendsArtifact = data;
      App.contracts.Friends = TruffleContract(FriendsArtifact);
    
      // Set the provider for our selling contract
      App.contracts.Friends.setProvider(App.web3Provider);
    });

    // App.updatedView();
    return App.bindEvents();
  },

  // bind all click event on botton
  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-sell', App.handleSell);
    $(document).on('click', '#Premium', App.purchasePremium);
  },

  // update view
  // adding new update view func here
  updatedView: function(){
    try{
      App.markAdopted();
      App.markSelled();
    }
    catch(err){
      console.log(err);
    }
  },

  // ------------------------------------------- for adopt features--------------------------------------------------------------

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
          $('.panel-pet').eq(i).find('.btn-adopt').text('Success').attr('disabled', true);
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
  },

  // ------------------------------------------- for sell function--------------------------------------------------------------
  // set pet as sellable
  set_sellable: function(petId, account){
    App.contracts.Selling.deployed().then(function(instance) {
    sellInstance = instance;
    // set selled[petId] as 0
    return sellInstance.set_sellable(petId, {from: account});
    }).catch(function(err) {
      console.log(err);
    });
  },
  
  // deal with mark bottons
  markSelled: function(petId) {
    App.contracts.Selling.deployed().then(function(instance) {
      sellInstance = instance;
      return sellInstance.getSellstatus.call();
    }).then(function(selleds) {
      // refresh the page
      for (i = 0; i < selleds.length; i++) {
        // if pet is not adopted
        switch(parseInt(selleds[i])) {
          case 0:
            $('.panel-pet').eq(i).find('.btn-sell').text("cant sell").attr('disabled', true);
            break;
          case 1:
            $('.panel-pet').eq(i).find('.btn-sell').attr('disabled', false);
            break;
          case 2:
            $('.panel-pet').eq(i).find('.btn-sell').text("selled").attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  // handle sell action
  handleSell: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var sellInstance;
    // App.UpdatePremiumView();
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.Selling.deployed().then(function(instance) {
        // execute sell pet
        sellInstance = instance;
        return sellInstance.sell(0.001, petId,{from: account});
      }).then(function(result){
        return App.updatedView();
      }).catch(function(err){
        console.log(err);
      });
    });

  },

  // ------------------------------------------- for premium pet function--------------------------------------------------------------
  purchasePremium: function(event){
    event.preventDefault();
    var premiumInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      let account = accounts[0];
      App.contracts.Premium.deployed().then(function(instance) {
        premiumInstance = instance;
        return premiumInstance.buy_premium( {from: account});
      }).then(function(result){
        App.UpdatePremiumView();
      }).catch(function(err){
        console.log(err);
      });
    });
  },
  
  UpdatePremiumView: function(){
    App.contracts.Premium.deployed().then(function(instance) {
      premiumInstance = instance;
      // check account premium status from local premium.json
      return premiumInstance.getPremiumStatus()
    }).then(function (status){
      if (parseInt(status) === 1){
        $('#Premium').text("Premium Purchased").attr('disabled', true);
        $.getJSON('../premium_pets.json', function(data) {
        var petTemplate = $('#premiumpetTemplate')
        var petsRow = $('#petsRow');
        for (i = 0; i < data.length; i ++) {
          petTemplate.find('.panel-title').text("premium pets : "+data[i].name);
          petTemplate.find('img').attr('src', data[i].picture);
          petTemplate.find('.pet-breed').text(data[i].breed);
          petTemplate.find('.pet-age').text(data[i].age);
          petTemplate.find('.pet-location').text(data[i].location);
          petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
          petTemplate.find('.btn-sell').attr({"data-id":data[i].id, "disabled":true});
          petsRow.append(petTemplate.html());
    }
  });
      }
    }).catch(function(err){
      console.log(err);
    });
  },

  // ------------------------------------------- for friends function--------------------------------------------------------------
  addFriend: function(name, address){
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      console.log(name, address);
      let account = accounts[0];
      App.contracts.Friends.deployed().then(function(instance) {
        friendsInstance = instance;
        return friendsInstance.add_friend(address, name, {from: account});
      }).then(function(result){
        App.UpdateFriendsView();
      }).catch(function(err){
        console.log(err);
      });
    });
  },

  UpdateFriendsView: function(){
    var friends_names;
    var friends_addresses;
    var amount;
    App.contracts.Friends.deployed().then(function(instance) {
      friendsInstance = instance;
      return friendsInstance.getFriends();
    }).then(function(result){
      friends_addresses = result[0];
      friends_names = result[1];
      amount = parseInt(result[2]);
      // console.log(web3.toAscii(result[1][0]));
      for(i=0; i < amount;i++){
        console.log(friends_addresses[i], web3.toAscii(friends_names[i]));
      }
    }).catch(function(err){
      console.log(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
