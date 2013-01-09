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
        code: false
    })
    .describe('engine', 'google or duck')
    .describe('site', 'comma separated stackexchange sites')
    .describe('result', 'which search result')
    .describe('answer', 'which answer')
    .describe('code', 'extract only code')
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

request(url, function(e, res, body) {
    var $ = cheerio.load(body),
        links = $(links_selector).map(function(i, el) { return el.attribs.href; });
    
    if (!links[args.result]) 
        console.log("No more results");
    else request(links[args.result], function(e, res, body) {
        var $ = cheerio.load(body);
        var answers = $('.post-text').map(function(i, el) { 
            if (args.code) return $(el).find('pre').text();
            return $(el).text(); 
        });
        if (!answers.length) 
            console.log("Result has no answers. Try using --result 2 etc");
        else if (!answers[args.answer]) 
            console.log("No such answer. Try using --result 2 etc");
        else  
            console.log(answers[args.answer]);
        if (!args.code) 
            console.log(links[args.result], '(' + args.answer + "/" + answers.length + ')');
    });  
});
