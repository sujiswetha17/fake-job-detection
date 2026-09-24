import os
import tempfile

import pymupdf

from .ocr import extract_text_from_image


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF.

    Text-based PDFs are extracted directly.

    Scanned/image-based PDF pages are rendered as images
    and processed using the existing Tesseract OCR pipeline.
    """

    document = pymupdf.open(pdf_path)

    extracted_pages = []

    try:
        for page in document:

            text = page.get_text("text").strip()

            if text:
                extracted_pages.append(text)
                continue

            # Scanned/image-only page
            pixmap = page.get_pixmap(
                matrix=pymupdf.Matrix(2, 2),
                alpha=False
            )

            image_path = None

            try:

                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=".png"
                ) as temp_image:

                    image_path = temp_image.name

                pixmap.save(image_path)

                ocr_text = extract_text_from_image(
                    image_path
                )

                if ocr_text:
                    extracted_pages.append(ocr_text)

            finally:

                if (
                    image_path
                    and os.path.exists(image_path)
                ):
                    os.remove(image_path)

        return "\n\n".join(
            extracted_pages
        ).strip()

    finally:

        document.close()