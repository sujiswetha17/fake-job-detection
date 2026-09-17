from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import JobPosting
from .database import jobs_collection
from .ml_model import predict_job


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

    # Combine job information for ML prediction
    job_text = (
        job.job_title + " " +
        job.company + " " +
        job.location + " " +
        job.description
    )

    # ML prediction
    prediction, probability = predict_job(job_text)

    # Convert probability into percentage
    risk_score = round(float(probability) * 100, 2)

    if int(prediction) == 1:
        result = "Suspicious"
    else:
        result = "Likely Genuine"

    # Detect simple warning signs
    warnings = []

    description_lower = job.description.lower()

    if any(
        word in description_lower
        for word in ["pay", "fee", "registration fee", "deposit"]
    ):
        warnings.append(
            "The job description may contain a request for payment or fees."
        )

    if any(
        word in description_lower
        for word in ["bank account", "credit card", "password", "otp"]
    ):
        warnings.append(
            "The job description may request sensitive personal information."
        )

    if any(
        word in description_lower
        for word in ["whatsapp", "telegram"]
    ):
        warnings.append(
            "The job uses messaging platforms as a primary contact method."
        )

    # Save everything to MongoDB
    job_data = job.model_dump()

    job_data["prediction"] = int(prediction)
    job_data["result"] = result
    job_data["risk_score"] = risk_score
    job_data["warnings"] = warnings

    jobs_collection.insert_one(job_data)

    return {
        "job_title": job.job_title,
        "company": job.company,
        "result": result,
        "risk_score": risk_score,
        "warnings": warnings
    }   