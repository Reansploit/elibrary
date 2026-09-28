import { analyzePdfPage } from '@reo-engine/parser-pdf';
import { OPS, Util } from 'pdfjs-dist/build/pdf.mjs';

function multiply(first, second) {
    return [
        first[0] * second[0] + first[2] * second[1],
        first[1] * second[0] + first[3] * second[1],
        first[0] * second[2] + first[2] * second[3],
        first[1] * second[2] + first[3] * second[3],
        first[0] * second[4] + first[2] * second[5] + first[4],
        first[1] * second[4] + first[3] * second[5] + first[5],
    ];
}

function transformedPoint(transform, x, y) {
    const point = Util.transform(transform, [x, y]);
    return [point[0], point[1]];
}

function textRunsFromContent(content, viewport) {
    return content.items
        .filter((item) => typeof item.str === 'string' && item.str.trim())
        .map((item) => {
            const transform = Util.transform(viewport.transform, item.transform);
            const fontHeight = Math.hypot(transform[2], transform[3]);
            return {
                text: item.str,
                x: transform[4],
                y: transform[5] - fontHeight,
                width: item.width * viewport.scale,
                height: fontHeight,
                fontSize: fontHeight,
                confidence: 1,
            };
        })
        .filter((run) => run.height > 0 && run.width > 0);
}

function imageRegionsFromOperatorList(operatorList, viewport) {
    const regions = [];
    const stack = [];
    let currentTransform = [1, 0, 0, 1, 0, 0];
    const imageOps = new Set([
        OPS.paintImageXObject,
        OPS.paintImageMaskXObject,
        OPS.paintInlineImageXObject,
    ]);

    for (let index = 0; index < operatorList.fnArray.length; index += 1) {
        const fn = operatorList.fnArray[index];
        const args = operatorList.argsArray[index] || [];

        if (fn === OPS.save) {
            stack.push([...currentTransform]);
        } else if (fn === OPS.restore) {
            currentTransform = stack.pop() || [1, 0, 0, 1, 0, 0];
        } else if (fn === OPS.transform && args.length >= 6) {
            currentTransform = multiply(args.slice(0, 6), currentTransform);
        } else if (imageOps.has(fn)) {
            const viewportTransform = viewport.transform;
            const corners = [
                transformedPoint(viewportTransform, ...transformedPoint(currentTransform, 0, 0)),
                transformedPoint(viewportTransform, ...transformedPoint(currentTransform, 1, 0)),
                transformedPoint(viewportTransform, ...transformedPoint(currentTransform, 0, 1)),
                transformedPoint(viewportTransform, ...transformedPoint(currentTransform, 1, 1)),
            ];
            const xValues = corners.map((point) => point[0]);
            const yValues = corners.map((point) => point[1]);
            const x = Math.min(...xValues);
            const y = Math.min(...yValues);
            const width = Math.max(...xValues) - x;
            const height = Math.max(...yValues) - y;

            if (width > 0 && height > 0) {
                regions.push({
                    x,
                    y,
                    width,
                    height,
                    role: 'content',
                    confidence: 0.7,
                });
            }
        }
    }

    return regions;
}

export async function analyzePdfPageFromPdf(pdf, pageNumber) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const [textContent, operatorList] = await Promise.all([
        page.getTextContent(),
        page.getOperatorList(),
    ]);

    return analyzePdfPage({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        textRuns: textRunsFromContent(textContent, viewport),
        imageRegions: imageRegionsFromOperatorList(operatorList, viewport),
        backgroundConfidence: 0.5,
    });
}
