# howdoi-node 

Ask your computer how to do things from the command line. 

Programming, server administration, system administration, general PC/Mac questions, math, even music  all stackexchange sites supported.

Inspired by the original [howdoi](https://github.com/gleitz/howdoi) 

Smaller, more full-featured, packed with extra options and not limited to code.

# Usage

    % howdoi learn to play bach
    What a great question! I am currently working my way through the second book, 
    so I have more specific opinions about that. Of those I've learnt from the first book, 
    I found the following to be less tricky:


    The C major prelude, of course. Curtis is right about the difficulty of the fugue, however.
    c minor prelude and fugue are a good first pair to learn
    ...
    [snip]
    ...
    http://music.stackexchange.com/questions/551/bachs-well-tempered-clavier-order (1/5)

## Extra options

* --engine   google or duck                       [default: "google"]
* --site     comma separated stackexchange sites  [default: ["stackoverflow.com","serverfault.com","superuser.com","askubuntu.com","\*.stackexchange.com"]]
* --result   which search result                  [default: 1]
* --answer   which answer                         [default: 1]
* --code     extract only code                    [default: false]
* --links    show all links                       [default: false]
* --no-color show response in text plain          [default: colored]


