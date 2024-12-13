import { db } from '@/server/db';
import { Octokit } from 'octokit';
import axios from 'axios';
import { AIsummarizeCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

interface Commit {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}

// Fetch commit hashes from the GitHub repository
export const getCommitHashes = async (githubUrl: string): Promise<Commit[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    try {
        const { data } = await octokit.rest.repos.listCommits({ owner, repo });

        // Sort commits by date (newest first) and limit to the latest 15
        return data
            .sort((a: any, b: any) =>
                new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
            )
            .slice(0, 15)
            .map((commit: any) => ({
                commitHash: commit.sha,
                commitMessage: commit.commit.message || ' ',
                commitAuthorName: commit.commit?.author?.name || '',
                commitAuthorAvatar: commit?.author?.avatar_url || '',
                commitDate: commit.commit?.author?.date || '',
            }));
    } catch (error) {
        console.error('Error fetching commits:', error);
        throw new Error('Failed to fetch commits from GitHub');
    }
};

// Fetch GitHub URL for the project
async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { githubUrl: true },
    });

    if (!project?.githubUrl) {
        throw new Error('Project does not have a GitHub URL');
    }

    return project.githubUrl;
}

// Pull and process commits
export const pullCommits = async (projectId: string) => {
    const githubUrl = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);

    // Filter out already processed commits
    const unprocessedCommits = await filterUnprocessedCommits(commitHashes, projectId);

    // Summarize commits using AI
    const summaries = await Promise.allSettled(
        unprocessedCommits.map(async (commit) => {
            try {
                return await summarizeCommit(githubUrl, commit.commitHash);
            } catch (error) {
                console.error(`Error summarizing commit ${commit.commitHash}:`, error);
                return 'Error generating summary';
            }
        })
    );

    // Map summaries to commits
    const commitsToCreate = unprocessedCommits.map((commit, index) => ({
        commitHash: commit.commitHash,
        projectId,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
        summary: summaries[index]?.status === 'fulfilled' ? summaries[index].value : ' ',
    }));

    // Save new commits to the database
    const createdCommits = await db.commit.createMany({
        data: commitsToCreate,
    });

    return createdCommits;
};

// Filter commits that are not already in the database
async function filterUnprocessedCommits(commitHashes: Commit[], projectId: string): Promise<Commit[]> {
    const processedCommits = await db.commit.findMany({
        where: { projectId },
        select: { commitHash: true },
    });

    const processedHashes = new Set(processedCommits.map((commit) => commit.commitHash));
    return commitHashes.filter((commit) => !processedHashes.has(commit.commitHash));
}

// Summarize a commit using AI
async function summarizeCommit(githubUrl: string, commitHash: string): Promise<string> {
    try {
        const { data: diff } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers: { Accept: 'application/vnd.github.v3.diff' },
        });

        return (await AIsummarizeCommit(diff)) || ' ';
    } catch (error) {
        console.error(`Error fetching commit diff for ${commitHash}:`, error);
        return 'Error generating summary';
    }
}
