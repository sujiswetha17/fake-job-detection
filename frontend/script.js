async function analyzeJob() {
    const jobTitle = document.getElementById("job_title").value;
    const company = document.getElementById("company").value;
    const location = document.getElementById("location").value;
    const salary = document.getElementById("salary").value;
    const description = document.getElementById("description").value;

    const jobData = {
        job_title: jobTitle,
        company: company,
        location: location,
        salary: Number(salary),
        description: description
    };

    const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jobData)
    });

    const result = await response.json();
    document.getElementById("result").innerText = result.result;

}