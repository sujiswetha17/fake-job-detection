from pydantic import BaseModel
class JobPosting(BaseModel):
    job_title: str
    company: str
    location: str
    salary: float
    description: str