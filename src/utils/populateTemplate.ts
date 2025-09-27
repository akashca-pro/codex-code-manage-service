type TestCase = { Id: string; input: string; output: string };

/**
 * Replace placeholders in code templates for JS, Python, and Go
 */
export function populateTemplate(
  language: "javascript" | "python" | "go",
  template: string,
  userCode: string,
  testCases: TestCase[]
): string {
  let testCasesReplacement = "";

  if (language === "javascript" || language === "python") {
    // For JS/Python, keep raw JSON array string
    testCasesReplacement = JSON.stringify(
      testCases.map(tc => ({
        input: JSON.parse(tc.input),
        output: JSON.parse(tc.output),
      }))
    );
  }

  if (language === "go") {
    // Convert test cases to Go struct literals
    testCasesReplacement = testCases
      .map(tc => {
        const inputArray = JSON.parse(tc.input) as number[];
        const outputArray = JSON.parse(tc.output) as number[];
        return `{
            Input: []int{${inputArray.join(", ")}},
            Output: []int{${outputArray.join(", ")}},
        },`;
      })
      .join("\n");
  }

  // Replace placeholders
  return template
    .replace("{{__USER_CODE__}}", userCode)
    .replace("{{__TESTCASES_JSON__}}", testCasesReplacement);
}
