import os
import joblib

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "fake_job_model.pkl"
)

VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "tfidf_vectorizer.pkl"
)
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
def predict_job(text):
    text_vector = vectorizer.transform([text])

    prediction = int(model.predict(text_vector)[0])

    probability = float(
        model.predict_proba(text_vector)[0][1]
    )

    return prediction, probability