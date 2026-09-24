const API_URL = "http://127.0.0.1:8000";


// ==========================================
// MANUAL JOB ANALYSIS
// ==========================================

async function analyzeJob() {

    const jobTitle =
        document.getElementById("job_title").value.trim();

    const company =
        document.getElementById("company").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const salary =
        document.getElementById("salary").value;

    const description =
        document.getElementById("description").value.trim();

    const resultDiv =
        document.getElementById("result");


    if (!jobTitle || !company || !description) {

        resultDiv.innerHTML = `
            <p class="error">
                Please fill in the job title, company
                and job description.
            </p>
        `;

        return;
    }


    resultDiv.innerHTML = `
        <p>
            🔍 Analyzing job posting...
        </p>
    `;


    const jobData = {

        job_title: jobTitle,

        company: company,

        location: location,

        salary: Number(salary) || 0,

        description: description
    };


    try {

        const response = await fetch(
            `${API_URL}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(jobData)
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Analysis failed."
            );
        }


        displayResult(result);

    }

    catch (error) {

        console.error(error);

        resultDiv.innerHTML = `
            <p class="error">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}



// ==========================================
// IMAGE OCR ANALYSIS
// ==========================================

async function analyzeImage() {

    const fileInput =
        document.getElementById("imageFile");

    const resultDiv =
        document.getElementById("result");


    if (!fileInput.files.length) {

        resultDiv.innerHTML = `
            <p class="error">
                Please select an image first.
            </p>
        `;

        return;
    }


    const file =
        fileInput.files[0];


    resultDiv.innerHTML = `
        <p>
            🔍 Reading image and extracting text...
        </p>
    `;


    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );


    try {

        const response = await fetch(
            `${API_URL}/analyze-image`,
            {
                method: "POST",

                body: formData
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Image analysis failed."
            );
        }


        displayImageResult(result);

    }

    catch (error) {

        console.error(error);

        resultDiv.innerHTML = `
            <p class="error">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}



// ==========================================
// PDF ANALYSIS
// ==========================================

async function analyzePDF() {

    const fileInput =
        document.getElementById("pdfFile");

    const resultDiv =
        document.getElementById("result");


    if (!fileInput.files.length) {

        resultDiv.innerHTML = `
            <p class="error">
                Please select a PDF file first.
            </p>
        `;

        return;
    }


    const file =
        fileInput.files[0];


    if (file.type !== "application/pdf") {

        resultDiv.innerHTML = `
            <p class="error">
                Please select a valid PDF file.
            </p>
        `;

        return;
    }


    resultDiv.innerHTML = `
        <p>
            📄 Reading PDF and extracting text...
        </p>
    `;


    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );


    try {

        const response = await fetch(
            `${API_URL}/analyze-pdf`,
            {
                method: "POST",

                body: formData
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "PDF analysis failed."
            );
        }


        displayPDFResult(result);

    }

    catch (error) {

        console.error(error);

        resultDiv.innerHTML = `
            <p class="error">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}



// ==========================================
// DISPLAY MANUAL RESULT
// ==========================================

function displayResult(result) {

    const resultDiv =
        document.getElementById("result");


    const warningsHTML =
        createWarningsHTML(
            result.warnings
        );


    resultDiv.innerHTML = `

        <h2>
            ${escapeHtml(result.result)}
        </h2>

        <p>
            <strong>Risk Score:</strong>
            ${result.risk_score}%
        </p>

        <p>
            <strong>Risk Level:</strong>
            ${escapeHtml(result.risk_level)}
        </p>

        <h3>
            ⚠️ Warning Signs
        </h3>

        ${warningsHTML}

    `;
}



// ==========================================
// DISPLAY IMAGE RESULT
// ==========================================

function displayImageResult(result) {

    const resultDiv =
        document.getElementById("result");


    const warningsHTML =
        createWarningsHTML(
            result.warnings
        );


    resultDiv.innerHTML = `

        <h2>
            ${escapeHtml(result.result)}
        </h2>

        <p>
            <strong>Risk Score:</strong>
            ${result.risk_score}%
        </p>

        <p>
            <strong>Risk Level:</strong>
            ${escapeHtml(result.risk_level)}
        </p>

        <h3>
            ⚠️ Warning Signs
        </h3>

        ${warningsHTML}


        <h3>
            📝 Extracted Text
        </h3>

        <div class="extracted-text">

            ${escapeHtml(
                result.extracted_text || ""
            )}

        </div>

    `;
}



// ==========================================
// DISPLAY PDF RESULT
// ==========================================

function displayPDFResult(result) {

    const resultDiv =
        document.getElementById("result");


    const warningsHTML =
        createWarningsHTML(
            result.warnings
        );


    resultDiv.innerHTML = `

        <h2>
            ${escapeHtml(result.result)}
        </h2>

        <p>
            <strong>Risk Score:</strong>
            ${result.risk_score}%
        </p>

        <p>
            <strong>Risk Level:</strong>
            ${escapeHtml(result.risk_level)}
        </p>

        <h3>
            ⚠️ Warning Signs
        </h3>

        ${warningsHTML}


        <h3>
            📄 Extracted PDF Text
        </h3>

        <div class="extracted-text">

            ${escapeHtml(
                result.extracted_text || ""
            )}

        </div>

    `;
}



// ==========================================
// CREATE WARNING LIST
// ==========================================

function createWarningsHTML(warnings) {

    if (
        !warnings ||
        warnings.length === 0
    ) {

        return `
            <p>
                ✅ No major warning signs detected.
            </p>
        `;
    }


    return `
        <ul>

            ${warnings
                .map(
                    warning => `
                        <li>
                            ${escapeHtml(warning)}
                        </li>
                    `
                )
                .join("")
            }

        </ul>
    `;
}



// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}