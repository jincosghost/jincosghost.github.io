var message = document.getElementById('message');
var question = document.getElementById('question');
var thinking = document.getElementById('thinking');
var debugSwitch = document.getElementById('debug');
var speakSwitch = document.getElementById('speak');
var dictButt = document.getElementById('dictButt');

var GENERIC_QS = [
    'and is there anything else about that?',
    'and whereabouts do you feel that?',
    'and what is that like?',
    'and what happens just before that?',
    'and what happens next?',
    'and then what happens?',
    'and where would that come from?',
    'and where could that come from?',
    'and if that happens, what would you like to happen now?',
    'and what needs to happen for that?',
];

var X_QS = [
    'and what kind of X is that?',
    'and what kind of X is that X?',
    'and is there anything else about X?',
    'and where is X?',
    'and whereabouts is X?',
    'and that\'s X like what?',
    'and when X happens, what happens next?',
    'and what happens after X?',
    'and what happens just before X?',
    'and where could X come from?',
    'and what needs to happen for X?',
    'and can X happen?',
];

var XY_QS = [
    'and what is the relationship between X and Y?',
    'and when X happens, what happens to Y?',
];

var NE_QS = ['and what would X like to have happen?'];

/**
 * @function startDictation
 */
function startDictation() {
    var recognition = new webkitSpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang = document.getElementById('dictLang').value;
    recognition.start();

    var img = document.getElementById('dictImg');
    img.innerText = 'hearing';
    dictButt.classList.remove('teal');
    dictButt.classList.remove('red');
    dictButt.classList.add('green');

    recognition.onspeechend = function() {
        recognition.stop();
        img.innerText = 'mic';
        dictButt.classList.remove('green');
        dictButt.classList.remove('red');
        dictButt.classList.add('teal');
    };

    recognition.onresult = function(e) {
        message.value = e.results[0][0].transcript;
        recognition.stop();
        img.innerText = 'mic';
        dictButt.classList.remove('green');
        dictButt.classList.remove('red');
        dictButt.classList.add('teal');
        main(message.value);
    };

    recognition.onnomatch = function(e) {
        recognition.stop();
        img.innerText = 'mic';
        dictButt.classList.remove('green');
        dictButt.classList.remove('red');
        dictButt.classList.add('teal');
    };

    recognition.onerror = function(e) {
        recognition.stop();
        img.innerText = 'mic_off';
        dictButt.classList.remove('teal');
        dictButt.classList.remove('green');
        dictButt.classList.add('red');
        console.log('dictation error: is your microphone enabled?');
    };
}

/**
 * @function main
 * @param  {string} text input message
 */
function main(text) {
    question.innerText = '...';

    // stop words
    var stops = [
        'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 
        'are', 'as', 'at', 'be',
        'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by',
        'came', 'can',
        'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got',
        'has', 'had',
        'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
        'if', 'in', 'into',
        'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most',
        'much', 'must',
        'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out',
        'over',
        'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such',
        'take', 'than',
        'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
        'this', 'those',
        'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 
        'well', 'were',
        'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 
        'your', 'a', 'i',
    ];

    // handle options
    var debug = debugSwitch.checked;
    var speak = speakSwitch.checked;
    var thinkingTime = Math.floor(Math.random() * thinking.valueAsNumber) + 
                thinking.valueAsNumber / 2 + 1;

    var response = 'and what would you like to have happen?';

    var nouns = [];
    var verbs = [];
    var people = [];

    var msg = window.nlp(text);

    var ns = msg.nouns().data();
    var vs = msg.verbs().data();
    var ps = msg.people().data();

    var i = 0;
    for (i = 0; i < ns.length; i++) {
        if (stops.indexOf(ns[i].normal) === -1) {
            nouns.push(ns[i].normal);
        }
    }
    for (i = 0; i < vs.length; i++) {
        if (stops.indexOf(vs[i].normal) === -1) {
            verbs.push(vs[i].normal);
        }
    }
    for (i = 0; i < ps.length; i++) {
        if (stops.indexOf(ps[i].normal) === -1) {
            people.push(ps[i].normal);
        }
    }

    var nl = nouns.length;
    var vl = verbs.length;
    var pl = people.length;

    var a = /X/g;
    var b = /Y/g;
    var X;
    var Y;
    var possible;
    var choice;

    if (debug) {
        console.log('Input: "' + msg.out('text') + '"');
        console.log('Thinking time: ' + thinkingTime + 'ms');
        console.log(nl + ' noun(s): ' + nouns);
        console.log(vl + ' verb(s): ' + verbs);
        console.log(pl + ' person(s): ' + people);
    }

    if (nl > 0 && vl > 0) {
        possible = [GENERIC_QS, X_QS, XY_QS];
        choice = possible[Math.floor(Math.random() * possible.length)];
        response = choice[Math.floor(Math.random() * choice.length)];

        X = nouns[Math.floor(Math.random() * nl)];
        Y = verbs[Math.floor(Math.random() * vl)];
        
        response = response.replace(a, '\'' + X + '\'');
        response = response.replace(b, '\'' + Y + '\'');
    } else if (nl > 0) {
        possible = [GENERIC_QS, X_QS];
        choice = possible[Math.floor(Math.random() * possible.length)];
        response = choice[Math.floor(Math.random() * choice.length)];

        X = nouns[Math.floor(Math.random() * nl)];

        response = response.replace(a, '\'' + X + '\'');
    } else if (vl > 0) {
        possible = [GENERIC_QS, X_QS];
        choice = possible[Math.floor(Math.random() * possible.length)];
        response = choice[Math.floor(Math.random() * choice.length)];

        X = verbs[Math.floor(Math.random() * vl)];

        response = response.replace(a, '\'' + X + '\'');
    } else if (pl > 0) {
        possible = [GENERIC_QS, NE_QS];
        choice = possible[Math.floor(Math.random() * possible.length)];
        response = choice[Math.floor(Math.random() * choice.length)];

        X = people[Math.floor(Math.random() * pl)];

        response = response.replace(a, '\'' + X + '\'');
    } else {
        response = GENERIC_QS[Math.floor(Math.random() * GENERIC_QS.length)];
    }

    setTimeout(function() {
        question.innerText = response;
        if (speak) {
            var m = new SpeechSynthesisUtterance(response);
            window.speechSynthesis.speak(m);
        }
    }, thinkingTime);
}

$(document).ready(function() {
    message.addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            main(message.value);
            message.value = '';
        }
    });
    
    thinking.addEventListener('change', function() {
        document.getElementById('milli').innerText = thinking.value;
    });

    if (!window.hasOwnProperty('webkitSpeechRecognition')) {
        dictButt.hide();
    } else {
        dictButt.addEventListener('click', function() {
            startDictation();
        });
    }

    $('select').select();
    $('.modal').modal();
    $('.fixed-action-btn').floatingActionButton();
});
