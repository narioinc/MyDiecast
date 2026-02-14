import { loadDefaultModel, detectObjects, isLoaded } from '@infinitered/react-native-mlkit-object-detection';
import ImageEditor from '@react-native-community/image-editor';
import { Image } from 'react-native';

const DEFAULT_MODEL_NAME = 'default';

export interface CropResult {
    uri: string;
    width: number;
    height: number;
}

/**
 * Automatically detects the most prominent object in an image and crops to it.
 * Useful for focusing on a diecast car or its original box.
 */
export const detectAndCrop = async (imageUri: string, padding: number = 20): Promise<CropResult | null> => {
    try {
        // 1. Ensure model is loaded
        if (!isLoaded(DEFAULT_MODEL_NAME)) {
            await loadDefaultModel({
                detectorMode: 'singleImage',
                shouldEnableClassification: true,
                shouldEnableMultipleObjects: false,
            });
        }

        // 2. Get original image dimensions
        const dims = await new Promise<{ width: number, height: number }>((resolve, reject) => {
            Image.getSize(imageUri, (width, height) => resolve({ width, height }), reject);
        });

        // 3. Detect objects
        const results = await detectObjects(DEFAULT_MODEL_NAME, imageUri);

        if (results.length === 0) {
            console.log('No objects detected for auto-crop');
            return null;
        }

        // 4. pick the best object (ML Kit usually sorts by confidence)
        const obj = results[0];
        const { frame } = obj;

        // ML Kit frame is often in relative coordinates or pixels depending on the implementation
        // For @infinitered/react-native-mlkit-object-detection, frame.origin and frame.size are absolute pixels

        let x = Math.max(0, frame.origin.x - padding);
        let y = Math.max(0, frame.origin.y - padding);
        let width = frame.size.x + (padding * 2);
        let height = frame.size.y + (padding * 2);

        // Bound to image size
        if (x + width > dims.width) width = dims.width - x;
        if (y + height > dims.height) height = dims.height - y;

        // 5. Crop
        const cropData = {
            offset: { x, y },
            size: { width, height },
            displaySize: { width, height }, // Keep original resolution
            quality: 0.9,
        };

        const result = await ImageEditor.cropImage(imageUri, cropData);

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error('Auto-crop failed:', error);
        return null;
    }
};
