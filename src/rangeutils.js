export const cards = [
    "AA", "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "AKo", "KK", "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
    "AQo", "KQo", "QQ", "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s", "Q5s", "Q4s", "Q3s", "Q2s",
    "AJo", "KJo", "QJo", "JJ", "JTs", "J9s", "J8s", "J7s", "J6s", "J5s", "J4s", "J3s", "J2s",
    "ATo", "KTo", "QTo", "JTo", "TT", "T9s", "T8s", "T7s", "T6s", "T5s", "T4s", "T3s", "T2s",
    "A9o", "K9o", "Q9o", "J9o", "T9o", "99", "98s", "97s", "96s", "95s", "94s", "93s", "92s",
    "A8o", "K8o", "Q8o", "J8o", "T8o", "98o", "88", "87s", "86s", "85s", "84s", "83s", "82s",
    "A7o", "K7o", "Q7o", "J7o", "T7o", "97o", "87o", "77", "76s", "75s", "74s", "73s", "72s",
    "A6o", "K6o", "Q6o", "J6o", "T6o", "96o", "86o", "76o", "66", "65s", "64s", "63s", "62s",
    "A5o", "K5o", "Q5o", "J5o", "T5o", "95o", "85o", "75o", "65o", "55", "54s", "53s", "52s",
    "A4o", "K4o", "Q4o", "J4o", "T4o", "94o", "84o", "74o", "64o", "54o", "44", "43s", "42s",
    "A3o", "K3o", "Q3o", "J3o", "T3o", "93o", "83o", "73o", "63o", "53o", "43o", "33", "32s",
    "A2o", "K2o", "Q2o", "J2o", "T2o", "92o", "82o", "72o", "62o", "52o", "42o", "32o", "22"
];

export const handRangeType = (range, hand) => {
    if (range === null) {
        return 'none';
    }

    let retval = ""
    if (range.corner) {
        if (isHandInRange(range.corner, hand)) {
            retval += 'corner ';
        }
    }

    if (range.raise) {
        const r = parseRange(range.raise);
        if (isHandInRange(r, hand)) {
            retval += 'raise';
        }
    }

    if (range.call) {
        const r = parseRange(range.call);
        if (isHandInRange(r, hand)) {
            retval += 'call';
        }
    }

    return retval.length > 0 ? retval : 'none';
};

export const isHandInRange = (range, hand) => {
    return range.includes(hand);
};

export function parseRange(rangeStr) {
    const ranges = rangeStr.split(',');
    const hands = ranges.map( range => {
            range = range.replace(/\s+/g, '');
        if (range.includes('-')) {
            return expandDash(range);
        } else if (range.includes('+')) {
            return expandPlus(range);
        } else {
            return [range];
        }
    });

    return hands.flat();
}

export function parseCornerRange(rangeStr) {
    const ranges = rangeStr.split(',');
    const hands = ranges.map( range => {
        return cornerRange(range);
    });

    let unique = new Set(hands.flat());
    unique.forEach(item => {
        if (item.length > 0 && (item.includes('1') || item.includes('X'))) {
          unique.delete(item);
        }
      });

    return Array.from(unique);
}

function expandPlus(rangeStr) {
    const cardRanks = '23456789TJQKA';
    const handType = rangeStr[2];
    const startRank = rangeStr.slice(0, -1); // Remove the '+'

    // Determine the type of hand and generate the expanded range
    let expandedRange = [];
    if (handType === 's' || handType === 'o') {
      const firstCard = startRank[0];
      const secondCard = startRank[1];
      const startIndex = cardRanks.indexOf(secondCard);

      for (let i = startIndex; i < cardRanks.length; i++) {
        expandedRange.push(`${firstCard}${cardRanks[i]}${handType}`);
      }
    } else {
      const secondCard = startRank[1];
      const startIndex = cardRanks.indexOf(secondCard);

      for (let i = startIndex; i < cardRanks.length; i++) {
        expandedRange.push(`${cardRanks[i]}${cardRanks[i]}`);
      }
    }

    return expandedRange;
  }

function expandDash(rangeStr) {
    const cardRanks = 'AKQJT98765432'

    const hands = [];

    const rangeParts = rangeStr.split('-');
    if (rangeParts.length !== 2) {
      return hands;
    }

    const startHand = rangeParts[0];
    const endHand = rangeParts[1];

    const startRank = startHand[1];
    const endRank = endHand[1];

    const suit = startHand.slice(-1);

    const startIndex = cardRanks.indexOf(startRank);
    const endIndex = cardRanks.indexOf(endRank);

    for (let i = startIndex; i <= endIndex; i++) {
        const firstCard = startHand[0] != startHand[1] ? startHand[0] : cardRanks[i];

        const hand = firstCard + cardRanks[i] + ("os".includes(suit) ? suit : '');
        hands.push(hand);
    }

    return hands;
}

function cornerRange(rangeStr) {
    rangeStr = rangeStr.replace(/\s+/g, '');

    const cardRanks = '123456789TJQKAX';
    const hands = [];
    if (rangeStr.includes('+')) {
        let worstHand = rangeStr.replace('+', '');
        hands.push(worstHand);
        // Pocket pairs
        if (worstHand[0] === worstHand[1]) {
            let oneWorse = cardRanks[cardRanks.indexOf(worstHand[1]) - 1];
            hands.push(oneWorse + oneWorse);
        } else {
            let oneWorseThanHigherCard = cardRanks[cardRanks.indexOf(worstHand[0]) - 1];
            let oneWorseThanLowerCard = cardRanks[cardRanks.indexOf(worstHand[1]) - 1];
            // One below
            hands.push(worstHand[0] + oneWorseThanLowerCard + worstHand[2]);
            // One diagonal below
            hands.push(oneWorseThanHigherCard + oneWorseThanLowerCard + worstHand[2]);
        }
    } else if (rangeStr.includes('-')) {
        let rangeParts = rangeStr.split('-');
        let strongestHand = rangeParts[0];
        let worstHand = rangeParts[1];
        let suit = strongestHand[2];

        hands.push(strongestHand);
        hands.push(worstHand);

        // Pocket pairs
        if (strongestHand[0] === strongestHand[1]) {
            let oneBetter = cardRanks[cardRanks.indexOf(strongestHand[0]) + 1];
            hands.push(oneBetter + oneBetter);
            let oneWorse = cardRanks[cardRanks.indexOf(worstHand[0]) - 1];
            hands.push(oneWorse + oneWorse);
        } else {
            let oneBetterThanHigherCard = cardRanks[cardRanks.indexOf(strongestHand[0]) + 1];
            let oneBetterThanLowerCard = cardRanks[cardRanks.indexOf(strongestHand[1]) + 1];
            // One above
            hands.push(strongestHand[0] + oneBetterThanLowerCard + suit);
            // One diagonal above
            hands.push(oneBetterThanHigherCard + oneBetterThanLowerCard + suit);

            let oneWorseThanHigherCard = cardRanks[cardRanks.indexOf(worstHand[0]) - 1];
            let oneWorseThanLowerCard = cardRanks[cardRanks.indexOf(worstHand[1]) - 1];
            // One below
            hands.push(worstHand[0] + oneWorseThanLowerCard + suit);
            // One diagonal below
            hands.push(oneWorseThanHigherCard + oneWorseThanLowerCard + suit);
        }
    } else {
        hands.push(rangeStr);
        let oneWorseThanHigherCard = cardRanks[cardRanks.indexOf(rangeStr[0]) - 1];
        let oneWorseThanLowerCard = cardRanks[cardRanks.indexOf(rangeStr[1]) - 1];

        // One below
        hands.push(rangeStr[0] + oneWorseThanLowerCard + rangeStr[2]);
        // One diagonal below
        hands.push(oneWorseThanHigherCard + oneWorseThanLowerCard + rangeStr[2]);
    }

    return hands;
}