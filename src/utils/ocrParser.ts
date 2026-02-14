export interface ParsedDiecastInfo {
    brand: string;
    model: string;
    manufacturer: string;
    modelId: string;
    scale: string;
}

const KNOWN_SCALES = ['1:18', '1:24', '1:32', '1:43', '1:64'];
const KNOWN_BRANDS = [
    'Hot Wheels', 'Matchbox', 'MINIGT', 'Pop race', 'CCA', 'Para64',
    'Inno64', 'KaidoHouse', 'Bburago', 'Maisto', 'BBR', 'Tomica',
    'Tarmac Works', 'Solido', 'Greenlight'
];

export const parseOCRText = (text: string): ParsedDiecastInfo => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const fullText = text.replace(/\s+/g, ' ');
    const lowerText = fullText.toLowerCase();

    let brand = '';
    let model = '';
    let manufacturer = '';
    let modelId = '';
    let scale = '1:64';

    // 1. Detect Scale using RegEx
    const scaleMatch = fullText.match(/1[:.\s]\d{2}/);
    if (scaleMatch) {
        scale = scaleMatch[0].replace(/[:.\s]/, ':');
    } else {
        for (const s of KNOWN_SCALES) {
            if (lowerText.includes(s)) {
                scale = s;
                break;
            }
        }
    }

    // 2. Detect Manufacturer from known brands
    for (const b of KNOWN_BRANDS) {
        if (lowerText.includes(b.toLowerCase())) {
            manufacturer = b;
            break;
        }
    }

    // 3. Detect Model ID (alphanumeric pattern common in diecasts)
    const idMatch = fullText.match(/[A-Z]{1,3}\d{2,5}/);
    if (idMatch) {
        modelId = idMatch[0];
    }

    // 4. Try to find "Car Brand" (Make)
    // Heuristic: If we found a manufacturer (e.g. Hot Wheels), look for other words
    const commonMakes = ['Porsche', 'Ferrari', 'Lamborghini', 'Nissan', 'Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Chevrolet', 'Dodge'];
    for (const make of commonMakes) {
        if (lowerText.includes(make.toLowerCase())) {
            brand = make;
            break;
        }
    }

    // 5. Heuristic for Model name
    // Use the longest line that isn't just the manufacturer or brand
    if (lines.length > 0) {
        const candidates = lines.filter(l =>
            l.toLowerCase() !== manufacturer.toLowerCase() &&
            l.toLowerCase() !== brand.toLowerCase() &&
            !l.toLowerCase().includes(scale.toLowerCase()) &&
            l.length > 3
        );

        if (candidates.length > 0) {
            // Pick the longest line that doesn't contain the manufacturer if possible
            const betterCandidates = candidates.filter(l => !l.toLowerCase().includes(manufacturer.toLowerCase()));
            model = betterCandidates.length > 0 ? betterCandidates[0] : candidates[0];
        } else if (lines.length > 1) {
            model = lines[1];
        }
    }

    const finalManufacturer = manufacturer || 'Unknown Manufacturer';
    const finalBrand = brand || manufacturer || 'Unknown Manufacturer';

    return {
        brand: finalBrand,
        model: model || 'Unknown Model',
        manufacturer: finalManufacturer,
        modelId,
        scale
    };
};
