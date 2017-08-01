function clean () {
  $('#cardThree').empty()
  $('#cardTwo').empty()
  $('#cardOne').empty()
}

function displayCards (card1, card2, card3) {
  $('#cardOne').html("<img class='animated slideInDown shadowed' width='300' height='552' src='img/cards/" + card1.suit + '/' + card1.number + ".jpg'/><div class='animated slideInUp'><p>" + card1.name + "</p><p class='smallTxt'>" + card1.description + '</p></div>')

  setTimeout(function () {
    $('#cardTwo').html("<img class='animated slideInDown shadowed' width='300' height='552' src='img/cards/" + card2.suit + '/' + card2.number + ".jpg'/><div class='animated slideInUp'><p>" + card2.name + "</p><p class='smallTxt'>" + card2.description + '</p></div>')
  }, 800)

  setTimeout(function () {
    $('#cardThree').delay(5000).html("<img class='animated slideInDown shadowed' width='300' height='552' src='img/cards/" + card3.suit + '/' + card3.number + ".jpg'/><div class='animated slideInUp'><p>" + card3.name + "</p><p class='smallTxt'>" + card3.description + '</p></div>')
  }, 1600)
}

function compareCards (card1, card2, card3) {
  if (card3.number === card2.number || card3.number === card1.number) {
    console.log('Card 3 was a duplicate, picking again.')
    pickRandomCard(window.cards)
  } else if (card2.number === card1.number) {
    console.log('Card 2 was a duplicate, picking again.')
    pickRandomCard(window.cards)
  } else {
    displayCards(card1, card2, card3)
  }
}

function pickRandomCard (data) {
  var obj_keys = Object.keys(data)
  var ran_key1 = obj_keys[Math.floor(Math.random() * obj_keys.length)]
  var ran_key2 = obj_keys[Math.floor(Math.random() * obj_keys.length)]
  var ran_key3 = obj_keys[Math.floor(Math.random() * obj_keys.length)]
  var card1 = data[ran_key1]
  var card2 = data[ran_key2]
  var card3 = data[ran_key3]
  compareCards(card1, card2, card3)
}

$('#startButton').click(function () {
  clean()
  setTimeout(function () {
    pickRandomCard(window.cards)
  }, 300)
})

$(document).ready(function () {
  $.getJSON('js/cards.json').done(function (data) {
    window.cards = data
  })
})
