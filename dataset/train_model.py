import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

import joblib


# 1. Load cleaned dataset
df = pd.read_csv("cleaned_dataset.csv")

print("Dataset loaded:", df.shape)


# 2. Select input and target
X = df["combined_text"]
y = df["fraudulent"]


# 3. Split dataset into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# 4. Convert text into TF-IDF features
vectorizer = TfidfVectorizer(
    max_features=50000,
    ngram_range=(1, 2),
    min_df=2
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print("\nTF-IDF training shape:", X_train_tfidf.shape)
print("TF-IDF testing shape:", X_test_tfidf.shape)


# 5. Create Logistic Regression model
model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)


# 6. Train model
print("\nTraining model...")

model.fit(X_train_tfidf, y_train)

print("Training completed!")


# 7. Make predictions
y_pred = model.predict(X_test_tfidf)


# 8. Evaluate model
accuracy = accuracy_score(y_test, y_pred)

print("\nAccuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# 9. Save model and vectorizer
joblib.dump(model, "fake_job_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("\nModel saved as fake_job_model.pkl")
print("Vectorizer saved as tfidf_vectorizer.pkl")