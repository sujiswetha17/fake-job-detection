
import pandas as pd
import re
from bs4 import BeautifulSoup

# Load dataset
df = pd.read_csv("dataset.csv")

print("Original shape:", df.shape)

# Convert target
df["fraudulent"] = df["fraudulent"].map({"f": 0, "t": 1})

# Important text columns
text_columns = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits"
]

# Fill missing text values
for col in text_columns:
    df[col] = df[col].fillna("")


# Clean HTML and text
def clean_text(text):
    text = str(text)

    # Remove HTML tags and decode HTML entities
    text = BeautifulSoup(text, "html.parser").get_text(" ")

    # Convert to lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", " ", text)

    # Keep letters and numbers
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# Clean each text column
for col in text_columns:
    df[col] = df[col].apply(clean_text)


# Combine important text
df["combined_text"] = (
    df["title"] + " " +
    df["company_profile"] + " " +
    df["description"] + " " +
    df["requirements"] + " " +
    df["benefits"]
)


# Remove empty combined text
df = df[df["combined_text"].str.strip() != ""]


# Display results
print("\nCleaned dataset shape:", df.shape)

print("\nFraudulent distribution:")
print(df["fraudulent"].value_counts())

print("\nCleaned text sample:")
print(df["combined_text"].iloc[0])
# Save cleaned dataset
df.to_csv("cleaned_dataset.csv", index=False)

print("\nCleaned dataset saved as cleaned_dataset.csv")