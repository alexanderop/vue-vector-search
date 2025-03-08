/**
 * Calculates the cosine similarity between two vectors.
 * 
 * Cosine similarity measures the cosine of the angle between two vectors,
 * providing a value between -1 (completely opposite) and 1 (exactly the same).
 * 
 * @param vecA - First vector as an array of numbers
 * @param vecB - Second vector as an array of numbers
 * @returns Cosine similarity value between -1 and 1
 * @throws Error if vectors have different lengths or are empty
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  // Check if vectors are valid
  if (vecA.length === 0 || vecB.length === 0) {
    throw new Error("Vectors cannot be empty");
  }

  if (vecA.length !== vecB.length) {
    throw new Error(`Vector dimensions don't match: ${vecA.length} vs ${vecB.length}`);
  }

  // Calculate dot product: A·B = Σ(A[i] * B[i])
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  
  // Calculate magnitude of vector A: |A| = √(Σ(A[i]²))
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  
  // Calculate magnitude of vector B: |B| = √(Σ(B[i]²))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  // Check for zero magnitude (to avoid division by zero)
  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Cannot calculate similarity for zero-length vector");
  }

  // Calculate cosine similarity: cos(θ) = (A·B) / (|A|*|B|)
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Normalize a vector to unit length
 * 
 * @param vector - Vector to normalize
 * @returns Normalized vector with unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / norm);
}

/**
 * A class that provides vector operations and similarity calculations
 */
export class VectorSimilarity {
  /**
   * Calculates cosine similarity between two vectors
   */
  static cosine(vecA: number[], vecB: number[]): number {
    return cosineSimilarity(vecA, vecB);
  }
  
  /**
   * Calculates the Euclidean distance between two vectors
   */
  static euclideanDistance(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error(`Vector dimensions don't match: ${vecA.length} vs ${vecB.length}`);
    }
    
    return Math.sqrt(
      vecA.reduce((sum, a, i) => sum + Math.pow(a - vecB[i], 2), 0)
    );
  }
  
  /**
   * Converts cosine similarity to cosine distance
   */
  static cosineDistance(vecA: number[], vecB: number[]): number {
    return 1 - this.cosine(vecA, vecB);
  }
} 