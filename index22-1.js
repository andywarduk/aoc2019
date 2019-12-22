const fs = require('fs')
const path = require('path')

// Tests
for (let i = 1; i <= 8; i++) {
    const [cards, actions] = getInput(i)

    shuffle(cards, actions)
}

const [cards, actions] = getInput(0)

const deck = shuffle(cards, actions)

console.log(deck.indexOf(2019))


function shuffle(cards, actions)
{
    let deck = new Array(cards)

    for (let i = 0; i < cards; i++){
        deck[i] = i
    }

    for (let action of actions) {
        const words = action.split(' ')

        switch (words[0]) {
        case "cut":
            deck = cutDeck(deck, parseInt(words[1]))
            break
        case "deal":
            switch (words[1]) {
            case "into":
                deck = newStack(deck)
                break
            case "with":
                deck = deal(deck, parseInt(words[3]))
                break
            }
            break
        case "Result:":
            compare(deck, words.slice(1).map(x => parseInt(x)))
            break
        }
    }

    return deck
}

function cutDeck(deck, from)
{
    const cut = deck.splice(from)
    deck.splice(0, 0, ...cut)

    return deck
}

function newStack(deck)
{
    deck.reverse()
    return deck
}

function deal(deck, stride)
{
    const newDeck = new Array(deck.length)

    let elem = 0
    for (let c of deck) {
        newDeck[elem] = c
        elem = (elem + stride) % deck.length
    }

    return newDeck
}

function compare(deck, cmpDeck) {
    for (let i = 0; i < deck.length; i++) {
        if (deck[i] != cmpDeck[i]) {
            console.log(`${deck.join(',')} != ${cmpDeck.join(',')}`)
            break
        }
    }
}

function getInput(num)
{
    let input
    let cards

    switch(num) {
    case 0:
        input = fs.readFileSync(path.join(__dirname, 'input22.txt'), {encoding: 'utf8'})

        input = input.split('\n')

        cards = 10007

        break

    case 1:
        input = [
            'deal into new stack',
            'Result: 9 8 7 6 5 4 3 2 1 0'
        ]

        cards = 10

        break

    case 2:
        input = [
            'cut 3',
            'Result: 3 4 5 6 7 8 9 0 1 2'
        ]

        cards = 10

        break

    case 3:
        input = [
            'cut -4',
            'Result: 6 7 8 9 0 1 2 3 4 5'
        ]

        cards = 10

        break
        
    case 4:
        input = [
            'deal with increment 3',
            'Result: 0 7 4 1 8 5 2 9 6 3'
        ]

        cards = 10

        break
                
    case 5:
        input = [
            'deal with increment 7',
            'deal into new stack',
            'deal into new stack',
            'Result: 0 3 6 9 2 5 8 1 4 7',
        ]

        cards = 10

        break

    case 6:
        input = [
            'cut 6',
            'deal with increment 7',
            'deal into new stack',
            'Result: 3 0 7 4 1 8 5 2 9 6',
        ]

        cards = 10

        break

    case 7:
        input = [
            'deal with increment 7',
            'deal with increment 9',
            'cut -2',
            'Result: 6 3 0 7 4 1 8 5 2 9',
        ]

        cards = 10

        break

    case 8:
        input = [
            'deal into new stack',
            'cut -2',
            'deal with increment 7',
            'cut 8',
            'cut -4',
            'deal with increment 7',
            'cut 3',
            'deal with increment 9',
            'deal with increment 3',
            'cut -1',
            'Result: 9 2 5 8 1 4 7 0 3 6'
        ]

        cards = 10

        break

    }

    return [cards, input]
}

