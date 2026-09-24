/* =========================================
   JOBGUARD AI
   Frontend Application
========================================= */

const API_URL = "http://127.0.0.1:8000";


// =========================================
// ELEMENTS
// =========================================

// Manual form
const jobForm = document.getElementById("jobForm");

// Image upload
const imageInput = document.getElementById("imageInput");
const imageDropZone = document.getElementById("imageDropZone");
const selectImagesButton = document.getElementById("selectImagesButton");
const imageSelectionArea = document.getElementById("imageSelectionArea");
const imagePreviewGrid = document.getElementById("imagePreviewGrid");
const imageCount = document.getElementById("imageCount");
const clearImagesButton = document.getElementById("clearImagesButton");
const analyzeImagesButton = document.getElementById("analyzeImagesButton");
const imageProcessingStatus = document.getElementById(
    "imageProcessingStatus"
);

// PDF upload
const pdfInput = document.getElementById("pdfInput");
const pdfDropZone = document.getElementById("pdfDropZone");
const selectPdfButton = document.getElementById("selectPdfButton");
const pdfSelectionArea = document.getElementById("pdfSelectionArea");
const pdfFileName = document.getElementById("pdfFileName");
const removePdfButton = document.getElementById("removePdfButton");
const analyzePdfButton = document.getElementById("analyzePdfButton");
const pdfProcessingStatus = document.getElementById(
    "pdfProcessingStatus"
);

// Global states
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

// Result
const resultSection = document.getElementById("resultSection");
const resultBadge = document.getElementById("resultBadge");
const riskScore = document.getElementById("riskScore");
const riskMeter = document.getElementById("riskMeter");
const riskLevel = document.getElementById("riskLevel");
const resultText = document.getElementById("resultText");
const warningsList = document.getElementById("warningsList");
const extractedTextContainer = document.getElementById(
    "extractedTextContainer"
);
const extractedText = document.getElementById("extractedText");
const newAnalysisButton = document.getElementById(
    "newAnalysisButton"
);


// =========================================
// APPLICATION STATE
// =========================================

let selectedImages = [];
let selectedPdf = null;


// =========================================
// HELPER FUNCTIONS
// =========================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showError(message) {

    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");

    errorMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function hideError() {

    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}


function showGlobalLoading() {

    loading.classList.remove("hidden");

    loading.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function hideGlobalLoading() {

    loading.classList.add("hidden");
}


function showResult(result, combinedText = "") {

    resultSection.classList.remove("hidden");

    const score = Number(result.risk_score || 0);

    const safeScore = Math.max(
        0,
        Math.min(100, score)
    );

    riskScore.textContent =
        `${safeScore.toFixed(2)}%`;

    riskMeter.style.width =
        `${safeScore}%`;

    riskLevel.textContent =
        result.risk_level || "Unknown";

    resultText.textContent =
        result.result || "Unknown";

    resultBadge.textContent =
        result.result || "Unknown";

    // Warnings
    const warnings = Array.isArray(result.warnings)
        ? result.warnings
        : [];

    if (warnings.length === 0) {

        warningsList.innerHTML = `
            <p class="no-warning">
                ✓ No warning signs detected.
            </p>
        `;

    } else {

        warningsList.innerHTML =
            warnings
                .map(
                    warning => `
                        <div class="warning-item">
                            ⚠️ ${escapeHtml(warning)}
                        </div>
                    `
                )
                .join("");
    }


    // Extracted text
    if (combinedText && combinedText.trim()) {

        extractedText.textContent =
            combinedText.trim();

        extractedTextContainer.classList.remove(
            "hidden"
        );

    } else {

        extractedText.textContent = "";

        extractedTextContainer.classList.add(
            "hidden"
        );
    }


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function resetResult() {

    resultSection.classList.add("hidden");

    riskScore.textContent = "0%";
    riskMeter.style.width = "0%";
    riskLevel.textContent = "—";
    resultText.textContent = "—";
    resultBadge.textContent = "—";

    warningsList.innerHTML = `
        <p>
            No warnings detected.
        </p>
    `;

    extractedText.textContent = "";

    extractedTextContainer.classList.add(
        "hidden"
    );
}


// =========================================
// MANUAL JOB ANALYSIS
// =========================================

jobForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideError();
        resetResult();
        showGlobalLoading();

        const jobTitle =
            document.getElementById("jobTitle").value.trim();

        const company =
            document.getElementById("company").value.trim();

        const location =
            document.getElementById("location").value.trim();

        const salaryValue =
            document.getElementById("salary").value;

        const description =
            document.getElementById("description").value.trim();


        const salary =
            salaryValue
                ? Number(salaryValue)
                : 0;


        const jobData = {

            job_title: jobTitle,

            company: company,

            location: location,

            salary: salary,

            description: description
        };


        try {

            const response =
                await fetch(
                    `${API_URL}/predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(jobData)
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Job analysis failed."
                );
            }


            showResult(data);

        } catch (error) {

            console.error(
                "Manual analysis error:",
                error
            );

            showError(
                `Unable to analyze the job. ${error.message}`
            );

        } finally {

            hideGlobalLoading();
        }
    }
);


// =========================================
// IMAGE UPLOAD
// =========================================

selectImagesButton.addEventListener(
    "click",
    function () {

        imageInput.click();
    }
);


imageInput.addEventListener(
    "change",
    function () {

        if (!imageInput.files.length) {
            return;
        }

        addImages(
            Array.from(imageInput.files)
        );

        // Allow selecting the same file again later
        imageInput.value = "";
    }
);


// =========================================
// ADD IMAGES
// =========================================

function addImages(files) {

    const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ];


    const validFiles = files.filter(
        file =>
            validTypes.includes(file.type)
    );


    if (validFiles.length !== files.length) {

        showError(
            "Some files were skipped. Please select JPG, PNG, or WEBP images."
        );
    }


    validFiles.forEach(file => {

        const duplicate =
            selectedImages.some(
                existing =>
                    existing.name === file.name &&
                    existing.size === file.size
            );


        if (!duplicate) {

            selectedImages.push(file);
        }
    });


    updateImagePreview();
}


// =========================================
// IMAGE PREVIEW
// =========================================

function updateImagePreview() {

    imagePreviewGrid.innerHTML = "";


    if (selectedImages.length === 0) {

        imageSelectionArea.classList.add(
            "hidden"
        );

        imageCount.textContent =
            "0 images";

        return;
    }


    imageSelectionArea.classList.remove(
        "hidden"
    );


    imageCount.textContent =
        selectedImages.length === 1
            ? "1 image selected"
            : `${selectedImages.length} images selected`;


    selectedImages.forEach(
        (file, index) => {

            const preview =
                document.createElement("div");

            preview.className =
                "image-preview";


            const image =
                document.createElement("img");

            const url =
                URL.createObjectURL(file);

            image.src = url;

            image.alt =
                `Screenshot ${index + 1}`;


            image.onload = function () {

                URL.revokeObjectURL(url);
            };


            const number =
                document.createElement("div");

            number.className =
                "image-preview-number";

            number.textContent =
                index + 1;


            const removeButton =
                document.createElement("button");

            removeButton.type =
                "button";

            removeButton.className =
                "remove-image-button";

            removeButton.textContent =
                "×";

            removeButton.title =
                "Remove this screenshot";


            removeButton.addEventListener(
                "click",
                function () {

                    removeImage(index);
                }
            );


            preview.appendChild(image);
            preview.appendChild(number);
            preview.appendChild(removeButton);

            imagePreviewGrid.appendChild(
                preview
            );
        }
    );
}


// =========================================
// REMOVE SINGLE IMAGE
// =========================================

function removeImage(index) {

    if (
        index < 0 ||
        index >= selectedImages.length
    ) {
        return;
    }


    selectedImages.splice(
        index,
        1
    );


    updateImagePreview();
}


// =========================================
// CLEAR ALL IMAGES
// =========================================

clearImagesButton.addEventListener(
    "click",
    function () {

        selectedImages = [];

        imageInput.value = "";

        updateImagePreview();

        hideError();
    }
);


// =========================================
// IMAGE DRAG & DROP
// =========================================

imageDropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        imageDropZone.classList.add(
            "dragover"
        );
    }
);


imageDropZone.addEventListener(
    "dragleave",
    function () {

        imageDropZone.classList.remove(
            "dragover"
        );
    }
);


imageDropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        imageDropZone.classList.remove(
            "dragover"
        );


        const files =
            Array.from(
                event.dataTransfer.files
            );


        addImages(files);
    }
);


// =========================================
// IMAGE ANALYSIS
// =========================================

analyzeImagesButton.addEventListener(
    "click",
    async function () {

        hideError();

        resetResult();


        if (selectedImages.length === 0) {

            showError(
                "Please select at least one screenshot."
            );

            return;
        }


        setImageProcessing(
            true
        );


        try {

            /*
             * Current backend supports one image
             * per request.
             *
             * We process each selected screenshot
             * and combine the OCR text.
             */

            const results = [];


            for (
                let index = 0;
                index < selectedImages.length;
                index++
            ) {

                const file =
                    selectedImages[index];


                updateImageProcessingText(
                    index + 1,
                    selectedImages.length
                );


                const formData =
                    new FormData();


                formData.append(
                    "file",
                    file
                );


                const response =
                    await fetch(
                        `${API_URL}/analyze-image`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        `Image ${index + 1} analysis failed.`
                    );
                }


                results.push(data);
            }


            /*
             * Combine OCR text
             */

            const combinedText =
                results
                    .map(
                        (result, index) => {

                            return (
                                `--- Screenshot ${index + 1} ---\n` +
                                (
                                    result.extracted_text ||
                                    ""
                                )
                            );
                        }
                    )
                    .join("\n\n");


            /*
             * The final displayed result currently
             * comes from the last processed image.
             *
             * The backend will be upgraded next
             * so all screenshots are analyzed as
             * ONE complete job posting.
             */

            const finalResult =
                results[results.length - 1];


            showResult(
                finalResult,
                combinedText
            );


        } catch (error) {

            console.error(
                "Image analysis error:",
                error
            );


            showError(
                `Unable to analyze the screenshots. ${error.message}`
            );

        } finally {

            setImageProcessing(
                false
            );
        }
    }
);


// =========================================
// IMAGE PROCESSING UI
// =========================================

function setImageProcessing(
    processing
) {

    if (processing) {

        imageProcessingStatus.classList.remove(
            "hidden"
        );

        analyzeImagesButton.disabled =
            true;

        clearImagesButton.disabled =
            true;

        selectImagesButton.disabled =
            true;

    } else {

        imageProcessingStatus.classList.add(
            "hidden"
        );

        analyzeImagesButton.disabled =
            false;

        clearImagesButton.disabled =
            false;

        selectImagesButton.disabled =
            false;
    }
}


function updateImageProcessingText(
    current,
    total
) {

    const strong =
        imageProcessingStatus.querySelector(
            "strong"
        );

    const span =
        imageProcessingStatus.querySelector(
            "span"
        );


    if (strong) {

        strong.textContent =
            `Analyzing screenshot ${current} of ${total}...`;
    }


    if (span) {

        span.textContent =
            "Extracting text and checking the job posting.";
    }
}


// =========================================
// PDF UPLOAD
// =========================================

selectPdfButton.addEventListener(
    "click",
    function () {

        pdfInput.click();
    }
);


pdfInput.addEventListener(
    "change",
    function () {

        if (!pdfInput.files.length) {
            return;
        }

        const file =
            pdfInput.files[0];

        selectPdf(file);

        pdfInput.value = "";
    }
);


// =========================================
// SELECT PDF
// =========================================

function selectPdf(file) {

    if (
        file.type !==
        "application/pdf"
    ) {

        showError(
            "Please select a PDF file."
        );

        return;
    }


    selectedPdf = file;


    pdfFileName.textContent =
        file.name;


    pdfSelectionArea.classList.remove(
        "hidden"
    );


    hideError();
}


// =========================================
// REMOVE PDF
// =========================================

removePdfButton.addEventListener(
    "click",
    function () {

        selectedPdf = null;

        pdfInput.value = "";

        pdfSelectionArea.classList.add(
            "hidden"
        );

        hideError();
    }
);


// =========================================
// PDF DRAG & DROP
// =========================================

pdfDropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        pdfDropZone.classList.add(
            "dragover"
        );
    }
);


pdfDropZone.addEventListener(
    "dragleave",
    function () {

        pdfDropZone.classList.remove(
            "dragover"
        );
    }
);


pdfDropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        pdfDropZone.classList.remove(
            "dragover"
        );


        const files =
            Array.from(
                event.dataTransfer.files
            );


        if (!files.length) {
            return;
        }


        selectPdf(
            files[0]
        );
    }
);


// =========================================
// PDF ANALYSIS
// =========================================

analyzePdfButton.addEventListener(
    "click",
    async function () {

        hideError();

        resetResult();


        if (!selectedPdf) {

            showError(
                "Please select a PDF first."
            );

            return;
        }


        setPdfProcessing(
            true
        );


        try {

            const formData =
                new FormData();


            formData.append(
                "file",
                selectedPdf
            );


            const response =
                await fetch(
                    `${API_URL}/analyze-pdf`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "PDF analysis failed."
                );
            }


            showResult(
                data,
                data.extracted_text || ""
            );


        } catch (error) {

            console.error(
                "PDF analysis error:",
                error
            );


            showError(
                `Unable to analyze the PDF. ${error.message}`
            );

        } finally {

            setPdfProcessing(
                false
            );
        }
    }
);


// =========================================
// PDF PROCESSING UI
// =========================================

function setPdfProcessing(
    processing
) {

    if (processing) {

        pdfProcessingStatus.classList.remove(
            "hidden"
        );

        analyzePdfButton.disabled =
            true;

        removePdfButton.disabled =
            true;

        selectPdfButton.disabled =
            true;

    } else {

        pdfProcessingStatus.classList.add(
            "hidden"
        );

        analyzePdfButton.disabled =
            false;

        removePdfButton.disabled =
            false;

        selectPdfButton.disabled =
            false;
    }
}


// =========================================
// NEW ANALYSIS
// =========================================

newAnalysisButton.addEventListener(
    "click",
    function () {

        resetResult();

        hideError();

        window.scrollTo({
            top: document.getElementById(
                "analyze"
            ).offsetTop - 80,

            behavior: "smooth"
        });
    }
);


// =========================================
// INITIAL STATE
// =========================================

resetResult();

updateImagePreview();
