from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/")
db = client["fake_job_detection"]
jobs_collection = db["jobs"]