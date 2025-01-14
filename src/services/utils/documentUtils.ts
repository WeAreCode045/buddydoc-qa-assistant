import { WPDocument } from '../types/wordpress';
import { getAttachmentUrlByParent } from './mediaUtils';

export const processPdfFile = async (
  doc: WPDocument,
  config: any,
  baseDomain: string
): Promise<WPDocument> => {
  console.log('Processing document:', doc);
  
  const pdfUrl = await getAttachmentUrlByParent(doc.id, config);
  
  if (pdfUrl) {
    return {
      ...doc,
      acf: {
        ...doc.acf,
        pdf_file: pdfUrl
      }
    };
  }
  
  if (doc.acf?.pdf_file && typeof doc.acf.pdf_file === 'string') {
    const url = doc.acf.pdf_file.startsWith('http')
      ? doc.acf.pdf_file
      : `${baseDomain}${doc.acf.pdf_file}`;
      
    return {
      ...doc,
      acf: {
        ...doc.acf,
        pdf_file: url
      }
    };
  }

  console.log('Document missing PDF file:', doc);
  return {
    ...doc,
    acf: { pdf_file: '' }
  };
};