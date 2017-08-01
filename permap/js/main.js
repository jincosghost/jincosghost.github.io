/* jshint globalstrict: true, browser: true, devel: true, sub: true, esversion: 5, asi: true, -W041 */
/* global $, Materialize, Chart */

'use strict'; // eslint-disable-line
var testNo = 0 // testNo becomes a count of previous tests in localStorage
var storage = false // localStorage availability

/**
* Test if localStorage is available
* @function lsTest
* @return {bool}
*/
function lsTest () {
  var test = 'test'
  try {
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    if (storage != null) storage = true
    return true
  } catch (e) {
    if (storage != null) storage = false
    return false
  }
}

/**
* Sum input slider values
* @function calcSliders
* @param {element} x the slider element
* @return {Number}
*/
function calcSliders (x) {
  var sliderValues = []
  var total = 0
  var index
  var len
  sliderValues.push(parseInt($(x).val(), 10))
  for (index = 0, len = sliderValues.length; index < len; ++index) {
    total += sliderValues[index]
  }
  return total
}

function calculateScores () {
  // define our containers
  var PERMAScores = {
    'Positive Emotion': 0,
    'Engagement': 0,
    'Relationships': 0,
    'Meaning': 0,
    'Accomplishment': 0,
    'Negative Emotion': 0,
    'Health': 0,
    'Loneliness': 0,
    'Happy': 0
  }

  // get values from sliders, convert to readable number, and dump the results in the corresponding container then add them up
  $('input[id^=P]').each(function () {
    PERMAScores['Positive Emotion'] += calcSliders(this)
  })
  $('input[id^=E]').each(function () {
    PERMAScores['Engagement'] += calcSliders(this)
  })
  $('input[id^=R]').each(function () {
    PERMAScores['Relationships'] += calcSliders(this)
  })
  $('input[id^=M]').each(function () {
    PERMAScores['Meaning'] += calcSliders(this)
  })
  $('input[id^=A]').each(function () {
    PERMAScores['Accomplishment'] += calcSliders(this)
  })
  $('input[id^=N]').each(function () {
    PERMAScores['Negative Emotion'] += calcSliders(this)
  })
  $('input[id^=H]').each(function () {
    PERMAScores['Health'] += calcSliders(this)
  })

  // these sliders are just single values so no containers are required
  PERMAScores['Loneliness'] = parseInt($('#LON').val(), 10)
  PERMAScores['Happy'] = parseInt($('#Z1').val(), 10)

  // calculate results to two decimal places
  for (var key in PERMAScores) {
    if (PERMAScores.hasOwnProperty(key)) {
      if (key === 'Happy' || key === 'Loneliness') {
        PERMAScores[key] = PERMAScores[key]
      } else {
        PERMAScores[key] = parseFloat((PERMAScores[key] / 3).toFixed(2))
      }
    }
  }

  // calculate overall wellbeing score
  var owTotal =
    PERMAScores['Positive Emotion'] +
    PERMAScores['Engagement'] +
    PERMAScores['Relationships'] +
    PERMAScores['Meaning'] +
    PERMAScores['Accomplishment'] +
    PERMAScores['Happy']
  PERMAScores['Overall'] = parseFloat((owTotal / 6).toFixed(2))

  // Display text
  $('.pRes').text(PERMAScores['Positive Emotion'])
  $('.eRes').text(PERMAScores['Engagement'])
  $('.rRes').text(PERMAScores['Relationships'])
  $('.mRes').text(PERMAScores['Meaning'])
  $('.aRes').text(PERMAScores['Accomplishment'])
  $('.nRes').text(PERMAScores['Negative Emotion'])
  $('.hRes').text(PERMAScores['Health'])
  $('.lonRes').text(PERMAScores['Loneliness'])
  $('.owRes').text(PERMAScores['Overall'])

  // hide the testCards and scroll to the top of the page
  document.getElementById('quizPane').classList.add('hidden')
  window.scrollTo(0, 0)
  document.getElementById('resultsPane').classList.remove('hidden')

  // generate chart
  var dataArr = [
    PERMAScores['Positive Emotion'],
    PERMAScores['Engagement'],
    PERMAScores['Relationships'],
    PERMAScores['Meaning'],
    PERMAScores['Accomplishment'],
    PERMAScores['Negative Emotion'],
    PERMAScores['Health'],
    PERMAScores['Overall']
  ]
  var data = {
    labels: ['P', 'E', 'R', 'M', 'A', 'N', 'H', 'OW'],
    datasets: [
      {
        label: 'Your Results',
        backgroundColor: '#2196f3',
        data: dataArr
      }
    ]
  }

  var dataCompare = {
    labels: ['P', 'E', 'R', 'M', 'A', 'N', 'H', 'OW'],
    datasets: [
      {
        label: 'Your Results',
        backgroundColor: '#2196f3',
        data: dataArr
      },
      {
        label: 'Average',
        backgroundColor: '#00bcd4',
        data: [6.79, 7.41, 6.99, 7.17, 7.37, 7.14, 4.49, 7.03]
      }
    ]
  }

  var opts = {
    scales: {
      yAxes: [{
        ticks: {
          max: 10,
          min: 0,
          stepSize: 1,
          beginAtZero: true
        }
      }]
    }
  }

  var ctx = document.getElementById('resultsChart').getContext('2d')
  var myBarChart // eslint-disable-line
  if ($('#goCompare').prop('checked')) {
    myBarChart = new Chart(ctx, {
      type: 'bar',
      data: dataCompare,
      options: opts
    })
  } else {
    myBarChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: opts
    })
    $('#keyText').hide()
  }

  // print results page header
  var d = new Date()
  var month = d.getMonth() + 1
  var day = d.getDate()
  var outputDate = (('' + day).length < 2 ? '0' : '') + day + '/' +
    (('' + month).length < 2 ? '0' : '') + month + '/' +
    d.getFullYear()

  var inp = $('#nameInput').val()
  var tinp = $.trim(inp)
  if (tinp.length > 0) {
    $('#topText').text('PERMA-P - ' + inp + "'s PERMA Profile - " + outputDate)
  } else {
    $('#topText').text('PERMA-P - ' + 'PERMA Profile Results - ' + outputDate)
    tinp = 'Anon'
  }

  if (storage === true) {
    var lsd = {
      'Name': tinp,
      'DateString': d,
      'Date': outputDate,
      'P': PERMAScores['Positive Emotion'],
      'E': PERMAScores['Engagement'],
      'R': PERMAScores['Relationships'],
      'M': PERMAScores['Meaning'],
      'A': PERMAScores['Accomplishment'],
      'N': PERMAScores['Negative Emotion'],
      'H': PERMAScores['Health'],
      'L': PERMAScores['Loneliness'],
      'O': PERMAScores['Overall']
    }
    window.localStorage.setItem('PNS' + (testNo += 1), JSON.stringify(lsd))
  }
}

/**
* update slider label according to slider value
* @function updatevalues
* @param {Object} x slider DOM element
*/
function updatevalues (x) { // eslint-disable-line
  $(x).next('span').next('span').text(x.value)
}

/**
* Hide this block, show the next
* @function nextBlock
* @param {Object} x Anchor DOM element
*/
function nextBlock (x) { // eslint-disable-line
  // hide the current block, find the next one and show it
  var thisBlock = $(x).closest('div.block')
  $(thisBlock).hide()
  $(thisBlock).next('div.block').show()
}

/**
* Load and display previous scores from localStorage
* @function getPreviousScores
*/
function getPreviousScores () {
  if (testNo !== 0) {
    for (var i = 0; i < testNo; i++) {
      var retrievedObject = window.localStorage.getItem('PNS' + (i + 1))
      var q = JSON.parse(retrievedObject)
      $('.tbody').append('<tr><td>' + q.Name + '</td><td>' + q.Date +
                '</td><td>' + q.P + '</td><td>' + q.N +
                '</td><td>' + q.E + '</td><td>' + q.R +
                '</td><td>' + q.M + '</td><td>' + q.A +
                '</td><td>' + q.H + '</td><td>' + q.L +
                '</td><td>' + q.O + '</td></tr>')
    }
    $('.prevResTable').show()
  }
}

/**
* Clear scores from localStorage
* @function clearPreviousScores
*/
function clearPreviousScores () { // eslint-disable-line
  $('.tbody').empty()
  $.each(window.localStorage, function (i, v) {
    if (i.match(/^PNS/)) {
      window.localStorage.removeItem(i)
    }
  })
  Materialize.toast('Previous scores cleared', 2500)
}

/**
* Determine pressed key and act accordingly
* @function checkKey
* @param {event} e window.event
*/
function checkKey (e) {
  e = e || window.event
  if (e.keyCode === 39) {
    var x = $('.btnNext:visible')
    x.click()
  }
}

$(document).ready(function () {
  // hide all test blocks except the first
  $('.block').not(':first').hide()
  $('.prevResTable').hide()

  // lazyload CSS
  function loadCss (filename) {
    var l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = filename
    var h = document.getElementsByTagName('head')[0]
    h.parentNode.insertBefore(l, h)
  }
  loadCss('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.1/css/materialize.min.css')
  loadCss('css/main.css')
  loadCss('https://fonts.googleapis.com/icon?family=Material+Icons')

  // test localStorage availability
  lsTest()

  // if localStorage is available, itterate test number
  if (storage === true) {
    $.each(window.localStorage, function (i, v) {
      if (i.match(/^PNS/)) {
        testNo += 1
      }
    })
    getPreviousScores()
  } else {
    Materialize.toast('Offline storage unavailable. Score saving disabled.', 4000)
  }

  // set some global chart options
  Chart.defaults.global.responsive = true

  // check for keypresses
  document.onkeydown = checkKey

  // service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function (err) {
      console.log('ServiceWorker registration failed: ', err)
    })
  }
})
