export interface Card {
    cardID?: number;
    setID: number;
    front_text?: string;
    back_text?: string;
}
export function makeCard(setID: number, front_text?: string, back_text?: string, cardID?: number): Card {
    return {
        setID,
        cardID,
        front_text,
        back_text
    };
}