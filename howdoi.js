#!/usr/bin/env node

var cheerio = require('cheerio');
    request = require('request');

var args = require('optimist')
    .default({
        engine: 'google',
        site: ['stackoverflow.com', 'serverfault.com', 'superuser.com', 
            'askubuntu.com', '*.stackexchange.com'],
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
    .demand(1)
    .argv;


var query = ' ' + args._.join(' ').replace('^','-');

if (args.engine == 'duck') {
    var url = 'http://duckduckgo.com/html?q=' + encodeURIComponent(
        'site:' + args.site.join(',') + query);
    var links_selector = '.links_main a'
}
else if (args.engine == 'google') { 
    var url = 'http://www.google.com/cse?cx=003507065920591675867%3Axyxvbg8-oie&ie=UTF-8&nojs=1&q=' 
        + encodeURIComponent(query);
    var links_selector = '.r a.l';
}

request(url, function(e, r, body) {
    var res = args.result - 1, ans = args.answer - 1;

    var $ = cheerio.load(body),
        links = $(links_selector).map(function(i, el) { return el.attribs.href; });
    
    if (!args.code && args.links) for (var k = 0; k < res && links[k]; ++k)
        console.log("#" + (k+1), links[k]);
    if (!links[res]) 
        console.log("No more results");
    else request(links[args.result - 1], function(e, r, body) {
        var $ = cheerio.load(body);
        var answers = $('.post-text').map(function(i, el) { 
            if (args.code) return $(el).find('pre').text();
            return $(el).text(); 
        });
        if (args.links) console.log("#" + (res+1), links[res], '@', (ans+1) + '/' + answers.length);
        if (!answers.length) {
            console.log("Result has no answers. Try some other results e.g. --result 2");
            args.links = true;
        } 
        else if (!answers[ans]) {
            console.log("No such answer. Try using --result 2 etc");
            args.links = true;
        }
        else  
            console.log(answers[ans]);
        if (!args.code && !args.links) console.log("#" + (res+1), links[res], '@', (ans+1) + '/' + answers.length);

        if (!args.code && args.links) for (var k = res + 1; links[k]; ++k) 
            console.log("#" + (k+1), links[k]);
    });  
});
