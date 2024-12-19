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

export async function askIssue(question: string, summary: string) {

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY_ISSUES!);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  try {
    const response = await model.generateContent([
      `You are an intelligent assistant who provides responses strictly based on the provided context. If the question is not related to the summary, respond with "The question is not related to the provided context." Here is the context:
      ---
      ${summary}
      ---
      Answer the following question only if it is related to the context:
      ---
      ${question}`
    ]);

    return response.response.text();
  } catch (error) {
    console.error("Error interacting with Gemini API:", error);
    throw new Error("Failed to get a response from Gemini API");
  }
}

export async function askAutocomplete(input: string) {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY_ISSUES!);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  try {
    const response = await model.generateContent([
      `You are an intelligent assistant that helps users complete their sentences or notes. Your goal is to suggest a natural and relevant continuation of the input text in Markdown format. 

      Your response may include:
      - Formatted text such as **bold**, *italic*, or lists.
      - Code blocks if the input suggests technical content.

      If the input is unclear or cannot be logically continued, respond with "The input is incomplete or cannot be continued based on the provided context."

      The user is writing the following text:
      ---
      ${input}
      ---
      Suggest a continuation for the input text in Markdown format.`
    ]);

    return response.response.text();
  } catch (error) {
    console.error("Error interacting with Gemini API:", error);
    throw new Error("Failed to get a response from Gemini API");
  }
}

export async function analyzeImage(file: File, model: any) {
  try {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1] || '';

          const response = await model.generateContent([
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type || 'application/octet-stream',
              },
            },
            `You are an intelligent senior software engineer with expertise in machine learning, computer vision, and technical documentation. 
                      You have been provided an image file and tasked to analyze its content. The image is expected to contain technical diagrams, charts, architectural designs, code snippets, or any project-related visual information. 
                      ---
                      Please analyze the content of the image and provide the following:
                      1. A summary of the image's purpose and technical content.
                      2. Any technical details or metadata inferred from the image.
                      3. Insights or recommendations relevant to software engineering or project development based on the image.
                      ---
                      Important: If the image content does not align with technical criteria (e.g., personal photos, non-technical artwork, etc.), respond with: "This image does not align with any technical criteria or project-related content." 
                      Limit your response to no more than 150 words, ensuring it is concise, actionable, and relevant to a technical audience.`
          ]);

          resolve(response.response.text || 'No response text available.');
        } else {
          throw new Error('Failed to read file as a string.');
        }
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    throw error;
  }
}



export interface DocSection {
  title: string;
  content: string;
}

const sectionTitles = [
  'Project Overview',
  'Key Features',
  'Technical Architecture',
  'Setup Instructions',
  'Development Guidelines',
  'API Documentation',
  'Security Considerations',
  'Performance Optimization',
  'Maintenance and Support',
];

const parseSections = (analysis: string): DocSection[] => {
  const sections: DocSection[] = [];
  let currentContent = analysis;

  for (const title of sectionTitles) {
    const regex = new RegExp(`${title}:?\\s*([\\s\\S]*?)(?=(?:${sectionTitles.join('|')})|$)`);
    const match = currentContent.match(regex);

    sections.push({
      title,
      content: match && match[1] ? match[1].trim() : 'Information not available in README',
    });
  }

  return sections;
};

export const extractRepoInfo = (url: string) => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const matches = url.match(regex);
  if (!matches) throw new Error('Invalid GitHub URL');
  return { owner: matches[1], repo: matches[2] };
};

export const fetchReadme = async (owner: string, repo: string): Promise<string> => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { Accept: 'application/vnd.github.v3.raw' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch README');
  }

  return response.text();
};

export const analyzeRepository = async (readmeContent: string, repoName: string): Promise<DocSection[]> => {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY_ISSUES!);

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are an expert software architect and technical documentation specialist with deep knowledge of modern software development practices, design patterns, and best practices.

        You are analyzing a GitHub repository and creating comprehensive documentation. You have access to the following information:

        Repository Name: ${repoName}

        README Content:
        ---
        ${readmeContent}
        ---

        Please create an extensive and detailed documentation covering the following sections. For each section, provide in-depth analysis and concrete, actionable information:

        1. Project Overview
        - What problem does this project solve?
        - Who is the target audience?
        - What makes it unique?
        - What is the project's current status and maturity level?

        2. Key Features
        - List and explain all major features
        - Highlight unique selling points
        - Describe the user experience
        - Include potential use cases
        - Suggest possible feature enhancements based on the project's direction

        3. Technical Architecture
        - Detailed breakdown of the technology stack
        - System architecture and design patterns used
        - Data flow and component interaction
        - Infrastructure requirements
        - Security considerations
        - Performance optimization strategies
        - Scalability approach

        4. Setup Instructions
        - Detailed prerequisites
        - Step-by-step installation guide
        - Configuration options
        - Environment setup
        - Deployment guidelines
        - Common troubleshooting steps

        5. Development Guidelines
        - Code organization and structure
        - Coding standards and best practices
        - Testing strategy and requirements
        - CI/CD pipeline recommendations
        - Contributing guidelines
        - Code review process
        - Performance monitoring
        - Error handling practices
        - Documentation standards

        6. API Documentation (if applicable)
        - Authentication methods
        - Available endpoints
        - Request/response formats
        - Rate limiting
        - Error handling
        - Example usage

        7. Security Considerations
        - Authentication and authorization
        - Data protection measures
        - Known security considerations
        - Best practices for secure deployment

        8. Performance Optimization
        - Current performance metrics
        - Optimization techniques
        - Caching strategies
        - Resource management

        9. Maintenance and Support
        - Update procedures
        - Backup strategies
        - Monitoring recommendations
        - Support channels
        - Issue reporting guidelines

        For sections where information is not explicitly available in the README:
        1. Analyze the repository structure, technologies used, and common patterns
        2. Generate realistic and practical content based on industry best practices
        3. Make informed suggestions based on the project's context and technology stack
        4. Clearly mark generated content as "AI-Generated Recommendation" and explain the reasoning

        Provide comprehensive information for each section while maintaining accuracy and practicality. When making assumptions or recommendations, explain the reasoning behind them.`;

  const response = await model.generateContent(prompt);
  const analysis = response.response.text();

  return parseSections(analysis);
};

