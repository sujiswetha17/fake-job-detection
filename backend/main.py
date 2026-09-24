import os
import shutil
import tempfile

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import JobPosting
from .database import jobs_collection
from .ml_model import predict_job
from .preprocessing import build_job_text
from .warnings import generate_warnings
from .ocr import extract_text_from_image
from .pdf_extractor import extract_text_from_pdf


app = FastAPI(
    title="Fake Job Fraud Detection API",
    description="AI-based fake job detection system",
    version="3.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Fake Job Detection API is running"
    }


def analyze_text(
    job_title: str,
    company: str,
    location: str,
    salary: float,
    description: str,
    source: str = "manual"
):
    job_text = build_job_text(
        job_title=job_title,
        company_profile=company,
        description=description,
        requirements="",
        benefits=""
    )

    prediction, probability = predict_job(job_text)

    risk_score = round(probability * 100, 2)

    if prediction == 1:
        result = "Suspicious"
    else:
        result = "Likely Genuine"

    if risk_score < 30:
        risk_level = "Low Risk"
    elif risk_score < 60:
        risk_level = "Medium Risk"
    elif risk_score < 80:
        risk_level = "High Risk"
    else:
        risk_level = "Very High Risk"

    warnings = generate_warnings(description)

    job_data = {
        "job_title": job_title,
        "company": company,
        "location": location,
        "salary": salary,
        "description": description,
        "prediction": prediction,
        "result": result,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "warnings": warnings,
        "source": source
    }

    jobs_collection.insert_one(job_data)

    return {
        "job_title": job_title,
        "company": company,
        "location": location,
        "result": result,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "warnings": warnings,
        "source": source
    }


# ==========================================
# MANUAL JOB ANALYSIS
# ==========================================

@app.post("/predict")
def predict(job: JobPosting):

    return analyze_text(
        job_title=job.job_title,
        company=job.company,
        location=job.location,
        salary=job.salary,
        description=job.description,
        source="manual"
    )


# ==========================================
# IMAGE OCR ANALYSIS
# ==========================================

@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...)
):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ]

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP image."
        )

    temp_path = None

    try:

        suffix = os.path.splitext(
            file.filename or ".png"
        )[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_path = temp_file.name

            shutil.copyfileobj(
                file.file,
                temp_file
            )

        extracted_text = extract_text_from_image(
            temp_path
        )

        if not extracted_text.strip():

            raise HTTPException(
                status_code=400,
                detail="No readable text was found in the image."
            )

        result = analyze_text(
            job_title="Extracted Job Posting",
            company="Unknown",
            location="Unknown",
            salary=0,
            description=extracted_text,
            source="image_ocr"
        )

        result["extracted_text"] = extracted_text

        return result

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(error)}"
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


# ==========================================
# PDF ANALYSIS
# ==========================================

@app.post("/analyze-pdf")
async def analyze_pdf(
    file: UploadFile = File(...)
):

    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_path = temp_file.name

            shutil.copyfileobj(
                file.file,
                temp_file
            )

        extracted_text = extract_text_from_pdf(
            temp_path
        )

        if not extracted_text.strip():

            raise HTTPException(
                status_code=400,
                detail="No readable text was found in the PDF."
            )

        result = analyze_text(
            job_title="Extracted PDF Job Posting",
            company="Unknown",
            location="Unknown",
            salary=0,
            description=extracted_text,
            source="pdf"
        )

        result["extracted_text"] = extracted_text

        return result

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(error)}"
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)