const API_URL = "http://127.0.0.1:8000";


async function analyzeJob() {

    const jobTitle =
        document.getElementById("job_title").value;

    const company =
        document.getElementById("company").value;

    const location =
        document.getElementById("location").value;

    const salary =
        document.getElementById("salary").value;

    const description =
        document.getElementById("description").value;

    const resultDiv =
        document.getElementById("result");


    if (!jobTitle || !company || !description) {

        resultDiv.innerHTML = `
            <p class="error">
                Please fill in the job title, company and description.
            </p>
        `;

        return;
    }


    resultDiv.innerHTML = `
        <p>Analyzing job...</p>
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


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail || "Analysis failed."
            );
        }


        displayResult(result);

    }

    catch (error) {

        console.error(error);

        resultDiv.innerHTML = `
            <p class="error">
                Unable to connect to the backend server.
            </p>
        `;
    }
}


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
        <p>Reading image and extracting text...</p>
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
                ${error.message}
            </p>
        `;
    }
}


function displayResult(result) {

    const resultDiv =
        document.getElementById("result");


    const warningsHTML =
        result.warnings.length > 0

        ?

        `
        <ul>
            ${result.warnings
                .map(
                    warning =>
                        `<li>${warning}</li>`
                )
                .join("")}
        </ul>
        `

        :

        `
        <p>
            No major warning signs detected.
        </p>
        `;


    resultDiv.innerHTML = `

        <h2>${result.result}</h2>

        <p>
            <strong>Risk Score:</strong>
            ${result.risk_score}%
        </p>

        <p>
            <strong>Risk Level:</strong>
            ${result.risk_level}
        </p>

        <h3>Warning Signs</h3>

        ${warningsHTML}

    `;
}


function displayImageResult(result) {

    const resultDiv =
        document.getElementById("result");


    const warningsHTML =
        result.warnings.length > 0

        ?

        `
        <ul>
            ${result.warnings
                .map(
                    warning =>
                        `<li>${warning}</li>`
                )
                .join("")}
        </ul>
        `

        :

        `
        <p>
            No major warning signs detected.
        </p>
        `;


    resultDiv.innerHTML = `

        <h2>${result.result}</h2>

        <p>
            <strong>Risk Score:</strong>
            ${result.risk_score}%
        </p>

        <p>
            <strong>Risk Level:</strong>
            ${result.risk_level}
        </p>

        <h3>Warning Signs</h3>

        ${warningsHTML}


        <h3>Extracted Text</h3>

        <div class="extracted-text">
            ${escapeHtml(result.extracted_text)}
        </div>

    `;
}


function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}