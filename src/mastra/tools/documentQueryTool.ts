import { createTool } from '@mastra/core'
import z from 'zod'
import { embed } from 'ai';
import { ollama } from '../../ollama.js';
import { withConnection, query } from '../../duckdb.js';
import { Env } from '../../env.js';

export const documentQueryTool = createTool({
  id: 'DocumentQueryTool',
  inputSchema: z.object({
    query: z.string()
  }),
  description: 'Searches the document knowledge base using semantic similarity to find relevant documents that match the given query. Returns documents with the highest similarity scores to help answer user questions.',
  execute: async ({ context }) => {
    const { embedding } = await embed({
      model: ollama.embedding(Env.ollamaEmbeddingModel),
      value: context.query,
    })
    const pwd = process.cwd();
    
    const results = await withConnection(async (conn) => {
      return await query(conn, {
        indexName: pwd,
        queryVector: embedding,
      })
    })
    
    return {
      contents: results ? results : 'No faq found.'
    }
  }
})
