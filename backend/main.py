from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import JobPosting

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
    