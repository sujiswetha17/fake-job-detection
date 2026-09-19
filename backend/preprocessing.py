import re


def clean_text(text):
    if not text:
        return ""

    text = str(text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Remove URLs
    text = re.sub(
        r"http\S+|www\S+",
        " ",
        text
    )

    # Convert to lowercase
    text = text.lower()

    # Keep letters and numbers
    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    # Remove extra spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


def build_job_text(
    job_title="",
    company_profile="",
    description="",
    requirements="",
    benefits=""
):
    parts = [
        clean_text(job_title),
        clean_text(company_profile),
        clean_text(description),
        clean_text(requirements),
        clean_text(benefits)
    ]

    return " ".join(
        part for part in parts if part
    )