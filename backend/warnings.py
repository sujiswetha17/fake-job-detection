import re


def generate_warnings(description):
    text = description.lower()
    warnings = []

    # Payment-related requests
    payment_patterns = [
        r"registration fee",
        r"application fee",
        r"processing fee",
        r"training fee",
        r"security deposit",
        r"pay.*fee",
        r"fee.*required",
        r"send.*money",
        r"make.*payment"
    ]

    if any(
        re.search(pattern, text)
        for pattern in payment_patterns
    ):
        # Avoid false positive when explicitly saying no fee
        if not re.search(
            r"no\s+(registration|application|processing|training)?\s*fee",
            text
        ):
            warnings.append(
                "The job description may request a payment, fee, or deposit."
            )

    # Sensitive information
    sensitive_patterns = [
        "bank account",
        "bank details",
        "credit card",
        "debit card",
        "password",
        "otp",
        "one time password"
    ]

    if any(
        phrase in text
        for phrase in sensitive_patterns
    ):
        warnings.append(
            "The job description may request sensitive personal information."
        )

    # Messaging platforms
    if any(
        platform in text
        for platform in [
            "whatsapp",
            "telegram"
        ]
    ):
        warnings.append(
            "The job uses a messaging platform as a primary contact method."
        )

    # Unrealistic earnings
    if re.search(
        r"earn\s+\$?\d+[k]?\s*(per day|daily)",
        text
    ):
        warnings.append(
            "The advertisement may contain unusually high earning claims."
        )

    # Urgency
    urgency_words = [
        "act now",
        "urgent hiring",
        "limited positions",
        "apply immediately",
        "hurry"
    ]

    if any(
        phrase in text
        for phrase in urgency_words
    ):
        warnings.append(
            "The advertisement uses urgent or pressure-based language."
        )

    return warnings