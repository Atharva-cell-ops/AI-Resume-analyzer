/**
 * PDF & Text parsing helper for client-side file reading.
 * Integrates with pdf.js via CDN in a highly robust manner.
 */

const PDFHelper = {
    /**
     * Initializes PDF.js worker.
     */
    init() {
        if (typeof window.pdfjsLib !== 'undefined') {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            console.log('PDF.js initialized successfully.');
        } else {
            console.warn('PDF.js library is not loaded. PDF parsing will fall back or wait.');
        }
    },

    /**
     * Read and extract text content from a File object.
     * @param {File} file - The file uploaded by the user.
     * @returns {Promise<string>} The extracted text.
     */
    async extractText(file) {
        if (!file) {
            throw new Error('No file provided.');
        }

        const fileType = file.name.split('.').pop().toLowerCase();

        if (fileType === 'txt') {
            return this.readAsText(file);
        } else if (fileType === 'pdf') {
            return this.readAsPdf(file);
        } else {
            // Fallback: try reading as plain text anyway
            return this.readAsText(file);
        }
    },

    /**
     * Helper to read plain text files.
     * @param {File} file 
     * @returns {Promise<string>}
     */
    readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read TXT file: ' + e.target.error));
            reader.readAsText(file);
        });
    },

    /**
     * Helper to read and extract text from PDF file.
     * @param {File} file 
     * @returns {Promise<string>}
     */
    readAsPdf(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    
                    if (typeof window.pdfjsLib === 'undefined') {
                        throw new Error('PDF parsing library (PDF.js) failed to load. Please verify internet connection.');
                    }

                    const loadingTask = window.pdfjsLib.getDocument({ data: typedarray });
                    const pdf = await loadingTask.promise;
                    let fullText = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        
                        // Extract text and join with space
                        const pageText = textContent.items
                            .map(item => item.str)
                            .join(' ');
                            
                        fullText += pageText + '\n';
                    }

                    if (!fullText.trim()) {
                        throw new Error('Extracted text is empty. This PDF might be scanned/image-only or secured.');
                    }

                    resolve(fullText);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (e) => reject(new Error('Failed to read PDF file: ' + e.target.error));
            reader.readAsArrayBuffer(file);
        });
    }
};

// Initialize on script load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PDFHelper.init());
} else {
    PDFHelper.init();
}
