#!/usr/bin/env node
// Parses the 1326-element flat array format from src/ex into shorthanded.json

const fs = require('fs');
const path = require('path');

// ── Deck ordering ──────────────────────────────────────────────────────────
// 52-card deck: rank 2=0 .. A=12, suit c=0,d=1,h=2,s=3
// cardIndex = rank * 4 + suit   →  2c=0, 2d=1, ..., As=51
// 1326 unique pairs (i<j): pairIndex(i,j) = floor(i*(103-i)/2) + (j-i-1)

function pairIndex(i, j) {
    if (i > j) { const t = i; i = j; j = t; }
    return Math.floor(i * (103 - i) / 2) + (j - i - 1);
}

// ── Hand → combo indices ───────────────────────────────────────────────────
// For each of the 169 canonical hands, collect the matching pair indices.

function rankIndex(ch) {
    return '23456789TJQKA'.indexOf(ch);
}

function getComboIndices(hand) {
    const indices = [];
    if (hand.length === 2) {
        // Pocket pair: same rank, different suits → 6 combos
        const r = rankIndex(hand[0]);
        for (let s1 = 0; s1 < 4; s1++) {
            for (let s2 = s1 + 1; s2 < 4; s2++) {
                indices.push(pairIndex(r * 4 + s1, r * 4 + s2));
            }
        }
    } else if (hand[2] === 's') {
        // Suited: same suit, different ranks → 4 combos
        const r1 = rankIndex(hand[0]);
        const r2 = rankIndex(hand[1]);
        for (let s = 0; s < 4; s++) {
            indices.push(pairIndex(r1 * 4 + s, r2 * 4 + s));
        }
    } else {
        // Offsuit: different suits → 12 combos
        const r1 = rankIndex(hand[0]);
        const r2 = rankIndex(hand[1]);
        for (let s1 = 0; s1 < 4; s1++) {
            for (let s2 = 0; s2 < 4; s2++) {
                if (s1 !== s2) {
                    indices.push(pairIndex(r1 * 4 + s1, r2 * 4 + s2));
                }
            }
        }
    }
    return indices;
}

// ── Convert 1326-array action list to per-hand frequencies ─────────────────
// actions: [{action: "Raise X bb", range: [...]}, {action: "Call", range: [...]}, {action: "Fold", range: [...]}]
// Returns: { raise: string, call: string, mixed: {hand: [r,c,f]} }

const cards169 = [
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

// Pre-compute combo indices for all 169 hands
const comboIndicesMap = {};
for (const hand of cards169) {
    comboIndicesMap[hand] = getComboIndices(hand);
}

const EPSILON = 0.01; // Threshold for considering a freq as 0 or 1

function decodeActionArrays(actions) {
    // Find raise, call, fold arrays (fold may be implicit)
    let raiseArr = null, callArr = null, foldArr = null;
    let raiseName = null, callName = null;

    for (const a of actions) {
        const n = a.action.toLowerCase();
        if (n.includes('fold')) {
            foldArr = a.range;
        } else if (n.includes('call')) {
            callArr = a.range;
            callName = a.action;
        } else {
            // Raise / all-in / any bet action
            raiseArr = a.range;
            raiseName = a.action;
        }
    }

    // If no fold array, derive it from 1 - raise - call
    if (!foldArr) {
        foldArr = new Array(1326).fill(0).map((_, i) => {
            const r = raiseArr ? raiseArr[i] : 0;
            const c = callArr ? callArr[i] : 0;
            return Math.max(0, 1 - r - c);
        });
    }
    if (!raiseArr) raiseArr = new Array(1326).fill(0);
    if (!callArr) callArr = new Array(1326).fill(0);

    const raiseHands = [];
    const callHands = [];
    const mixedHands = {};

    for (const hand of cards169) {
        const indices = comboIndicesMap[hand];
        // Average the frequencies across all combos of this hand
        let rSum = 0, cSum = 0, fSum = 0;
        for (const idx of indices) {
            rSum += raiseArr[idx] || 0;
            cSum += callArr[idx] || 0;
            fSum += foldArr[idx] || 0;
        }
        const n = indices.length;
        const r = rSum / n;
        const c = cSum / n;
        const f = fSum / n;

        const isPureRaise = r > 1 - EPSILON && c < EPSILON;
        const isPureCall = c > 1 - EPSILON && r < EPSILON;
        const isPureFold = f > 1 - EPSILON;
        const isMixed = !isPureRaise && !isPureCall && !isPureFold && (r + c + f > EPSILON);

        if (isPureRaise) {
            raiseHands.push(hand);
        } else if (isPureCall) {
            callHands.push(hand);
        } else if (isMixed) {
            // Store raw frequencies (App.js already applies roundMixedFreqs)
            const total = r + c + f;
            mixedHands[hand] = [
                parseFloat((r / total).toFixed(6)),
                parseFloat((c / total).toFixed(6)),
                parseFloat((f / total).toFixed(6))
            ];
        }
        // pure fold: not included in any list
    }

    return {
        raise: raiseHands.join(', '),
        call: callHands.join(', '),
        mixed: mixedHands,
        raiseName,
        callName
    };
}

// ── Parse a scenario line ──────────────────────────────────────────────────
// Format: "Scenario Name[{...json...}]"

function parseScenarioLine(line) {
    const bracketPos = line.indexOf('[{');
    if (bracketPos === -1) return null;
    const name = line.slice(0, bracketPos).trim();
    const json = line.slice(bracketPos);
    const actions = JSON.parse(json);
    return { name, actions };
}

// ── Main ───────────────────────────────────────────────────────────────────

const exContent = fs.readFileSync(path.join(__dirname, 'src/ex'), 'utf8');
const lines = exContent.split('\n');

// Lines 7-12 (0-indexed 6-11): HU scenarios
// Lines 15-29 (0-indexed 14-28): 3max scenarios

const huScenarios = [];
const threeMaxScenarios = [];

let section = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'HU') { section = 'HU'; continue; }
    if (line === '3max') { section = '3max'; continue; }
    if (!section) continue;
    if (!line || !line.includes('[{')) continue;

    const parsed = parseScenarioLine(lines[i]);
    if (!parsed) continue;

    const decoded = decodeActionArrays(parsed.actions);

    // Determine hero position from scenario name
    let hero = {};
    let villains = [{}];
    let playerCount = (section === 'HU') ? 2 : 3;

    const nameLower = parsed.name.toLowerCase();
    if (nameLower.includes('btn')) {
        hero = { BTN: 0 };
        if (playerCount === 3) {
            if (nameLower.includes('vs. sb') || nameLower.includes('vs sb')) {
                villains = [{ SB: 1 }];
            } else if (nameLower.includes('vs. bb') || nameLower.includes('vs bb')) {
                villains = [{ BB: 2 }];
            } else {
                villains = [{}];
            }
        }
    } else if (nameLower.includes('sb')) {
        hero = { SB: 1 };
        if (playerCount === 3) {
            if (nameLower.includes('vs. btn') || nameLower.includes('vs btn')) {
                villains = [{ BTN: 0 }];
            } else if (nameLower.includes('vs. bb') || nameLower.includes('vs bb')) {
                villains = [{ BB: 2 }];
            } else {
                villains = [{}];
            }
        }
    } else if (nameLower.includes('bb')) {
        hero = { BB: 2 };
        if (playerCount === 3) {
            if (nameLower.includes('vs. btn') || nameLower.includes('vs btn')) {
                villains = [{ BTN: 0 }];
            } else {
                villains = [{}];
            }
        }
    }

    const scenario = {
        name: parsed.name,
        group: section === 'HU' ? 'HU (short-stack)' : '3max',
        raise: decoded.raise,
        call: decoded.call,
        mixed: decoded.mixed,
        hero,
        villains,
        playerCount
    };

    if (section === 'HU') {
        huScenarios.push(scenario);
    } else {
        threeMaxScenarios.push(scenario);
    }
}

// Build grouped structure matching the format of ranges.json / hu200bb.json / 3handed.json
// Strip the 'group' field from each scenario object before writing
const stripGroup = (s) => {
    const { group, ...rest } = s;
    return rest;
};

const grouped = [
    { 'HU (short-stack)': huScenarios.map(stripGroup) },
    { '3max': threeMaxScenarios.map(stripGroup) }
];

const outputPath = path.join(__dirname, 'src/shorthanded.json');
fs.writeFileSync(outputPath, JSON.stringify(grouped, null, 2));
console.log(`Written ${huScenarios.length + threeMaxScenarios.length} scenarios (${huScenarios.length} HU, ${threeMaxScenarios.length} 3max) to src/shorthanded.json`);

// Verify by spot-checking
const btnRFI = huScenarios.find(s => s.name === 'BTN RFI');
if (btnRFI) {
    const totalRaiseHands = btnRFI.raise.split(', ').length;
    console.log(`BTN RFI: ${totalRaiseHands} raise hands, ${Object.keys(btnRFI.mixed).length} mixed, call: "${btnRFI.call.slice(0, 50)}"`);
}
