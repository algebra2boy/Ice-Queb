// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
    // Create a copy of the original array
    let arrayCopy = [...array];
    // Shuffle the copy
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    // Return the shuffled copy
    return arrayCopy;
}
