const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const cohortChatgptIndex = pc.index('gpt-clone');

async function createMemory({ messageId, vectors, metadata }) {
  // ✅ Safety check: skip all-zero vectors
  if (!vectors || vectors.every(v => v === 0)) {
    console.warn("Skipping upsert: embedding vector is all zeros");
    return;
  }

  await cohortChatgptIndex.upsert([
    {
      id: messageId,
      values: vectors,
      metadata,
    },
  ]);
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
  const data = await cohortChatgptIndex.query({
    vector: queryVector,
    topK: limit,
    includeMetadata: true,
    filter: metadata || undefined,
  });
  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory,
};
