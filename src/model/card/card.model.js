"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCard = makeCard;
function makeCard(setID, front_text, back_text) {
    return {
        setID,
        front_text: front_text || "",
        back_text: back_text || ""
    };
}
