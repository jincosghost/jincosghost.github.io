// I/O elements
var txtInput = document.getElementById('txtInput');
var outputDiv = document.getElementById('outputDiv');

// Options elements
var thinking = document.getElementById('thinking');
var debugSwitch = document.getElementById('debugChk');
var speakSwitch = document.getElementById('speakChk');

// Dictation elements
var dictBttn = document.getElementById('dictBttn');
var dictImg = document.getElementById('dictImg');
var dictLang = document.getElementById('dictLang');

// Modals
var optionsModal = document.getElementById('optionsMDL');
var errorModal = document.getElementById('errorMDL');

// Coach - initialised on window load below
var coach = new Coach();

/**
 * Handle speech recognition
 * @function startDictation
 */
function startDictation() {
    var recognition = new webkitSpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang = dictLang.value;
    recognition.start();

    dictImg.innerText = 'hearing';
    dictBttn.classList.remove('red');
    dictBttn.classList.add('green');

    recognition.onspeechend = function() {
        recognition.stop();
        dictImg.innerText = 'mic';
        dictBttn.classList.remove('green');
        dictBttn.classList.remove('red');
    };

    recognition.onresult = function(e) {
        txtInput.value = e.results[0][0].transcript;
        recognition.stop();
        dictImg.innerText = 'mic';
        dictBttn.classList.remove('green');
        dictBttn.classList.remove('red');
        main(txtInput.value);
    };

    recognition.onnomatch = function(e) {
        recognition.stop();
        dictImg.innerText = 'mic';
        dictBttn.classList.remove('green');
        dictBttn.classList.remove('red');
    };

    recognition.onerror = function(e) {
        recognition.stop();
        dictImg.innerText = 'mic_off';
        dictBttn.classList.remove('green');
        dictBttn.classList.add('red');
        console.log('dictation error: is your microphone enabled?');
    };
}

/**
 * @function main
 * @param  {string} text input message
 */
function main(text) {
    // Empty and disable text input while responding
    txtInput.value = '';
    txtInput.disabled = true;

    // Create speech bubbles
    var p = document.createElement('p');
    var m = document.createElement('p');
    m.classList.add('from-me');
    p.classList.add('callout');
    m.innerText = text;
    p.innerText = '...';
    outputDiv.appendChild(m);
    outputDiv.scrollTop = outputDiv.scrollHeight;

    // Handle options
    coach.debug = debugSwitch.checked;
    var thinkingTime = Math.floor(Math.random() * thinking.valueAsNumber) + 
                thinking.valueAsNumber / 2 + 1;

    // Generate response from coach
    var response = 'and what would you like to have happen?';
    coach.getResponse(text).then(function(r) {
        if (r.reply) {
            // standard reply
            response = r.reply;
        } else if (r.final) {
            // quitting reply
            response = r.final;
            coach.reset();
        } else if (r.danger) {
            // handle dangerous situations here
            response = r.danger;
            // handleDanger();
        }
    }).catch(function(err) {
        console.error(err);
    });

    // Respond after thinkingTime
    setTimeout(function() {
        outputDiv.appendChild(p);
        setTimeout(function() {
            p.innerText = response;
            if (speakSwitch.checked) {
                var m = new SpeechSynthesisUtterance(response);
                window.speechSynthesis.speak(m);
            }
            outputDiv.scrollTop = outputDiv.scrollHeight;
            // Re-enable text input after responding
            txtInput.disabled = false;
            txtInput.focus();
        }, thinkingTime);
    }, 150);
}

/**
 * @function handleError
 * @param  {string} err error message
 */
function handleError(err) {
    var t = document.getElementById('errorTxt');
    t.innerText = err;
    window.M.Modal.getInstance(errorModal).open();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialise error modal
    window.M.Modal.init(errorModal);

    /**
     * @function handleTxt
     */
    function handleTxt() {
        if (txtInput.value.trim().length == 0 || txtInput.value == '') {
            handleError('You need to enter a message first!');
        } else {
            main(txtInput.value);
        }
    }

    // Handle enter key on txtInput
    txtInput.addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) handleTxt();
    }, false);

    // Handle send button click
    document.getElementById('sendBttn').addEventListener('click', function() {
        handleTxt();
    }, false);

    // Disable dictation button if not available
    if (!window.hasOwnProperty('webkitSpeechRecognition')) {
        dictImg.innerText = 'mic_off';
        dictBttn.disabled = true;
        dictBttn.tabIndex = -1;
        dictBttn.style.pointerEvents = 'none';
        dictBttn.setAttribute('aria-disabled', 'true');
    } else {
        dictBttn.addEventListener('click', function() {
            startDictation();
        });
    }
    
    // Handle thinking time slider label updates
    var ttLabel = document.getElementById('milli'); // define this outside the function so we don't need to find it ever update
    thinking.addEventListener('change', function() {
        ttLabel.innerText = thinking.value;
    }, false);

    // Initialise the remaining material elements
    window.M.Modal.init(optionsModal);
    window.M.Select.init(dictLang);

    // Service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: './'})
        .then(function(registration, err) {
            if (err) console.error('ServiceWorker failed: ', err);
        });
    }
}, false);
