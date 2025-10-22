declare module 'mammoth' {
    interface ConversionResult {
        value: string
        messages: any[]
    }

    interface Options {
        buffer: Buffer
    }

    function extractRawText(options: Options): Promise<ConversionResult>

    export { extractRawText }
    export default { extractRawText }
}

declare module 'pdf-parse' {
    interface PDFData {
        text: string
    }

    function parse(dataBuffer: Buffer): Promise<PDFData>
    export = parse
}

// Modules without TypeScript types
declare module 'csurf'
declare module 'xss-clean'
declare module 'cookie-parser'
declare module 'hpp'
