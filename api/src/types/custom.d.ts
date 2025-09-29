declare module 'mammoth' {
  interface ConversionResult {
    value: string;
    messages: any[];
  }

  interface Options {
    buffer: Buffer;
  }

  function extractRawText(options: Options): Promise<ConversionResult>;

  export { extractRawText };
  export default { extractRawText };
}

declare module 'pdf-parse' {
  interface PDFData {
    text: string;
  }

  function parse(dataBuffer: Buffer): Promise<PDFData>;
  export = parse;
}