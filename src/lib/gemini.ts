import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
});

export const AIsummarizeCommit = async (diff: string) => {
  const response = await model.generateContent([
    `You are a skilled software engineer who specializes in summarizing git diffs. Your task is to generate concise and informative commit summaries based on the provided git diff. Follow these guidelines:
  
        ### Git Diff Format:
        - Each git diff includes file changes with metadata such as:
          \`\`\`
          diff --git a/lib/index.js b/lib/index.js
          index aadf691..bfef603 100644
          --- a/lib/index.js
          +++ b/lib/index.js
          \`\`\`
        - Lines that start with:
          - \`+\`: Indicate added code.
          - \`-\`: Indicate removed code.
          - Lines with neither symbol represent unchanged context.
        
        ### Task Instructions:
        Summarize the key changes made in the commit by:
        1. Describing the intent or purpose of changes in clear, concise bullet points.
        2. Grouping related changes by file or component, if necessary.
        3. Use brackets to indicate file names and paths (e.g., [lib/index.js]).
        4. Avoid redundancy. Focus on clarity and brevity.
        5. Ensure the summary covers all key changes, but omit unnecessary details.
  
        Example Summary:
        \`\`\`
        * Refactored user authentication logic to separate concerns [src/auth.js]
        * Updated the database schema to include a 'last_logged_in' field [src/db/schema.js]
        * Improved error handling in API responses [src/api/utils.js]
        \`\`\`
        Please summarize the following diff:\n\n${diff}
        `
  ]);

  return response.response.text();
};

export async function summarizeCode(doc: Document) {
  console.log("Preparing to summarize:", doc.metadata.source);

  const codeSnippet = doc.pageContent.slice(0, 1000); // Limit input size

  const response = await model.generateContent([
    `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects. 
     You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
    ---
    ${codeSnippet}
    ---
    Please give a summary no more than 100 words of the code above.`
  ]);
  return response.response.text();
}

export async function AIgenerateEmbeddings(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004"
  });
  const result = await model.embedContent(summary);
  return result.embedding.values;
}

