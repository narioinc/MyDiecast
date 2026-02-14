import { parseOCRText } from '../src/utils/ocrParser';

describe('ocrParser', () => {
    test('should parse brand, model, and scale from typical box art text', () => {
        const text = `
      HOT WHEELS
      PORSCHE 911 GT3
      1:64 SCALE
      HKC27
    `;
        const result = parseOCRText(text);
        expect(result.manufacturer).toBe('Hot Wheels');
        expect(result.brand).toBe('Porsche');
        expect(result.model).toContain('911 GT3');
        expect(result.scale).toBe('1:64');
        expect(result.modelId).toBe('HKC27');
    });

    test('should handle different scale formats', () => {
        const text = 'MINIGT 1/64 NISSAN SKYLINE';
        const result = parseOCRText(text);
        expect(result.scale).toBe('1:64');
        expect(result.manufacturer).toBe('MINIGT');
        expect(result.brand).toBe('Nissan');
    });

    test('should identify manufacturer from known brands list', () => {
        const text = 'GREENLIGHT HOLLYWOOD SERIES 1:64';
        const result = parseOCRText(text);
        expect(result.manufacturer).toBe('Greenlight');
    });

    test('should provide fallback values for unknown text', () => {
        const result = parseOCRText('RANDOM BLURRY TEXT');
        expect(result.brand).toBe('Unknown Manufacturer');
        expect(result.model).toBe('RANDOM BLURRY TEXT');
    });
});
