  
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import JobPosting
from .database import jobs_collection
from .ml_model import predict_job
from .preprocessing import build_job_text
from .warnings import generate_warnings


app = FastAPI(
    title="Fake Job Fraud Detection API",
    description="AI-based fake job detection system",
    version="1.0.0"
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


@app.post("/predict")
def predict(job: JobPosting):

    job_text = build_job_text(
        job_title=job.job_title,
        company_profile=job.company,
        description=job.description,
        requirements="",
        benefits=""
    )

    prediction, probability = predict_job(
        job_text
    )

    risk_score = round(
        probability * 100,
        2
    )

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

    warnings = generate_warnings(
        job.description
    )

    job_data = job.model_dump()

    job_data["prediction"] = prediction
    job_data["result"] = result
    job_data["risk_score"] = risk_score
    job_data["risk_level"] = risk_level
    job_data["warnings"] = warnings

    jobs_collection.insert_one(job_data)

    return {
        "job_title": job.job_title,
        "company": job.company,
        "result": result,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "warnings": warnings
    }    