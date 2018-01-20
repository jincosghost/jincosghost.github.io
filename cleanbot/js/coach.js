var version = '0.0.4';

var flips = {
    'am': 'are',
    'your': 'my',
    'me': 'you',
    'myself': 'yourself',
    'yourself': 'myself',
    'i': 'you',
    'you': 'I',
    'my': 'your',
    'i\'m': 'you are',
};

// Various statements we should check for in the input
var checkStatements = {
    // indicates the session is done
    quits: [
        'bye',
        'goodbye',
        'exit',
        'quit',
        'cya',
    ],
    // indicates we're probably missing the mark
    smallLoop: [
        'yes',
        'no',
        'dunno',
        'don\'t know',
        'maybe',
    ],
    // indicates risk
    danger: [
        'suicide',
        'kill',
        'hurt',
        'murder',
        'rape',
    ],
    // stop words
    stops: [
        'a', 'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another',
        'any', 'are', 'as', 'at', 
        'be', 'because', 'been', 'before', 'being', 'between', 'both', 'but',
        'by',
        'came', 'can', 'come', 'could', 
        'did', 'do', 
        'each', 
        'for', 'from', 
        'get', 'got',
        'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his',
        'how',
        'i', 'if', 'in', 'into', 'is', 'it', 
        'like', 
        'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must', 'my', 
        'never', 'now', 
        'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
        'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such',
        'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there',
        'these', 'they', 'this', 'those', 'through', 'to', 'too', 
        'under', 'up', 
        'very', 
        'was', 'way', 'we', 'well', 'were', 'what', 'where', 'which', 'while', 
        'who', 'with', 'would', 
        'you', 'your', 
    ],
};

// @todo use these better
// Static responses for certain situations
var staticResponses = {
    finals: [
        'Goodbye.  It was nice talking to you.',
        'Goodbye.  This was really a nice talk.',
        'Goodbye.  I\'m looking forward to our next session.',
    ],
    initials: [
        'Hello there.',
    ],
};

// Clean Language Questions
var cleanQuestions = {
    NONES: [
        'and what would you like to have happen?',
        'and is there anything else?',
        'and what happens next?',
        'and then what happens?',
    ],
    GENERIC_QS: [
        'and is there anything else about that?',
        'and whereabouts D you feel T?',
        'and what Z Q like?',
        'and what happens just before T?',
        'and where could Q come from?',
        'and where would Q come from?',
        'and if Q H, what would you like to happen now?',
        'and what needs to happen for Q?',
    ],
    X_QS: [
        'and what kind of X Z Q?',
        'and what kind of X Z R X?',
        'and is there anything else about X?',
        'and where Z X?',
        'and whereabouts Z X?',
        'and X Q like what?',
        'and that\'s X like what?',
        'and when X H, what happens next?',
        'and what happens after X?',
        'and what happens just before X?',
        'and where could X come from?',
        'and what needs to happen for X?',
        'and can X happen?',
    ],
    XY_QS: [
        'and what is the relationship between X and Y?',
        'and what is the relationship between Y and X?',
        'and when X H, what happens to Y?',
        'and when Y happens, what happens to X?',
    ],
    NE_QS: [
        'and what would X like to have happen?',
    ],
};

/**
 * @function coach
 * @param  {Object} opts options
 */
function Coach() {
    this.debug = false;
    this.version = version;
    if (!this._initialised) this._init();
    this.reset();
}

Coach.prototype.reset = function() {
    this.iteration = 1;
    this.quit = false;
    this.danger = false;
    this.previousQuestion = null;
    this.previousChoice = null;
};

Coach.prototype._initialised = false;

Coach.prototype._init = function() {
    Coach.prototype._initialised = true;
};

Coach.prototype.getInitials = function() {
    return staticResponses.initials[Math.floor(Math.random() * 
        staticResponses.initials.length)];
};

Coach.prototype.getFinal = function() {
    return staticResponses.finals[Math.floor(Math.random() * 
            staticResponses.finals.length)];
};

Coach.prototype.getResponse = function(str) {
    var that = this;
    return new Promise(function(resolve, reject) {
        var response = that.respond(str);
        if (that.quit) {
            resolve({final: response});
        } else if (that.danger) {
            resolve({danger: response});
        } else {
            resolve({reply: response});
        }
    });
};

Coach.prototype.respond = function(str) {
    this.quit = false;
    this.danger = false;

    // default response
    var response = 'and what would you like to have happen?';

    // string transformation
    var ogStr = str;
    var newStr = str.toLowerCase().trim();

    // check for quit statements and remove stop words
    var parts = newStr.split(' ');
    var i = 0;
    var s = [];

    // construct reflective statement
    for (i = 0; i < parts.length; i++) {
        for (var f in flips) {
            if (!flips.hasOwnProperty(f)) continue;
            if (parts[i] == f) {
                parts[i] = flips[f];
                i++;
            }
        }
    }
    var reflection = 'and ' + parts.join(' ') + ',';

    // check for quit statements and remove stop words
    for (i = 0; i < parts.length; i++) {
        if (checkStatements.quits.indexOf(parts[i]) >= 0) {
            this.quit = true;
            return this.getFinal();
        } else if (checkStatements.stops.indexOf(parts[i]) >= 0) {
            s.push(parts[i]);
            parts.splice(i, parts[i].length);
        }
    }

    newStr = parts.join(' ');

    // @todo need to replace compromise.js with native solution
    var msg = window.nlp(newStr);

    var nouns = [];
    var verbs = [];
    var people = [];

    var ns = msg.nouns().data();
    var vs = msg.verbs().data();
    var ps = msg.people().data();

    for (i = 0; i < ns.length; i++) {
        nouns.push(ns[i].normal);
    }
    for (i = 0; i < vs.length; i++) {
        verbs.push(vs[i].normal);
    }
    for (i = 0; i < ps.length; i++) {
        people.push(ps[i].normal);
    }

    var nl = nouns.length;
    var vl = verbs.length;
    var pl = people.length;

    // @todo this is ugly as sin
    var a = /X/g;
    var b = /Y/g;
    var c = /Z/g;
    var d = /Q/g;
    var e = /T/g;
    var g = /R/g;
    var h = /H/g;
    var j = /D/g;
    var X;
    var Y;
    var Z;

    /**
     * Get random question from possible choices
     * @function getQuestion
     * @param  {Array} arr array of possibilities
     * @return {string} selected question
     */
    function getQuestion(arr) {
        var pc = 0;
        var choice = arr[Math.floor(Math.random() * arr.length)];
        var question = cleanQuestions[choice][Math.floor(Math.random() * 
                cleanQuestions[choice].length)];
        while (question == this.previousQuestion || 
                    (choice == this.previousChoice && pc < 2)) {
            pc = pc = 1;
            question = cleanQuestions[choice][Math.floor(Math.random() * 
                    cleanQuestions[choice].length)];
        }
        this.previousQuestion = question;
        this.previousChoice = choice;
        return question;
    }

    /**
     * Choose between plural or singular forms
     * @function getMods
     * @param  {string} str
     * @return {string}
     */
    function getMods(str) {
        // @todo better way of finding plurals
        if (str && window.nlp(str).nouns().hasPlural() && 
                    str.substr(str.length - 1) == 's') {
            return ['are', 'they', 'them', 'those', 'happens'];
        } else {
            return ['is', 'that', 'that', 'that', 'happen'];
        }
    }

    if (nl > 0 && vl > 0) {
        // 1 or more nouns AND verbs
        response = getQuestion(['NONES', 'GENERIC_QS', 'X_QS', 'XY_QS', 'X_QS', 'XY_QS']);
        X = nouns[Math.floor(Math.random() * nl)];
        Y = verbs[Math.floor(Math.random() * vl)];
        response = response.replace(a, '\'' + X + '\'');
        response = response.replace(b, '\'' + Y + '\'');
    } else if (nl > 0) {
        // 1 or more nouns only
        response = getQuestion(['NONES', 'GENERIC_QS', 'X_QS']);
        X = nouns[Math.floor(Math.random() * nl)];
        response = response.replace(a, '\'' + X + '\'');
    } else if (vl > 0) {
        // 1 or more verbs only
        response = getQuestion(['NONES', 'GENERIC_QS', 'X_QS']);
        X = verbs[Math.floor(Math.random() * vl)];
        response = response.replace(a, '\'' + X + '\'');
    } else if (pl > 0) {
        // 1 or more named entity only
        response = getQuestion(['NONES', 'GENERIC_QS', 'NE_QS']);
        X = people[Math.floor(Math.random() * pl)];
        response = response.replace(a, '\'' + X + '\'');
    } else {
        // none of the above
        response = getQuestion(['NONES']);
    }

    Z = getMods(X);
    response = response.replace(c, Z[0]);
    response = response.replace(d, Z[1]);
    response = response.replace(e, Z[2]);
    response = response.replace(g, Z[3]);
    response = response.replace(h, Z[4]);

    // @todo figure out if we're talking about something actual or something hypothetical
    var future = false;
    if (future) {
        response = response.replace(j, 'would');
    } else {
        response = response.replace(j, 'do');
    }

    // @todo this needs to be moved to Coach.prototype.getResponse
    if (this.debug) {
        console.log('Iteration: ' + this.iteration);
        console.log('Original string: ' + ogStr);
        console.log('Modified string: ' + newStr);
        console.log('Reflection: ' + reflection);
        console.log('Stop words removed: ' + s.length + ': (' + s + ')');
        console.log('Compromise string: ' + msg.out('text'));
        console.log(nl + ' noun(s): ' + nouns);
        console.log(vl + ' verb(s): ' + verbs);
        console.log(pl + ' person(s): ' + people);
        console.log('Selected response: ' + response);
    }
    this.iteration = this.iteration + 1;

    return reflection + ' ' + response;
};
