async function analyzeJob() {

    const jobTitle = document.getElementById("job_title").value;
    const company = document.getElementById("company").value;
    const location = document.getElementById("location").value;
    const salary = document.getElementById("salary").value;
    const description = document.getElementById("description").value;

    const resultDiv = document.getElementById("result");

    resultDiv.innerText = "Analyzing job...";

    const jobData = {
        job_title: jobTitle,
        company: company,
        location: location,
        salary: Number(salary),
        description: description
    };

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/predict",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jobData)
            }
        );

        const result = await response.json();

        resultDiv.innerHTML = `
            <h2>${result.result}</h2>

            <p>
                <strong>Risk Score:</strong>
                ${result.risk_score}%
            </p>

            <h3>Warning Signs</h3>

            ${
                result.warnings.length > 0
                ? `<ul>
                    ${result.warnings.map(
                        warning => `<li>${warning}</li>`
                    ).join("")}
                   </ul>`
                : "<p>No major warning signs detected.</p>"
            }
        `;

    } catch (error) {

        console.error(error);

        resultDiv.innerText =
            "Unable to connect to the backend server.";
    }
}