import fs from "fs/promises";

// Discord has a 2000 character limit per message, but we'll use a slightly lower value
// to account for formatting and to provide some safety margin
const MAX_MESSAGE_LENGTH = 1800;

interface MessageChunk {
    content: string;
    number: number;
}

/**
 * Determines if a line is a Markdown header
 */
function isHeader(line: string): boolean {
    return /^#{1,6}\s+/.test(line);
}

/**
 * Determines if a line is a list item (numbered or bullet)
 */
function isListItem(line: string): boolean {
    return /^(\d+\.|\*|-)\s+/.test(line);
}

/**
 * Counts the header level (number of # characters)
 */
function getHeaderLevel(line: string): number {
    const match = line.match(/^(#{1,6})\s+/);
    return match ? match[1].length : 0;
}

/**
 * Intelligently splits a Markdown document into chunks for Discord
 */
async function splitMarkdownForDiscord(
    content: string
): Promise<MessageChunk[]> {
    // Split the content into lines
    const lines = content.split("\n");

    // Initialize chunks array
    const chunks: MessageChunk[] = [];
    let currentChunk: string[] = [];
    let messageNumber = 1;
    let currentChunkLength = 0;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.length + 1; // +1 for the newline

        // Start a new chunk for major headers if the current chunk isn't empty
        if (
            isHeader(line) &&
            getHeaderLevel(line) <= 2 &&
            currentChunkLength > 0
        ) {
            chunks.push({
                content: currentChunk.join("\n"),
                number: messageNumber++,
            });
            currentChunk = [line];
            currentChunkLength = lineLength;
            continue;
        }

        // If adding this line would exceed the limit
        if (
            currentChunkLength + lineLength > MAX_MESSAGE_LENGTH &&
            currentChunkLength > 0
        ) {
            // Special case: always break at headers regardless of level
            if (isHeader(line)) {
                chunks.push({
                    content: currentChunk.join("\n"),
                    number: messageNumber++,
                });
                currentChunk = [line];
                currentChunkLength = lineLength;
                continue;
            }

            // Special case: try to keep list items together when possible
            if (isListItem(line)) {
                let listEndIndex = i;
                // Look ahead to find where this list section ends
                while (
                    listEndIndex < lines.length &&
                    (isListItem(lines[listEndIndex]) ||
                        lines[listEndIndex].trim() === "")
                ) {
                    listEndIndex++;
                }

                // If the whole list section can fit in the next chunk, start a new chunk
                const listText = lines.slice(i, listEndIndex).join("\n");
                if (listText.length < MAX_MESSAGE_LENGTH / 2) {
                    // Using half to be conservative
                    chunks.push({
                        content: currentChunk.join("\n"),
                        number: messageNumber++,
                    });
                    currentChunk = [];
                    currentChunkLength = 0;
                    continue; // Don't increment i, we'll process this line again
                }
            }

            // Default: start a new chunk
            chunks.push({
                content: currentChunk.join("\n"),
                number: messageNumber++,
            });
            currentChunk = [line];
            currentChunkLength = lineLength;
        } else {
            // Add line to current chunk
            currentChunk.push(line);
            currentChunkLength += lineLength;
        }
    }

    // Add the final chunk if there's content left
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join("\n"),
            number: messageNumber,
        });
    }

    return chunks;
}

/**
 * Format message chunks for Discord output
 */
function formatForDiscord(chunks: MessageChunk[]): string[] {
    return chunks.map(
        (chunk) => `<message num=${chunk.number}>\n${chunk.content}\n</message>`
    );
}

/**
 * Main function to process a markdown file
 */
async function processMarkdownFile(
    filePath: string,
    outputFilePath?: string
): Promise<void> {
    try {
        const chunks = await splitMarkdownForDiscord(filePath);
        const formattedChunks = formatForDiscord(chunks);

        // Log to console
        formattedChunks.forEach((chunk) => console.log(chunk + "\n"));

        // Write to output file if specified
        if (outputFilePath) {
            await fs.writeFile(
                outputFilePath,
                formattedChunks.join("\n\n"),
                "utf8"
            );
            console.log(`Output written to ${outputFilePath}`);
        }
    } catch (error) {
        console.error("Error processing markdown file:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
    }
}

// Export for use as a module
export { processMarkdownFile, splitMarkdownForDiscord };
