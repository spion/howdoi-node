#!/usr/bin/env node

var cheerio = require('cheerio');
var request = require('request');
var clc = require('cli-color');

var args = require('optimist')
    .default({
        engine: 'google',
        site: ['stackoverflow.com'/*, 'serverfault.com', 'superuser.com',
            'askubuntu.com', '*.stackexchange.com'*/],
        result: 1,
        answer: 1,
        code: false,
        links: false
    })
    .describe('engine', 'google or duck')
    .describe('site', 'comma separated stackexchange sites')
    .describe('result', 'which search result')
    .describe('answer', 'which answer')
    .describe('code', 'extract only code')
    .describe('links', 'show all links')
    .describe('no-color', 'show results in plain text (default color)')
    .demand(1)
    .argv;


var query = ' ' + args._.join(' ').replace('^','-');

if (args.engine == 'duck') {
    var url = 'http://duckduckgo.com/html?q=' + encodeURIComponent(
        'site:' + args.site.join(',') + query);
    var links_selector = '.links_main a';
}
else if (args.engine == 'google') {
    var url = 'http://www.google.com/cse?cx=003507065920591675867%3Axyxvbg8-oie&ie=UTF-8&nojs=1&q=' +
              encodeURIComponent(query);
    var links_selector = '.r a.l';
}

var ansiTrim = require('cli-color/trim');
var aError = clc.red;
var aPlain = clc.white;
var aCode = clc.green.bold;
var aLink = clc.black.bold;

var aLog = console.log;

if(args.color === false) {
    aLog = function() {
        var a = [];
        for (var i = 0; i < arguments.length; i++) {
            a.push( (typeof arguments[i] === 'string') ? ansiTrim( arguments[i] ) : arguments[i] );
        }
        console.log.apply(this, a);
    };
}

if(process.env.HTTP_PROXY) {
    request = request.defaults({"proxy": process.env.HTTP_PROXY});
}

request(url, function(e, r, body) {
    var res = args.result - 1, ans = args.answer - 1;

    var $ = cheerio.load(body),
        links = $(links_selector).map(function(i, el) { return el.attribs.href; });
    
    if (!args.code && args.links) for (var k = 0; k < res && links[k]; ++k) {
        aLog(aLink("#" + (k+1)), aLink(links[k]));
    }
    if (!links[res]) {
        aLog(aError("No results found"));
    }
    else request(links[args.result - 1], function(e, r, body) {
        var $ = cheerio.load(body);
        var answers = $('.answer .post-text').map(function(i, el) {
            if (args.code) {
                return aCode($(el).find('pre').text());
            }
            var code = $(el).find('pre').text();
            return $(el).text().replace(code, aCode(code));
        });

        if (args.links) {
            aLog( aLink("#" + (res+1)), aLink(links[res]), aLink('@'), aLink((ans+1) + '/' + answers.length) );
        }

        if (!answers.length) {
            aLog( aError("Result has no answers. Try some other results e.g. --result 2") );
            args.links = true;
        }
        else if (!answers[ans]) {
            aLog( aError("No such answer. Try using --result 2 etc") );
            args.links = true;
        }
        else {
            aLog( answers[ans] );
        }

        if (!args.code && !args.links) {
            aLog( aLink("#" + (res+1)), aLink(links[res]), aLink('@'), aLink((ans+1) + '/' + answers.length) );
        }

        if (!args.code && args.links) for (var k = res + 1; links[k]; ++k) {
            aLog( aLink("#" + (k+1)), aLink(links[k]) );
        }
    });
});
