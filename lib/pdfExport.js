import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportNoteToPDF(note) {
    try {
        // Create a temporary div to render the content
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = 'position: absolute; left: -9999px; width: 800px; padding: 40px; background: white; font-family: Arial, sans-serif;';

        tempDiv.innerHTML = `
            <div>
                <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">${note.title}</h1>
                <p style="color: #666; font-size: 12px; margin-bottom: 20px;">
                    ${new Date(note.updatedAt).toLocaleString('tr-TR')}
                    ${note.wordCount ? ` • ${note.wordCount} kelime` : ''}
                    ${note.tags ? ` • ${note.tags}` : ''}
                </p>
                <div style="color: #333; font-size: 14px; line-height: 1.6;">
                    ${note.content}
                </div>
            </div>
        `;

        document.body.appendChild(tempDiv);

        // Convert to canvas
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Remove temporary div
        document.body.removeChild(tempDiv);

        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

        // Download PDF
        const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`;
        pdf.save(filename);

        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        throw error;
    }
}
