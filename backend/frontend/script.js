function analyzeJob() {
    const jobTitle = document.getElementById("job_title").value;
    const company = document.getElementById("company").value;
    const location = document.getElementById("location").value;
    const salary = document.getElementById("salary").value;
    const description = document.getElementById("description").value;

    console.log("Job Title:", jobTitle);
    console.log("Company:", company);
    console.log("Location:", location);
    console.log("Salary:", salary);
    console.log("Description:", description);
}