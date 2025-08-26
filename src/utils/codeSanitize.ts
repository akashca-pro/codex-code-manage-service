import { Language } from "@/enums/Language.enum";

/**
 * Defines the structure for a category of dangerous code patterns.
 */
interface IPatternCategory {
    name: string;
    description: string;
    patterns: RegExp[];
}

/**
 * Defines the structure for holding all dangerous patterns, categorized by language.
 */
interface ILanguagePatterns {
    common: IPatternCategory[];
    language: {
        [key in Language]?: IPatternCategory[];
    };
}

/**
 * @class CodeSanitizer
 * @description Provides a data-driven static analysis utility to detect potentially
 * malicious or unsafe code patterns in user-submitted code strings.
 */
export class CodeSanitizer {
    private static readonly MAX_CODE_LENGTH = 10000; // 10,000 characters limit

    /**
     * A structured collection of dangerous patterns. Using RegExp objects directly
     */
    private static readonly DANGEROUS_PATTERNS: ILanguagePatterns = {
        common: [
            {
                name: "Infinite Loops & Resource Depletion",
                description: "Code patterns that can lead to resource exhaustion.",
                patterns: [
                    /while\s*\(\s*true\s*\)/i,
                    /for\s*\(\s*;\s*;\s*\)/,
                    /\.repeat\s*\(\s*Infinity\s*\)/i,
                ],
            },
            {
                name: "Fork Bombs",
                description: "Patterns that create an excessive number of processes.",
                patterns: [
                    /while\s*\(\s*true\s*\)\s*\{\s*fork\s*\(\s*\)/i,
                    /os\.fork\(/,
                    /Process\.fork\(/,
                    /cluster\.fork\(/,
                    /multiprocessing\.Process/,
                ],
            },
        ],
        language: {
            [Language.JAVASCRIPT]: [
                {
                    name: "Dangerous Modules",
                    description: "Disallows importing core Node.js modules that can interact with the OS.",
                    patterns: [
                        /require\s*\(\s*['"`]fs['"`]\s*\)/,
                        /require\s*\(\s*['"`]child_process['"`]\s*\)/,
                        /require\s*\(\s*['"`]os['"`]\s*\)/,
                        /require\s*\(\s*['"`]net['"`]\s*\)/,
                        /require\s*\(\s*['"`]http['"`]\s*\)/,
                        /import\s+.*\s+from\s+['"`]fs['"`]/,
                        /import\s+.*\s+from\s+['"`]child_process['"`]/,
                    ],
                },
                {
                    name: "Dangerous Globals & Operations",
                    description: "Disallows access to global objects and functions that can be abused.",
                    patterns: [
                        /\bprocess\b/,
                        /\bglobal\b/,
                        /\bFunction\s*\(/,
                        /\beval\s*\(/,
                        /\bwindow\b/,
                        /\bdocument\b/,
                        /\blocalStorage\b/,
                        /\bWebSocket\b/,
                    ],
                },
            ],
            [Language.PYTHON]: [
                {
                    name: "Dangerous Modules",
                    description: "Disallows importing Python modules that can interact with the OS.",
                    patterns: [
                        /import\s+os/,
                        /import\s+subprocess/,
                        /import\s+sys/,
                        /import\s+shutil/,
                        /from\s+os\s+import/,
                    ],
                },
                {
                    name: "Dangerous Built-ins & Operations",
                    description: "Disallows dangerous built-in functions and system calls.",
                    patterns: [
                        /__import__\s*\(/,
                        /open\s*\(/,
                        /eval\s*\(/,
                        /exec\s*\(/,
                        /os\.system/,
                        /subprocess\.run/,
                        /subprocess\.Popen/,
                    ],
                },
            ],
            [Language.GO]: [
                {
                    name: "Dangerous Packages",
                    description: "Disallows importing Go packages that can interact with the OS.",
                    patterns: [
                        /"os"/,
                        /"os\/exec"/,
                        /"syscall"/,
                        /"net"/,
                    ],
                },
                {
                    name: "Dangerous OS Functions",
                    description: "Disallows specific dangerous functions.",
                    patterns: [
                        /os\.Remove/,
                        /os\.RemoveAll/,
                        /os\.Exit/,
                        /exec\.Command/,
                        /syscall\.Exec/,
                    ],
                },
            ],
        },
    };

    /**
     * The main public method to sanitize code.
     *
     * @param {string} userCode The code submitted by the user.
     * @param {Language} language The programming language of the code.
     * @returns {{isValid: boolean, error?: string}} An object indicating if the code is valid and an error message if it's not.
     */
    public sanitize(userCode: string, language: Language): { isValid: boolean; error?: string } {
        if (userCode.length > CodeSanitizer.MAX_CODE_LENGTH) {
            return {
                isValid: false,
                error: `Syntax Error: Code length exceeds maximum limit of ${CodeSanitizer.MAX_CODE_LENGTH} characters.`,
            };
        }

        // 1. Check common patterns first
        for (const category of CodeSanitizer.DANGEROUS_PATTERNS.common) {
            const violation = this.#_findViolatingPattern(userCode, category.patterns);
            if (violation) {
                return {
                    isValid: false,
                    error: `Syntax Error: Prohibited operation detected: ${category.description} (pattern: ${violation.source})`,
                };
            }
        }

        // 2. Check language-specific patterns
        const langPatterns = CodeSanitizer.DANGEROUS_PATTERNS.language[language];
        if (!langPatterns) {
            return {
                isValid: false,
                error: `Syntax Error: Unsupported language for sanitization: ${language}`,
            };
        }

        for (const category of langPatterns) {
            const violation = this.#_findViolatingPattern(userCode, category.patterns);
            if (violation) {
                return {
                    isValid: false,
                    error: `Syntax Error: Prohibited ${language} operation detected: ${category.description} (pattern: ${violation.source})`,
                };
            }
        }

        return { isValid: true };
    }

    /**
     * Checks if the given code matches any of the provided regex patterns.
     * @private
     * @param {string} code The code to check.
     * @param {RegExp[]} patterns An array of regular expressions to test against.
     * @returns {RegExp | null} The first pattern that matched, or null if no match was found.
     */
    #_findViolatingPattern(code: string, patterns: RegExp[]): RegExp | null {
        for (const pattern of patterns) {
            // We reset lastIndex for global regexes to ensure they work correctly on subsequent calls.
            pattern.lastIndex = 0;
            if (pattern.test(code)) {
                return pattern;
            }
        }
        return null;
    }
}
