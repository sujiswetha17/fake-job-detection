from fastapi import FastAPI
from .schemas import JobPosting

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Fake Job Detection API is running"}


@app.post("/predict")
def predict(job: JobPosting):
    return {
        "job_title": job.job_title,
        "company": job.company,
        "description": job.description,
        "location": job.location,
        "salary": job.salary,
        "result": "Prediction endpoint is ready"
    }
    