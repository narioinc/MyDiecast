import { open } from '@op-engineering/op-sqlite';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import RNFS from 'react-native-fs';
import decodeJpeg from 'jpeg-js';
import { Buffer } from 'buffer';

const DB_NAME = 'mydiecast_vectors.db';
const MODEL_SIZE = 224;

export interface VectorMatch {
    carId: string;
    similarity: number;
}

class VectorSearchService {
    private db: any = null;
    private model: any = null;

    async init() {
        if (!this.db) {
            try {
                this.db = open({ name: DB_NAME });
                this.db.execute(`
                    CREATE TABLE IF NOT EXISTS embeddings (
                        carId TEXT PRIMARY KEY,
                        vector BLOB NOT NULL
                    )
                `);
            } catch (e) {
                console.error('DB Init failed:', e);
            }
        }

        if (!this.model) {
            try {
                // In production, you'd want to handle the asset path correctly for each platform
                // require() works with metro, but TFLite loader needs the actual path or the required number
                this.model = await loadTensorflowModel(require('../../assets/mobilenet_v2.tflite'));
                console.log('TFLite Model loaded successfully');
            } catch (error) {
                console.error('Failed to load TFLite model', error);
            }
        }
    }

    async generateEmbedding(imageUri: string): Promise<Float32Array | null> {
        if (!this.model) await this.init();
        if (!this.model) return null;

        try {
            // 1. Read image as base64 and convert to Buffer
            // Note: imageUri might have 'file://' prefix which RNFS handles
            const cleanUri = imageUri.replace('file://', '');
            const base64 = await RNFS.readFile(cleanUri, 'base64');
            const jpegBuffer = Buffer.from(base64, 'base64');

            // 2. Decode JPEG
            const { width, height, data } = decodeJpeg.decode(jpegBuffer, { useTArray: true });

            // 3. Prepare tensor (RGB normalized to [-1, 1])
            // MobileNetV2 usually expects 224x224x3
            // decodeJpeg returns RGBA (4 channels)
            const inputTensor = new Float32Array(MODEL_SIZE * MODEL_SIZE * 3);

            // Simple sampling/resize if dimensions don't match (highly recommended to use 224x224 input)
            for (let y = 0; y < MODEL_SIZE; y++) {
                for (let x = 0; x < MODEL_SIZE; x++) {
                    const srcX = Math.floor((x / MODEL_SIZE) * width);
                    const srcY = Math.floor((y / MODEL_SIZE) * height);
                    const srcOffset = (srcY * width + srcX) * 4;
                    const destOffset = (y * MODEL_SIZE + x) * 3;

                    // Normalize pixels: (val / 127.5) - 1 -> [-1, 1]
                    inputTensor[destOffset] = (data[srcOffset] / 127.5) - 1.0;     // R
                    inputTensor[destOffset + 1] = (data[srcOffset + 1] / 127.5) - 1.0; // G
                    inputTensor[destOffset + 2] = (data[srcOffset + 2] / 127.5) - 1.0; // B
                }
            }

            // 4. Run Inference
            const output = await this.model.run([inputTensor]);

            // output is an array of Tensors. The feature vector is usually the first element.
            // MobileNetV2 feature vector is typically 1280 floats.
            if (output && output.length > 0) {
                return output[0] as Float32Array;
            }
            return null;
        } catch (error) {
            console.error('Embedding generation failed', error);
            return null;
        }
    }

    async storeEmbedding(carId: string, vector: Float32Array) {
        if (!this.db) await this.init();
        if (!this.db) return;

        try {
            const dataToStore = new Uint8Array(vector.buffer);
            this.db.execute(
                'INSERT OR REPLACE INTO embeddings (carId, vector) VALUES (?, ?)',
                [carId, dataToStore]
            );
        } catch (e) {
            console.error('Failed to store embedding:', e);
        }
    }

    async findSimilar(queryVector: Float32Array, limit: number = 5): Promise<VectorMatch[]> {
        if (!this.db) await this.init();
        if (!this.db || !queryVector) return [];

        try {
            const results = this.db.execute('SELECT carId, vector FROM embeddings');

            if (!results || !results.rows) {
                console.warn('VectorSearchService: No results or rows returned from embeddings query');
                return [];
            }

            const matches: VectorMatch[] = [];
            const rowCount = results.rows.length || 0;

            for (let i = 0; i < rowCount; i++) {
                const row = results.rows.item ? results.rows.item(i) : (results.rows._array ? results.rows._array[i] : null);

                if (!row || !row.vector) {
                    continue;
                }

                try {
                    // row.vector is potentially a Uint8Array. 
                    // Float32Array constructor needs (buffer, byteOffset, length)
                    // MobileNetV2 usually returns 1001 or 1280 floats -> 4004 or 5120 bytes.
                    const vectorData = row.vector;
                    const storedVector = new Float32Array(
                        vectorData.buffer,
                        vectorData.byteOffset,
                        vectorData.byteLength / 4
                    );

                    const similarity = this.cosineSimilarity(queryVector, storedVector);
                    matches.push({ carId: row.carId, similarity });
                } catch (rowError) {
                    console.error(`Error processing row at index ${i}:`, rowError);
                }
            }

            return matches
                .filter(m => !isNaN(m.similarity))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } catch (e) {
            console.error('Similarity search failed:', e);
            return [];
        }
    }

    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        if (!a || !b || a.length !== b.length) {
            return 0;
        }
        let dotProduct = 0;
        let mA = 0;
        let mB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            mA += a[i] * a[i];
            mB += b[i] * b[i];
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        if (mA === 0 || mB === 0) return 0;
        return dotProduct / (mA * mB);
    }

    async removeEmbedding(carId: string) {
        if (!this.db) await this.init();
        if (this.db) {
            this.db.execute('DELETE FROM embeddings WHERE carId = ?', [carId]);
        }
    }
}

export const vectorSearchService = new VectorSearchService();
