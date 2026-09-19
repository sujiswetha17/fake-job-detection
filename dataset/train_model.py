import pandas as pd
import re
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


def clean_text(text):
    if pd.isna(text):
        return ""

    text = str(text)

    text = re.sub(
        r"<[^>]+>",
        " ",
        text
    )

    text = re.sub(
        r"http\S+|www\S+",
        " ",
        text
    )

    text = text.lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


print("Loading dataset...")

df = pd.read_csv(
    "cleaned_dataset.csv"
)

print(
    "Dataset loaded:",
    df.shape
)


text_columns = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits"
]


for column in text_columns:
    if column not in df.columns:
        df[column] = ""


df["combined_text"] = ""

for column in text_columns:
    df["combined_text"] += (
        " " +
        df[column].fillna("").apply(clean_text)
    )


df["combined_text"] = (
    df["combined_text"]
    .str.strip()
)


X = df["combined_text"]
y = df["fraudulent"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print(
    "\nTraining samples:",
    len(X_train)
)

print(
    "Testing samples:",
    len(X_test)
)


vectorizer = TfidfVectorizer(
    max_features=50000,
    ngram_range=(1, 2),
    min_df=2
)


X_train_tfidf = vectorizer.fit_transform(
    X_train
)

X_test_tfidf = vectorizer.transform(
    X_test
)


print(
    "\nTF-IDF training shape:",
    X_train_tfidf.shape
)


model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)


print(
    "\nTraining model..."
)

model.fit(
    X_train_tfidf,
    y_train
)

print(
    "Training completed!"
)


y_pred = model.predict(
    X_test_tfidf
)


accuracy = accuracy_score(
    y_test,
    y_pred
)

print(
    "\nAccuracy:",
    accuracy
)

print(
    "\nClassification Report:"
)

print(
    classification_report(
        y_test,
        y_pred
    )
)

print(
    "\nConfusion Matrix:"
)

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


joblib.dump(
    model,
    "fake_job_model.pkl"
)

joblib.dump(
    vectorizer,
    "tfidf_vectorizer.pkl"
)


print(
    "\nModel saved successfully."
)