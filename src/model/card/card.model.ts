export interface Card {
    setID: number;
    front_text?: string;
    back_text?: string;
}
export function makeCard(setID: number, front_text?: string, back_text?: string): Card {
    return {
        setID,
        front_text: front_text || "",
        back_text: back_text || ""
    };
}