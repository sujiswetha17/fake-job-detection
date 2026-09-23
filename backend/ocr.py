from PIL import Image
import pytesseract


# Tesseract OCR installation path on Windows
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using Tesseract OCR.
    """

    image = Image.open(image_path)

    text = pytesseract.image_to_string(image)

    return text.strip()