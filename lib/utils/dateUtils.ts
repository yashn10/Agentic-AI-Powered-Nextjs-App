// lib/utils/dateUtils.ts

export function parseUserDate(userInput: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If already YYYY-MM-DD, check if past
    if (/^\d{4}-\d{2}-\d{2}$/.test(userInput)) {
        const dateObj = new Date(userInput + "T00:00:00");

        if (dateObj < today) {
            // Past date, add 1 year
            const [year, month, day] = userInput.split("-");
            const nextYear = (parseInt(year) + 1).toString();
            const result = `${nextYear}-${month}-${day}`;
            console.log(`[parseUserDate] Past date: "${userInput}" → "${result}"`);
            return result;
        }

        console.log(`[parseUserDate] Valid future date: "${userInput}"`);
        return userInput;
    }

    // Parse month names: "10 december", "december 10", "december 10 2025", etc.
    const monthNames: { [key: string]: string } = {
        january: "01", february: "02", march: "03", april: "04",
        may: "05", june: "06", july: "07", august: "08",
        september: "09", october: "10", november: "11", december: "12",
    };

    // Try: "10 december" or "december 10" (with optional year)
    for (const [monthName, monthNum] of Object.entries(monthNames)) {
        const regex = new RegExp(`(\\d{1,2})\\s+${monthName}(?:\\s+(\\d{4}))?|${monthName}\\s+(\\d{1,2})(?:\\s+(\\d{4}))?`, "i");
        const match = userInput.match(regex);

        if (match) {
            let day: string;
            let year: string;

            if (match[1]) {
                // Format: "10 december" or "10 december 2025"
                day = String(parseInt(match[1])).padStart(2, "0");
                year = match[2] || String(today.getFullYear());
            } else {
                // Format: "december 10" or "december 10 2025"
                day = String(parseInt(match[3])).padStart(2, "0");
                year = match[4] || String(today.getFullYear());
            }

            const result = `${year}-${monthNum}-${day}`;
            const dateObj = new Date(result + "T00:00:00");

            // If past, use next year
            if (dateObj < today) {
                const nextYear = (parseInt(year) + 1).toString();
                const nextResult = `${nextYear}-${monthNum}-${day}`;
                console.log(`[parseUserDate] Past date: "${userInput}" → "${nextResult}"`);
                return nextResult;
            }

            console.log(`[parseUserDate] "${userInput}" → "${result}"`);
            return result;
        }
    }

    // Fallback: return as-is
    console.warn(`[parseUserDate] Could not parse: "${userInput}", returning as-is`);
    return userInput;
}