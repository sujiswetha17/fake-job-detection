import joblib
import os


# Find project root
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)


# Paths to trained ML files
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


# Load trained model
model = joblib.load(MODEL_PATH)

# Load TF-IDF vectorizer
vectorizer = joblib.load(VECTORIZER_PATH)


def predict_job(text):

    # Convert text into TF-IDF features
    text_vector = vectorizer.transform([text])

    # Prediction
    prediction = model.predict(text_vector)[0]

    # Probability of suspicious class
    probability = model.predict_proba(text_vector)[0][1]

    return prediction, probability