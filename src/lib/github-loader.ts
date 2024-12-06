import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { AIgenerateEmbeddings, summarizeCode } from './gemini'
import { db } from '@/server/db'
import { Octokit } from 'octokit'

const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) => {
    const { data } = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path
    })
    if (!Array.isArray(data) && data.type == 'file') {
        return acc + 1
    }
    if (Array.isArray(data)) {
        let filecount = 0
        const directories: string[] = []

        for (const item of data) {
            if (item.type == 'dir') {
                directories.push(item.path)
            } else {
                filecount++
            }
        }
        if (directories.length > 0) {
            const directoryCounts = await Promise.all(directories.map(dirPath => getFileCount(
                dirPath,
                octokit,
                githubOwner,
                githubRepo,
                0
            )))
            filecount += directoryCounts.reduce((acc, count) => acc + count, 0)
        }
        return acc + filecount
    }
    return acc
}


export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    const octokit = new Octokit({ auth: githubToken })
    const githubOwner = githubUrl.split('/')[3]
    const githubRepo = githubUrl.split('/')[4]
    if (!githubOwner || !githubRepo) {
        return 0
    }
    const filecount = await getFileCount('', octokit, githubOwner, githubRepo, 0)
    return filecount
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {

    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken,
        branch: 'main',
        ignoreFiles: [
            // Git and Version Control
            '.git',               // Git repository data
            '.gitignore',         // Git ignore file
            '.gitattributes',     // Git attributes file
            '.gitmodules',        // Git submodules file

            // Environment and Configuration Files
            '.env',               // Environment variable configuration files
            '.env.local',         // Local environment settings
            '.env.*',             // All other .env files
            '.npmrc',             // npm configuration
            '.yarnrc',            // Yarn configuration
            '.editorconfig',      // Editor configuration
            'docker-compose.yml', // Docker Compose configuration
            'Dockerfile',         // Docker build file
            'Vagrantfile',        // Vagrant configuration

            // Node.js and Dependency Management
            'node_modules',       // Node.js dependencies
            'yarn.lock',          // Yarn lockfile
            'package-lock.json',  // npm lockfile
            'pnpm-lock.yaml',     // pnpm lockfile

            // Build and Output Directories
            'dist',               // Build output directory
            'build',              // Another build output directory
            'tmp',                // Temporary files
            'out',                // Output directory (used by some frameworks)
            '.parcel-cache',      // Parcel build cache
            '.next',              // Next.js build output
            '.nuxt',              // Nuxt.js build output
            'target',             // Maven/Gradle build output

            // IDE and Editor Configurations
            '.vscode',            // Visual Studio Code settings
            '.idea',              // JetBrains IDE settings
            '*.iml',              // IntelliJ IDEA module files
            '.classpath',         // Eclipse project settings
            '.project',           // Eclipse project settings
            '.settings',          // Eclipse workspace settings

            // Logs and Debugging Files
            '*.log',              // Log files
            'npm-debug.log',      // Debug log file for npm
            'yarn-debug.log',     // Debug log file for Yarn
            '*.gz',               // Compressed log files
            '*.log.*',            // Versioned log files (e.g., `app.log.1`)

            // System and Metadata Files
            '.DS_Store',          // macOS file system metadata
            'Thumbs.db',          // Windows thumbnail cache
            'desktop.ini',        // Windows folder configuration
            'Icon\r',             // macOS custom folder icons
            'ehthumbs.db',        // Windows image cache

            // Temporary and Backup Files
            '*.bak',              // Backup files
            '*.swp',              // Swap files (e.g., from editors like Vim)
            '*.tmp',              // Temporary files
            '*~',                 // Backup files from some editors
            '*.orig',             // Merge conflict backup files
            '*.rej',              // Patch conflict files

            // Other Ignorable Files
            'coverage',           // Code coverage reports
            '.nyc_output',        // NYC code coverage output
            '.coverage.*',        // Coverage artifacts
            'reports',            // Test or build reports
            'jspm_packages',      // JSPM package directory
            'bower_components',   // Bower dependencies
            '.sass-cache',        // Sass cache directory
            '.eslintcache',       // ESLint cache file
            'cypress/videos',     // Cypress test videos
            'cypress/screenshots', // Cypress test screenshots

            // Directories containing image files (common image extensions)
            'assets/images',      // Common image directory
            'images',             // Generic 'images' folder
            'static/images',      // Static folder for images
            'public/images',      // Public folder for images
            'img',                // img folder for images
            'media',              // Media directory
            'photo',              // Photo directory
            'pics',               // Pictures directory
            '*.jpg',              // JPEG image files
            '*.jpeg',             // JPEG image files
            '*.png',              // PNG image files
            '*.gif',              // GIF image files
            '*.bmp',              // BMP image files
            '*.svg',              // SVG image files
            '*.webp',             // WebP image files
            '*.tiff',             // TIFF image files
            '*.ico'               // ICO image files
        ],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs

}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`processing ${index} of ${allEmbeddings.length}`)
        if (!embedding) return

        const sourceCodeEmbeddings = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                projectId,
                fileName: embedding.fileName,
            }
        })
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbeddings.id}
      `;
    }))
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summarizeCode(doc)
        const embedding = await AIgenerateEmbeddings(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source
        }
    }))
}